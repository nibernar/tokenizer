# Projet Tokenizer FortyTwo42

Guide complet pour créer et déployer votre token ERC-20 sur la blockchain Ethereum Sepolia.

## Prérequis

### Logiciels requis

1. **Node.js 22 LTS** (obligatoire - Hardhat ne supporte pas Node.js 23+)
   ```bash
   # Installer nvm (gestionnaire de versions Node.js)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Redémarrer le terminal puis :
   nvm install 22
   nvm use 22
   node --version  # Doit afficher 22.x.x
   ```

2. **MetaMask** (extension navigateur)
   - Télécharger sur https://metamask.io/
   - Créer un portefeuille de test (ne jamais utiliser votre portefeuille principal)

## Récupérer les clés API nécessaires

### 1. Clé API Alchemy

1. Créer un compte sur https://dashboard.alchemy.com/
2. Cliquer "Create New App"
3. Sélectionner "Ethereum" puis "Sepolia"
4. Copier l'URL RPC qui ressemble à :
   ```
   https://eth-sepolia.g.alchemy.com/v2/VOTRE_CLE_API
   ```
5. Extraire la partie après `/v2/` (c'est votre clé API)

### 2. Clé privée MetaMask

⚠️ **ATTENTION** : Utilisez uniquement un portefeuille de test, jamais votre portefeuille principal !

1. Dans MetaMask, cliquer sur les 3 points → "Détails du compte"
2. Cliquer "Afficher la clé privée"
3. Entrer votre mot de passe MetaMask
4. Copier la clé privée (commence par "0x")

### 3. Clé API Etherscan (optionnelle)

1. Créer un compte sur https://etherscan.io/
2. Aller dans "API Keys" → "Add"
3. Donner un nom et copier la clé générée

### 4. ETH de test Sepolia

Récupérer des ETH gratuits via ces faucets :
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://faucets.chain.link/sepolia

## Installation du projet

### 1. Initialisation

```bash
# Créer le dossier du projet
mkdir projet-fortyTwo42
cd projet-fortyTwo42

# Initialiser npm
npm init -y

# Installer Hardhat 2.x (compatible)
npm install --save-dev hardhat@^2.22.0 --legacy-peer-deps

# Initialiser Hardhat
npx hardhat init
# Choisir "Create a TypeScript project"
# Accepter tous les choix par défaut
```

### 2. Installation des dépendances

```bash
# Dépendances pour hardhat-toolbox
npm install --save-dev "@nomicfoundation/hardhat-chai-matchers@^2.0.0" "@nomicfoundation/hardhat-ethers@^3.0.0" "@nomicfoundation/hardhat-network-helpers@^1.0.0" "@typechain/ethers-v6@^0.5.0" "@typechain/hardhat@^9.0.0" "@types/chai@^4.2.0" "@types/mocha@>=9.1.0" "chai@^4.2.0" "ethers@^6.4.0" "hardhat-gas-reporter@^1.0.8" "solidity-coverage@^0.8.1" "typechain@^8.3.0" --legacy-peer-deps

# OpenZeppelin (version compatible)
npm install @openzeppelin/contracts@5.1.0 --legacy-peer-deps

# Variables d'environnement
npm install dotenv --legacy-peer-deps

# Vérification des contrats (optionnel)
npm install @nomicfoundation/hardhat-verify@^2.0.0 --legacy-peer-deps
```

## Configuration

### 1. Fichier .env

Créer un fichier `.env` à la racine :

```env
ALCHEMY_API_KEY=votre_cle_alchemy_ici
PRIVATE_KEY=0xvotre_cle_privee_metamask_ici
ETHERSCAN_API_KEY=votre_cle_etherscan_ici
```

### 2. Configuration Hardhat

Modifier `hardhat.config.ts` :

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};

