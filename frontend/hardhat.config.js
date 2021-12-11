// These includes are needed to add to the Hardhat object
// e.g. to use hre.upgrades in deploy script
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');

const { getFirebaseDoc, writeFirebaseDoc, fbCreateDeal, fbInvest } = require("./hardhatFirebaseUtils.js");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("getState", "Prints state of current deals", async(taskArgs, hre) => {
    const fs = require('fs');
    const contractAddressesPath = hre.config.paths.artifacts + "/deployment-info/DeploymentState.json";
    if (!fs.existsSync(contractAddressesPath)) {
        console.log("File not found:", contractAddressesPath);
        console.log("Please deploy contracts!");
        return;
    }

    let contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath));

    const Deal = await ethers.getContractFactory("Deal");
    const DealFactory = await ethers.getContractFactory("DealFactory");
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    let dealFactory = await DealFactory.attach(contractAddresses.DealFactory);
    let simpleToken = await SimpleToken.attach(contractAddresses.SimpleToken);
   
    state = {"contractAddresses": contractAddresses,
             "dealFactory": dealFactory,
             "simpleToken": simpleToken};
    return state;
});

task("printState", "Prints state of current deals", async(taskArgs, hre) => {
    let state = await hre.run("getState");
    console.log("Initial deployed contracts:", state.contractAddresses);

    // Cannot query all deals from the contract alone, need Firebase now and use printDealState
    /*
    const deals = await state.dealFactory.getDeals();
    console.log("Deals (" + deals.length + "):", deals);
    for (const dealAddr of deals) {
        await hre.run("printDealState", { "address": dealAddr });
    }
    */

    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        let balance = parseInt(await state.simpleToken.balanceOf(account.address));
        console.log("Account=" + account.address, "==>", "Simple Token Balance=" + balance);
    }
});

task("printDealState", "Prints state of current deal")
    .addParam("address", "The deal's contract address")
    .setAction(async (taskArgs, hre) => {
    let state = await hre.run("getState");
    const SimpleToken = await ethers.getContractFactory("SimpleToken");

    const Deal = await ethers.getContractFactory("Deal");
    let deal = await Deal.attach(taskArgs.address);
    let dealTokenBalance = parseInt(await state.simpleToken.balanceOf(taskArgs.address));

    let startup = await deal.startup();
    let startupTokenBalance = parseInt(await state.simpleToken.balanceOf(startup));

    let investorInfo = await deal.getInvestors();
    let investors = investorInfo._investors;
    let investedAmounts = investorInfo._amounts.map(x => parseInt(x));
    let investorTokenBalances = (await Promise.all(investors.map(async x => state.simpleToken.balanceOf(x)))).map(x => parseInt(x));
    
    let json = {
                "dealAddress": taskArgs.address,
                "dealTokenBalance": dealTokenBalance,
                "startupToken": await deal.startupToken(),
                "minInvestmentAmount": parseInt(await deal.minInvestmentAmount()),
                "maxInvestmentAmount": parseInt(await deal.maxInvestmentAmount()),
                "expiryDate": parseInt(await deal.expiryDate()),
                "startup": startup,
                "startupTokenBalance": startupTokenBalance,
                "investors": investors,
                "investedAmounts": investedAmounts,
                "investorTokenBalances": investorTokenBalances
               };
    console.log(json);
});

task("updateFirebaseState", "Initializes (overwrites!) specified Firebase collection with metadata and misc test documents. Just for testing purposes")
    .addParam("collection", "The Firebase collection name e.g. kapil-local")
    .setAction(async (taskArgs, hre) => {
    let state = await hre.run("getState");
    // let x = await getFirebaseDoc(taskArgs.collection, "metadata");
    let metadata = { deal_addr: state.contractAddresses.Deal,
                     dealFactory_addr: state.contractAddresses.DealFactory };
    await writeFirebaseDoc(taskArgs.collection, "metadata", metadata);

    const path = hre.config.paths.artifacts + "/deployment-info/DeploymentState.json"
    state["firebaseCollection"] = taskArgs.collection
    const fs = require('fs');
    fs.writeFileSync(path, JSON.stringify(state), 'utf8');
});

task("configureForTestnet", "Points web app to the ropsten firebase collection")
    .setAction(async (taskArgs, hre) => {
    const path = hre.config.paths.artifacts + "/deployment-info/DeploymentState.json"
    const state = {
      "firebaseCollection": "ropsten"
    }
    const fs = require('fs');
    fs.writeFileSync(path, JSON.stringify(state), 'utf8');
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ropsten: require('../secrets/ropsten_infura.json')
  }
};
