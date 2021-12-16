const express = require("express");
const fetch = require("node-fetch");

const {
  createProxyMiddleware,
  responseInterceptor,
  fixRequestBody,
} = require("http-proxy-middleware");

const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 8083;
const DEBUG = process.env.DEBUG === "true" ? true : false;
const URL = process.env.URL || "http://rpc.apothem.network";

app.use(express.json());
app.use(cors());

const traverseObjRec = (obj) => {
  const mapValue = (value) => {
    if (typeof value === "string" && /^xdc/.test(value)) {
      return value.replace(/^xdc/, "0x");
    }

    if (typeof value === "object") {
      return traverseObjRec(value);
    }

    return value;
  };

  if (obj instanceof Array) {
    return obj.map(mapValue);
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, mapValue(value)])
    );
  }

  return obj;
};

const processResp_getTransactionReceipt = async (data) => {
  if (!data.result) {
    return data;
  }

  const blockHash = data.result.blockHash;

  if (!blockHash) {
    return data;
  }

  if (!data.result.logs) {
    return data;
  }

  data.result.logs = data.result.logs.map((log) => ({ ...log, blockHash }));

  return data;
};

const processResp_getLogs = async (data) => {
  if (!data.result) {
    return data;
  }

  data.result = await Promise.all(
    data.result.map(async (log) => {
      const { blockNumber } = log;

      if (!blockNumber) {
        return log;
      }

      const blockRespRaw = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBlockByNumber",
          params: [blockNumber, false],
          id: 1,
        }),
      });

      const blockResp = await blockRespRaw.json();

      if (!blockResp.result || !blockResp.result.hash) {
        return log;
      }

      return { ...log, blockHash: blockResp.result.hash };
    })
  );

  return data;
};

const processResp = async (req, res) => {
  const method = req.method;

  let data;
  switch (method) {
    case "eth_getTransactionReceipt":
      data = await processResp_getTransactionReceipt(res);
      break;

    case "eth_getLogs":
      data = await processResp_getLogs(res);
      break;

    default:
      data = res;
      break;
  }

  return data;
};

app.use(
  "/",
  createProxyMiddleware({
    target: URL,
    selfHandleResponse: true,
    secure: false,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      const bodyContent = req.body;

      if (
        ["eth_getTransactionCount", "eth_call"].includes(bodyContent.method) &&
        bodyContent.params[1] === "pending"
      ) {
        bodyContent.params[1] = "latest";
      }

      return fixRequestBody(proxyReq, req, res);
    },
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const resStr = responseBuffer.toString("utf8");

        let data;
        try {
          data = JSON.parse(resStr);
        } catch (e) {
          data = {};
          return JSON.stringify(data);
        }

        data = traverseObjRec(data);

        if (data instanceof Array) {
          data = await Promise.all(
            data.map((singleResp, i) => processResp(req.body[i], singleResp))
          );
        } else {
          data = await processResp(req.body, data);
        }

        if (DEBUG) {
          console.log("req", JSON.stringify(req.body));
          // console.log("res", JSON.stringify(data));
        }

        return JSON.stringify(data);
      }
    ),
  })
);

app.listen(PORT, () => {
  console.log(
    `XinFin JSON-RPC Compatibility Proxy listening at http://localhost:${PORT}`
  );
});
