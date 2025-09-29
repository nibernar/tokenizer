import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Début du déploiement FortyTwo42...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📍 Déploiement avec le compte:", deployer.address);
  console.log("💰 Balance du compte:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const FortyTwo42Factory = await ethers.getContractFactory("FortyTwo42");
  const fortyTwo42 = await FortyTwo42Factory.deploy();

  await fortyTwo42.waitForDeployment();
  const contractAddress = await fortyTwo42.getAddress();

  const name = await fortyTwo42.name();
  const symbol = await fortyTwo42.symbol();
  const totalSupply = await fortyTwo42.totalSupply();
  const deployerBalance = await fortyTwo42.balanceOf(deployer.address);

  console.log("✅ Déploiement terminé avec succès!");
  console.log("📍 Contrat déployé à:", contractAddress);
  console.log("🏷️ Nom du token:", name);
  console.log("🎯 Symbole:", symbol);
  console.log("📊 Supply totale:", ethers.formatEther(totalSupply));
  console.log("💰 Balance du déployeur:", ethers.formatEther(deployerBalance));
  console.log("⛽ Gas utilisé dans la transaction");
  
  // Lien Etherscan pour Sepolia
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 11155111n) {
    console.log(`🔍 Voir sur Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }
}

main().catch((error) => {
  console.error("❌ Erreur lors du déploiement:", error);
  process.exitCode = 1;
});