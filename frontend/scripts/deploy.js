// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  
  const Deal = await hre.ethers.getContractFactory("Deal");
  const deal = await Deal.deploy();

  await deal.deployed();

  console.log("Deal contract (which will be cloned) deployed to:", deal.address);

  const feeBeneficiaryAddress = "0xBb6354C590d49D8c81B2b86D3972dD0Be6976478";
  const DealFactory = await hre.ethers.getContractFactory("DealFactory");
  const dealFactory = await hre.upgrades.deployProxy(DealFactory, [deal.address, feeBeneficiaryAddress], { initializer: 'initialize' });
  await dealFactory.deployed();

  console.log("Upgradable DealFactory deployed to:", dealFactory.address);

  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy("Simple Token", "SMPL", 10000);
  await simpleToken.deployed();

  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
      await simpleToken.transfer(account.address, BigInt(100 * Math.pow(10, 18)));
  }
  console.log("SimpleToken deployed to:", simpleToken.address);

  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  const simpleNft = await SimpleNFT.deploy("Simple NFT", "SNFT", 100);
  await simpleNft.deployed();
  sender = accounts[0];
  for (const [tokenId, account] of accounts.slice(1,).entries()) {
      await simpleNft.transferFrom(sender.address, account.address, tokenId + 1);
  }
  console.log("SimpleNFT deployed to:", simpleNft.address);

  const addresses = {
    'Deal': deal.address,
    'DealFactory': dealFactory.address,
    'SimpleToken': simpleToken.address,
    'SimpleNFT': simpleNft.address
  };
  const json = JSON.stringify(addresses);

  const directory = "src/artifacts/deployment-info/";
  const filename = "DeploymentState.json";
  fs.mkdirSync(directory, {recursive: true});
  fs.writeFileSync(directory + filename, json, 'utf8');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