export default config;
```

## Création des fichiers de code

### 1. Smart Contract

Créer `contracts/FortyTwo42.sol` :

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FortyTwo42 is ERC20, Ownable, Pausable, ReentrancyGuard {
    constructor() ERC20("FortyTwo42", "F42") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}
```

### 2. Tests

Remplacer le contenu de `test/FortyTwo42.test.ts` :

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { FortyTwo42 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FortyTwo42", function () {
  let fortyTwo42: FortyTwo42;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const FortyTwo42Factory = await ethers.getContractFactory("FortyTwo42");
    fortyTwo42 = await FortyTwo42Factory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right initial supply", async function () {
      const initialSupply = await fortyTwo42.totalSupply();
      expect(initialSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await fortyTwo42.balanceOf(owner.address);
      expect(await fortyTwo42.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Token info", function () {
    it("Should have correct name and symbol", async function () {
      expect(await fortyTwo42.name()).to.equal("FortyTwo42");
      expect(await fortyTwo42.symbol()).to.equal("F42");
    });
  });
});
```

### 3. Script de déploiement

Créer `scripts/deploy.ts` :

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const FortyTwo42Factory = await ethers.getContractFactory("FortyTwo42");
  const fortyTwo42 = await FortyTwo42Factory.deploy();

  // Attendre la confirmation de la transaction
  await fortyTwo42.waitForDeployment();

  console.log("FortyTwo42 deployed to:", await fortyTwo42.getAddress());
  console.log("Token name:", await fortyTwo42.name());
  console.log("Token symbol:", await fortyTwo42.symbol());
  console.log("Total supply:", ethers.formatEther(await fortyTwo42.totalSupply()));
  console.log("Deployer balance:", ethers.formatEther(await fortyTwo42.balanceOf(deployer.address)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Commandes de développement

### Compilation

```bash
npx hardhat compile
```

### Tests

```bash
npx hardhat test
```

### Déploiement sur Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Vérification du contrat (optionnel)

```bash
npx hardhat verify --network sepolia ADRESSE_DU_CONTRAT_DEPLOYÉ
```

## Après le déploiement

### 1. Vérifier sur Etherscan

- Aller sur https://sepolia.etherscan.io/
- Rechercher l'adresse de votre contrat
- Vérifier les transactions et le code

### 2. Ajouter le token à MetaMask

1. Dans MetaMask, s'assurer d'être sur le réseau Sepolia
2. Cliquer "Import tokens" → "Custom token"
3. Entrer l'adresse du contrat
4. Le symbole F42 et les décimales devraient apparaître automatiquement
5. Confirmer l'ajout

## Structure du projet final

```
projet-fortyTwo42/
├── contracts/
│   ├── FortyTwo42.sol
│   └── Lock.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── FortyTwo42.test.ts
├── hardhat.config.ts
├── .env
├── package.json
└── README.md
```

## Dépannage

### Problème de version Node.js
```bash
nvm use 22
```

### Erreurs de dépendances
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Contrat non trouvé après compilation
```bash
npx hardhat clean
npx hardhat compile
```

### Solde insuffisant pour le déploiement
- Utiliser les faucets Sepolia listés plus haut
- Vérifier que MetaMask est sur le réseau Sepolia

## Sécurité

- Ne jamais utiliser de vraies clés privées ou de l'ETH mainnet
- Garder le fichier `.env` privé (ajouté au `.gitignore`)
- Utiliser uniquement des portefeuilles de test
- Les faucets Sepolia fournissent de l'ETH gratuit sans valeur réelle

## Ressources

- [Documentation Hardhat](https://hardhat.org/docs)
- [Documentation OpenZeppelin](https://docs.openzeppelin.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Faucet Sepolia](https://sepoliafaucet.com/)

## Exemple de déploiement réussi

Adresse du contrat : `0x7A900E60Cb77e604bB8a04d14fec7F8E6eD50Ef0`
Réseau : Sepolia
Token : FortyTwo42 (F42)
Supply : 1,000,000 tokens