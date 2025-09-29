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
    // Plus besoin de .deployed() avec ethers v6
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