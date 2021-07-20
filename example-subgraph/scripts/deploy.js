const main = async () => {
    const [deployer] = await ethers.getSigners();

    console.log(
      "Deploying contracts with the account:",
      deployer.address
    );
    
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const ERC721 = await ethers.getContractFactory("GameItem");
    const erc721 = await ERC721.deploy();
  
    console.log("ERC721 contract address:", erc721.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });