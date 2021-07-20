require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.4.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ganache: {
      url: 'http://127.0.0.1:8545',
      accounts: ['0xea77b041d03462af821ed12985c07f9e214a2020356b72d5fb10c4308d42e45a']
    }
  }
};
