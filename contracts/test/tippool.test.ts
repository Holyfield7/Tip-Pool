import { ethers } from "hardhat";
import { expect } from "chai";
import { TipPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TipPool", function () {
  let tipPool: TipPool;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const minPayout = ethers.parseEther("1.0");
    const TipPoolFactory = await ethers.getContractFactory("TipPool");
    tipPool = await TipPoolFactory.deploy(minPayout) as TipPool;
    await tipPool.waitForDeployment();
  });

  it("should receive CRO tips", async function () {
    await addr1.sendTransaction({
      to: await tipPool.getAddress(),
      value: ethers.parseEther("1"),
    });

    const balance = await tipPool.getBalance();
    expect(balance).to.equal(ethers.parseEther("1"));
  });

  it("should allow owner to set recipients", async function () {
    const addresses = [addr1.address, addr2.address];
    const bps = [6000, 4000]; // 60% and 40%

    await tipPool.setRecipients(addresses, bps);

    const [retAddrs, retBps] = await tipPool.getRecipients();
    expect(retAddrs[0]).to.equal(addr1.address);
    expect(retAddrs[1]).to.equal(addr2.address);
    expect(retBps[0]).to.equal(6000n);
    expect(retBps[1]).to.equal(4000n);
  });

  it("should distribute funds when threshold is met", async function () {
    // Set recipients
    await tipPool.setRecipients([addr1.address, addr2.address], [5000, 5000]);

    // Tip 2 CRO
    await owner.sendTransaction({
      to: await tipPool.getAddress(),
      value: ethers.parseEther("2"),
    });

    const initialBal1 = await ethers.provider.getBalance(addr1.address);
    const initialBal2 = await ethers.provider.getBalance(addr2.address);

    await tipPool.distribute();

    const finalBal1 = await ethers.provider.getBalance(addr1.address);
    const finalBal2 = await ethers.provider.getBalance(addr2.address);

    expect(finalBal1 - initialBal1).to.equal(ethers.parseEther("1"));
    expect(finalBal2 - initialBal2).to.equal(ethers.parseEther("1"));
    expect(await tipPool.getBalance()).to.equal(0n);
  });
});
