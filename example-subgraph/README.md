This section will guide you through deploying a subgraph for smart contract deployed 

to the XinFin Network.



1. Run a local Graph Node



In another terminal:

-  Clone Graph Node with

	$ git clone https://github.com/XinFinOrg/theGraph.git



-  Enter the Graph Node's Docker directory:

	$ cd theGraph/docker



-  This is for Linux users only. The Graph Node Docker Compose setup uses

   host.docker.internal   as the alias for the host machine. On Linux, this is not

   supported yet. In order to replace it with the host IP address, run the following  

   from the Docker directory:

	./setup.sh



-  Start a local Graph Node that will connect to XinFin Network on your host:

	$ docker-compose up -d



2. Compile and migrate your smart contract on XinFin network and copy the contract 

   address along with the block number you would require it in the next steps.

   For block number and other transaction details you can refer : 

		

		https://explorer.apothem.network/



3. Initialize the Subgraph

-  Enter the example subgraph's directory:

   cd theGraph/example-subgraph/thegraph



-  Change the Contract address and StartBlock[Block Number] details in subgraph.yaml

   	vim subgraph.yaml

-  Install dependencies of your subgraph and run the Graph CLI code generation:

	$ yarn install

        $ yarn codegen

-  Build Subgraph

	$ yarn build

-  Then, allocate the subgraph name in the Graph Node with

	$ yarn create-local

-  Lastly, run

	$ yarn deploy-local

   to deploy the subgraph to your local Graph Node.



4. Query Subgraph

-  With the subgraph deployed, you can explore the deployed GraphQL API for the 

   subgraph by issuing queries and viewing the schema by visiting the Subgraph 

   endpoints generated after deploying the subgraph.

   In the endpoint, replace the localhost with server address : 13.235.214.179 



- In the example below, the query lists details of all the registered NFTs.

 ```

 query {

  	nfts {

    	   id

    	   tokenID

    	   owner

    	   tokenURI

  	}

 } 

```

- In the following example, the query lists the details of all the history 

  of the tran

```

      query {

    	  transferTransactions {

        	    id

        	    from

        	    to

        	    tokenID

    	  }

      }

```

