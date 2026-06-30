// test/RoyaltyDistributor.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RoyaltyDistributor", () => {
  async function deploy() {
    const [owner, creator, reader] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("RoyaltyDistributor");
    const contract = await Factory.deploy(250, owner.address); // %2.5
    await contract.waitForDeployment();
    return { contract, owner, creator, reader };
  }

  it("içerik kaydeder ve creator atar", async () => {
    const { contract, creator } = await deploy();
    await contract
      .connect(creator)
      .registerContent("QmTest", ethers.parseEther("0.01"));
    const c = await contract.contents(1);
    expect(c.creator).to.equal(creator.address);
    expect(c.active).to.equal(true);
  });

  it("erişim ücretini üreticiye (platform payı düşülerek) yazar", async () => {
    const { contract, creator, reader } = await deploy();
    const price = ethers.parseEther("0.1");
    await contract.connect(creator).registerContent("QmTest", price);

    await contract.connect(reader).accessContent(1, { value: price });

    // %2.5 platform → creator payı %97.5
    const expected = (price * 9750n) / 10000n;
    expect(await contract.withdrawableRoyalty(creator.address)).to.equal(
      expected,
    );
    expect(await contract.hasAccess(1, reader.address)).to.equal(true);
  });

  it("eksik ödemeyi reddeder", async () => {
    const { contract, creator, reader } = await deploy();
    await contract
      .connect(creator)
      .registerContent("QmTest", ethers.parseEther("0.1"));
    await expect(
      contract
        .connect(reader)
        .accessContent(1, { value: ethers.parseEther("0.05") }),
    ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
  });

  it("üretici telifini çekebilir, bakiye sıfırlanır", async () => {
    const { contract, creator, reader } = await deploy();
    const price = ethers.parseEther("1");
    await contract.connect(creator).registerContent("QmTest", price);
    await contract.connect(reader).accessContent(1, { value: price });

    await expect(contract.connect(creator).withdraw()).to.emit(
      contract,
      "RoyaltyWithdrawn",
    );
    expect(await contract.withdrawableRoyalty(creator.address)).to.equal(0n);
  });

  it("bakiye yokken çekimi reddeder", async () => {
    const { contract, creator } = await deploy();
    await expect(
      contract.connect(creator).withdraw(),
    ).to.be.revertedWithCustomError(contract, "NothingToWithdraw");
  });

  it("platform ücret tavanını (%10) aşmayı reddeder", async () => {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("RoyaltyDistributor");
    await expect(
      Factory.deploy(1500, owner.address),
    ).to.be.revertedWithCustomError(Factory, "InvalidFee");
  });
});
