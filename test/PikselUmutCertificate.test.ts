// test/PikselUmutCertificate.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * PikselUmutCertificate — Üretim Sertifikası NFT testleri.
 * Mint → cüzdanda NFT, erişim ödemesi → sahibe telif, çekim, ERC-2981, devir.
 */
describe("PikselUmutCertificate", () => {
  async function deploy() {
    const [owner, creator, reader, buyer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PikselUmutCertificate");
    // platform %2.5, ikincil telif %5
    const contract = await Factory.deploy(250, 500, owner.address);
    await contract.waitForDeployment();
    return { contract, owner, creator, reader, buyer };
  }

  it("ders üretince üreticinin cüzdanına NFT basar", async () => {
    const { contract, creator } = await deploy();
    await contract
      .connect(creator)
      .mintCertificate("QmTest", ethers.parseEther("0.01"), "İlkokul", "Matematik", "Kesirler");

    expect(await contract.ownerOf(1)).to.equal(creator.address);
    expect(await contract.balanceOf(creator.address)).to.equal(1n);
    const c = await contract.certificates(1);
    expect(c.creator).to.equal(creator.address);
    expect(c.stage).to.equal("İlkokul");
    expect(c.subject).to.equal("Matematik");
  });

  it("tokenURI on-chain base64 JSON döndürür", async () => {
    const { contract, creator } = await deploy();
    await contract
      .connect(creator)
      .mintCertificate("QmCid", ethers.parseEther("0"), "Lise", "Fizik", "Newton");
    const uri = await contract.tokenURI(1);
    expect(uri).to.match(/^data:application\/json;base64,/);
  });

  it("erişim ödemesi NFT sahibinin telifine eklenir, çekilebilir", async () => {
    const { contract, creator, reader } = await deploy();
    const price = ethers.parseEther("0.1");
    await contract
      .connect(creator)
      .mintCertificate("QmTest", price, "İlkokul", "Türkçe", "Okuma");

    await contract.connect(reader).accessContent(1, { value: price });

    // %2.5 platform → %97.5 üreticiye
    const expected = (price * 9750n) / 10000n;
    expect(await contract.withdrawableRoyalty(creator.address)).to.equal(expected);
    expect(await contract.hasAccess(1, reader.address)).to.equal(true);

    await expect(contract.connect(creator).withdraw()).to.changeEtherBalance(
      creator,
      expected,
    );
  });

  it("ERC-2981 ikincil telifi ilk üreticiye gider", async () => {
    const { contract, creator } = await deploy();
    await contract
      .connect(creator)
      .mintCertificate("QmTest", 0, "Akademik", "Tez", "Metodoloji");
    const sale = ethers.parseEther("1");
    const [receiver, amount] = await contract.royaltyInfo(1, sale);
    expect(receiver).to.equal(creator.address);
    expect(amount).to.equal((sale * 500n) / 10000n); // %5
  });

  it("NFT devredilince erişim geliri yeni sahibe akar", async () => {
    const { contract, creator, buyer, reader } = await deploy();
    const price = ethers.parseEther("0.2");
    await contract
      .connect(creator)
      .mintCertificate("QmTest", price, "Lise", "Kimya", "Asitler");

    // üretici NFT'yi buyer'a devreder
    await contract
      .connect(creator)
      .transferFrom(creator.address, buyer.address, 1);
    expect(await contract.ownerOf(1)).to.equal(buyer.address);

    // sonraki erişim geliri yeni sahibe (buyer) gider
    await contract.connect(reader).accessContent(1, { value: price });
    const expected = (price * 9750n) / 10000n;
    expect(await contract.withdrawableRoyalty(buyer.address)).to.equal(expected);
    expect(await contract.withdrawableRoyalty(creator.address)).to.equal(0n);
  });

  it("aynı kullanıcı iki kez erişemez", async () => {
    const { contract, creator, reader } = await deploy();
    const price = ethers.parseEther("0.05");
    await contract
      .connect(creator)
      .mintCertificate("QmTest", price, "Ortaokul", "Fen", "Hücre");
    await contract.connect(reader).accessContent(1, { value: price });
    await expect(
      contract.connect(reader).accessContent(1, { value: price }),
    ).to.be.revertedWithCustomError(contract, "AlreadyHasAccess");
  });

  // --- "Bir Çocuğa Ders Hediye Et" bağış havuzu ---

  it("bağış havuza eklenir, bağışçı bazında sayılır", async () => {
    const { contract, buyer } = await deploy();
    const amt = ethers.parseEther("1");
    await expect(
      contract.connect(buyer).donate("Depremzede çocuklar için", { value: amt }),
    )
      .to.emit(contract, "Donated")
      .withArgs(buyer.address, amt, "Depremzede çocuklar için");

    expect(await contract.donationPool()).to.equal(amt);
    expect(await contract.totalDonated()).to.equal(amt);
    expect(await contract.donatedBy(buyer.address)).to.equal(amt);
  });

  it("boş bağış reddedilir", async () => {
    const { contract, buyer } = await deploy();
    await expect(
      contract.connect(buyer).donate("", { value: 0 }),
    ).to.be.revertedWithCustomError(contract, "EmptyDonation");
  });

  it("havuzdan üreticiye ödül aktarılır; içerik ücretsiz kalır", async () => {
    const { contract, owner, creator, buyer } = await deploy();
    // içerik ÜCRETSİZ (accessPrice = 0) — herkese açık
    await contract
      .connect(creator)
      .mintCertificate("QmFree", 0, "İlkokul", "Türkçe", "Okuma");

    const gift = ethers.parseEther("2");
    await contract.connect(buyer).donate("Bir çocuğa armağan", { value: gift });

    // yönetim, havuzdan üreticiyi ödüllendirir
    const reward = ethers.parseEther("0.5");
    await expect(contract.connect(owner).sponsorCreator(1, reward))
      .to.emit(contract, "CreatorSponsored")
      .withArgs(1, creator.address, reward);

    expect(await contract.donationPool()).to.equal(gift - reward);
    expect(await contract.lessonSponsorship(1)).to.equal(reward);
    expect(await contract.withdrawableRoyalty(creator.address)).to.equal(reward);

    // üretici ödülünü çeker
    await expect(contract.connect(creator).withdraw()).to.changeEtherBalance(
      creator,
      reward,
    );
  });

  it("havuzdan fazlası aktarılamaz", async () => {
    const { contract, owner, creator, buyer } = await deploy();
    await contract.connect(creator).mintCertificate("Qm", 0, "Lise", "Fizik", "X");
    await contract.connect(buyer).donate("x", { value: ethers.parseEther("0.1") });
    await expect(
      contract.connect(owner).sponsorCreator(1, ethers.parseEther("1")),
    ).to.be.revertedWithCustomError(contract, "InsufficientPool");
  });

  it("sponsorCreator yalnızca yönetim tarafından çağrılır", async () => {
    const { contract, creator, buyer } = await deploy();
    await contract.connect(creator).mintCertificate("Qm", 0, "Lise", "Fizik", "X");
    await contract.connect(buyer).donate("x", { value: ethers.parseEther("1") });
    await expect(
      contract.connect(buyer).sponsorCreator(1, ethers.parseEther("0.1")),
    ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
  });
});
