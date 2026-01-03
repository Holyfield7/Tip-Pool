import { ethers } from "hardhat";
import { expect } from "chai";

describe("TipPool", function () {
  let tipPool: any;
  let token: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("devUSDC.e", "USDC", 6);
    await token.deployed();

    // Deploy TipPool
    const TipPool = await ethers.getContractFactory("TipPool");
    tipPool = await TipPool.deploy(token.address);
    await tipPool.deployed();
  });

  it("should receive CRO tips", async function () {
    await addr1.sendTransaction({
      to: tipPool.address,
      value: ethers.parseEther("1"),
    });
    const balance = await tipPool.croBalance(addr1.address);
    expect(balance).to.equal(ethers.parseEther("1"));
  });

  it("should receive token tips", async function () {
    await token.mint(addr1.address, 1000);
    await token.connect(addr1).approve(tipPool.address, 1000);
    await tipPool.connect(addr1).tipWithToken(1000);

    const balance = await tipPool.tokenBalance(addr1.address);
    expect(balance).to.equal(1000);
  });
});
