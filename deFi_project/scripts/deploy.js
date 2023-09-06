const hre = require("hardhat")

async function main() {
    // Get the contract to deploy & deploy
    const Defi = await hre.ethers.getContractFactory("DeFi");
    const deFi = await Defi.deploy();
    await deFi.deployed();
    console.log("DeFi App deployed to:", deFi.address);


}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});



