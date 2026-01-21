import { expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import {
  MockERC20,
  TipPool,
} from '../typechain-types';

describe("TipPool", function () {
  let tipPool: TipPool;
  let mockUSDC: MockERC20;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy(ethers.parseUnits("1000000", 6)) as MockERC20; // 1M tokens
    await mockUSDC.waitForDeployment();

    // Mint to addr1 for testing
    await mockUSDC.transfer(addr1.address, ethers.parseUnits("1000", 6));

    const minPayout = ethers.parseUnits("1", 6); // 1 USDC
    const TipPoolFactory = await ethers.getContractFactory("TipPool");
    tipPool = await TipPoolFactory.deploy(await mockUSDC.getAddress(), minPayout) as TipPool;
    await tipPool.waitForDeployment();
  });

  it("should receive USDC tips", async function () {
    // addr1 approves and tips
    await mockUSDC.connect(addr1).approve(await tipPool.getAddress(), ethers.parseUnits("1", 6));
    await tipPool.connect(addr1).tip(ethers.parseUnits("1", 6));

    const balance = await tipPool.getBalance();
    expect(balance).to.equal(ethers.parseUnits("1", 6));
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

    // Tip 2 USDC
    await mockUSDC.connect(owner).approve(await tipPool.getAddress(), ethers.parseUnits("2", 6));
    await tipPool.connect(owner).tip(ethers.parseUnits("2", 6));

    const initialBal1 = await mockUSDC.balanceOf(addr1.address);
    const initialBal2 = await mockUSDC.balanceOf(addr2.address);

    await tipPool.distribute();

    const finalBal1 = await mockUSDC.balanceOf(addr1.address);
    const finalBal2 = await mockUSDC.balanceOf(addr2.address);

    expect(finalBal1 - initialBal1).to.equal(ethers.parseUnits("1", 6));
    expect(finalBal2 - initialBal2).to.equal(ethers.parseUnits("1", 6));
    expect(await tipPool.getBalance()).to.equal(0n);
  });
});
