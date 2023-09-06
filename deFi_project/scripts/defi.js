const hre = require("hardhat");

// Returns the Ether balance of a given address
// This is where you see the power of ethers and hardhat are in play. the provider acts as the node, it acts as a communication with the blockchain you are talking to.
// one of the features of utils in ethers is to take in a BigInteger and it spits out a human readable version of that Biginteger 
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
// printBalances calls getBalance but on multiple addresses so that way we can easily print out multiple addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
// we pull out all the fields that we care about

async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy & deploy
  const Defi = await hre.ethers.getContractFactory("DeFi");
  const deFi = await Defi.deploy();
  await deFi.deployed();
  console.log("DeFi App deployed to:", deFi.address);

  // Check balances before the donations sent.
  const addresses = [owner.address, tipper.address, deFi.address];
  console.log("== Start ==");
  await printBalances(addresses);


  // Send some donations.
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await deFi.connect(tipper).sendETH("Zain", "You're the best", tip);
  await deFi.connect(tipper2).sendETH("Nate", "Amazing, go get some coffee", tip);
  await deFi.connect(tipper3).sendETH("Luke", "I love what you are doing", tip);


  // Check balances after donations received.
  console.log("== Donations Received ==");
  await printBalances(addresses);

  // Withdraw funds.
  await deFi.connect(owner).withDrawTips();

  // Check balance after withdraw.
  console.log("== Withdraw Donations ==");
  await printBalances(addresses);

  // Read all the memos
  console.log("== memos ==");
  const memos = await deFi.getMemos();
  printMemos(memos);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});








