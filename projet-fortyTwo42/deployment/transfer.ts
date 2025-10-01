import { ethers } from "hardhat";

async function main() {
  const [sender] = await ethers.getSigners();
  const contractAddress = "0x7A900E60Cb77e604bB8a04d14fec7F8E6eD50Ef0";
  const recipientAddress = "0x...";
  const amount = ethers.parseEther("100");
  const token = await ethers.getContractAt("FortyTwo42", contractAddress);
  const tx = await token.transfer(recipientAddress, amount);
  await tx.wait();
  
  console.log(`Envoyé ${ethers.formatEther(amount)} F42 à ${recipientAddress}`);
  console.log(`Transaction: ${tx.hash}`);
}

main().catch(console.error);