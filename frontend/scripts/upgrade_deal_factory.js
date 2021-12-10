const hre = require('hardhat');
const fs = require('fs');

async function main () {
  const contractAddressesPath = hre.config.paths.artifacts + "/deployment-info/DeploymentState.json";
  if (!fs.existsSync(contractAddressesPath)) {
      console.log("File not found:", contractAddressesPath);
      console.log("Please deploy contracts - no DealFactory to upgrqde!");
      console.log("Very possible that you did deploy but a hardhat function call nuked the artifacts. Just hard-code the dealfactory address pls!");
      return;
  }

  let contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath));

  const DealFactoryNew = await hre.ethers.getContractFactory("DealFactory");
  console.log('Upgrading DealFactory...');
  await hre.upgrades.upgradeProxy(contractAddresses.DealFactory, DealFactoryNew);
  console.log('DealFactory upgraded');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
