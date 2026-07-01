// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title  PikselUmutCertificate — "Üretim Sertifikası"
 * @notice Her üretilen eğitim içeriği, üreticinin cüzdanına basılan bir
 *         ERC-721 NFT'dir (cüzdanın "NFT'ler" sekmesinde görünür). NFT;
 *         içeriğin IPFS CID'sini, üreticisini ve kademe/ders meta verisini
 *         DEĞİŞTİRİLEMEZ biçimde taşır = kanıtlanabilir üretim + sahiplik.
 *
 *         Okuyucular erişim ücretini öder; ücret (platform payı düşülerek)
 *         o anki NFT SAHİBİNİN çekilebilir bakiyesine eklenir (pull payment).
 *         NFT devredilirse gelecekteki gelir yeni sahibe gider — gerçek mülkiyet.
 *
 *         ERC-2981: ikincil pazaryeri satışlarında üreticiye otomatik telif payı.
 *
 * @dev    Güvenlik: ReentrancyGuard + Checks-Effects-Interactions + pull
 *         payment + custom errors + ücret tavanı. tokenURI tamamen ON-CHAIN
 *         (base64 JSON) — ayrı meta veri pinlemeye gerek yok.
 */
contract PikselUmutCertificate is
    ERC721,
    IERC2981,
    Ownable,
    ReentrancyGuard
{
    using Strings for uint256;

    // --- Sabitler ---
    uint96 public constant BPS_DENOMINATOR = 10_000;
    uint96 public constant MAX_FEE_BPS = 1_000; // %10 tavan

    // --- Durum ---
    uint96 public platformFeeBps; // erişim ücretinden platform payı (örn. 250 = %2.5)
    uint96 public secondaryRoyaltyBps; // ERC-2981 ikincil satış telifi (örn. 500 = %5)
    uint256 public platformBalance;
    uint256 public nextTokenId = 1;

    struct Certificate {
        address creator; // ilk üretici (telif alıcısı — ERC-2981)
        uint256 accessPrice; // wei
        bool active;
        string cid; // IPFS içerik CID'si
        string stage; // kademe (Kreş … Akademik)
        string subject; // ders / alan
        string title; // kısa başlık
        uint64 mintedAt;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => mapping(address => bool)) public hasAccess;

    mapping(address => uint256) private _withdrawable;
    mapping(address => uint256) private _totalEarned;

    // --- "Bir Çocuğa Ders Hediye Et" bağış havuzu ---
    // İçerik HERKESE AÇIK ve ÜCRETSİZDİR; para çocuğun erişimini değil,
    // üreticinin emeğini ödüllendirir. Bağışçı (devlet/STK/hayırsever/okul)
    // havuza katkı yapar; havuz, kaliteli içerik üreten öğretmenlere akar.
    uint256 public donationPool; // dağıtılmayı bekleyen toplam bağış
    uint256 public totalDonated; // tarihsel toplam bağış
    uint256 public totalSponsored; // havuzdan üreticilere aktarılan toplam
    mapping(address => uint256) public donatedBy; // bağışçı → toplam katkı
    mapping(uint256 => uint256) public lessonSponsorship; // tokenId → aldığı ödül

    // --- Olaylar ---
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 accessPrice,
        string cid,
        string stage,
        string subject
    );
    event AccessPriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    event ContentActiveSet(uint256 indexed tokenId, bool active);
    event AccessPurchased(
        uint256 indexed tokenId,
        address indexed reader,
        address indexed beneficiary,
        uint256 amount
    );
    event RoyaltyWithdrawn(address indexed account, uint256 amount);
    event Donated(address indexed donor, uint256 amount, string dedication);
    event CreatorSponsored(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 amount
    );
    event PlatformFeeUpdated(uint96 newFeeBps);
    event SecondaryRoyaltyUpdated(uint96 newBps);
    event PlatformWithdrawn(address indexed to, uint256 amount);

    // --- Hatalar ---
    error InvalidFee();
    error UnknownToken();
    error NotCreator();
    error ContentInactive();
    error AlreadyHasAccess();
    error InsufficientPayment();
    error NothingToWithdraw();
    error TransferFailed();
    error EmptyDonation();
    error InsufficientPool();

    constructor(
        uint96 _platformFeeBps,
        uint96 _secondaryRoyaltyBps,
        address initialOwner
    ) ERC721("Piksel ve Umut Sertifikasi", "PUC") Ownable(initialOwner) {
        if (_platformFeeBps > MAX_FEE_BPS) revert InvalidFee();
        if (_secondaryRoyaltyBps > MAX_FEE_BPS) revert InvalidFee();
        platformFeeBps = _platformFeeBps;
        secondaryRoyaltyBps = _secondaryRoyaltyBps;
    }

    // ------------------------------------------------------------------
    // Üretim — her ders bir NFT
    // ------------------------------------------------------------------

    /// @notice İçeriği NFT olarak üreticinin cüzdanına basar; tokenId döndürür.
    function mintCertificate(
        string calldata cid,
        uint256 accessPrice,
        string calldata stage,
        string calldata subject,
        string calldata title
    ) external returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        certificates[tokenId] = Certificate({
            creator: msg.sender,
            accessPrice: accessPrice,
            active: true,
            cid: cid,
            stage: stage,
            subject: subject,
            title: title,
            mintedAt: uint64(block.timestamp)
        });

        _safeMint(msg.sender, tokenId); // cüzdanın NFT sekmesinde belirir
        emit CertificateMinted(tokenId, msg.sender, accessPrice, cid, stage, subject);
    }

    function setAccessPrice(uint256 tokenId, uint256 newPrice) external {
        _onlyCreator(tokenId);
        certificates[tokenId].accessPrice = newPrice;
        emit AccessPriceUpdated(tokenId, newPrice);
    }

    function setActive(uint256 tokenId, bool active) external {
        _onlyCreator(tokenId);
        certificates[tokenId].active = active;
        emit ContentActiveSet(tokenId, active);
    }

    // ------------------------------------------------------------------
    // Erişim — ücret o anki NFT sahibine gider
    // ------------------------------------------------------------------

    function accessContent(uint256 tokenId) external payable nonReentrant {
        Certificate storage c = certificates[tokenId];
        if (c.creator == address(0)) revert UnknownToken();
        if (!c.active) revert ContentInactive();
        if (hasAccess[tokenId][msg.sender]) revert AlreadyHasAccess();
        if (msg.value < c.accessPrice) revert InsufficientPayment();

        address beneficiary = ownerOf(tokenId); // gelir güncel sahibe
        uint256 fee = (msg.value * platformFeeBps) / BPS_DENOMINATOR;
        uint256 share = msg.value - fee;

        hasAccess[tokenId][msg.sender] = true;
        _withdrawable[beneficiary] += share;
        _totalEarned[beneficiary] += share;
        platformBalance += fee;

        emit AccessPurchased(tokenId, msg.sender, beneficiary, msg.value);
    }

    // ------------------------------------------------------------------
    // Telif çekimi (pull payment)
    // ------------------------------------------------------------------

    function withdrawableRoyalty(address account) external view returns (uint256) {
        return _withdrawable[account];
    }

    function totalEarned(address account) external view returns (uint256) {
        return _totalEarned[account];
    }

    function withdraw() external nonReentrant {
        uint256 amount = _withdrawable[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        _withdrawable[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit RoyaltyWithdrawn(msg.sender, amount);
    }

    // ------------------------------------------------------------------
    // "Bir Çocuğa Ders Hediye Et" — bağış havuzu
    // ------------------------------------------------------------------

    /// @notice Havuza bağış yap. İçerik herkese ücretsiz açık kalır; bağış
    ///         kaliteli üretimi ödüllendirmek için birikir. `dedication`
    ///         bağışın ithaf notudur (örn. "Depremzede çocuklar için").
    function donate(string calldata dedication) external payable {
        if (msg.value == 0) revert EmptyDonation();
        donationPool += msg.value;
        totalDonated += msg.value;
        donatedBy[msg.sender] += msg.value;
        emit Donated(msg.sender, msg.value, dedication);
    }

    /// @notice Yönetim, havuzdan bir dersin üreticisine ödül aktarır.
    ///         (İleride kalite/erişim ölçütlü otomatik dağıtıma bağlanabilir.)
    function sponsorCreator(uint256 tokenId, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        Certificate storage c = certificates[tokenId];
        if (c.creator == address(0)) revert UnknownToken();
        if (amount == 0 || amount > donationPool) revert InsufficientPool();

        donationPool -= amount;
        totalSponsored += amount;
        lessonSponsorship[tokenId] += amount;
        _withdrawable[c.creator] += amount;
        _totalEarned[c.creator] += amount;

        emit CreatorSponsored(tokenId, c.creator, amount);
    }

    // ------------------------------------------------------------------
    // ERC-2981 — ikincil satış telifi (ilk üreticiye)
    // ------------------------------------------------------------------

    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        Certificate storage c = certificates[tokenId];
        if (c.creator == address(0)) revert UnknownToken();
        receiver = c.creator;
        royaltyAmount = (salePrice * secondaryRoyaltyBps) / BPS_DENOMINATOR;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // ------------------------------------------------------------------
    // ON-CHAIN tokenURI — cüzdan/pazaryeri burayı okur
    // ------------------------------------------------------------------

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        Certificate storage c = certificates[tokenId];
        if (c.creator == address(0)) revert UnknownToken();

        string memory image = string(
            abi.encodePacked("ipfs://", c.cid)
        );

        string memory json = string(
            abi.encodePacked(
                '{"name":"', c.title,
                ' #', tokenId.toString(),
                '","description":"Piksel ve Umut Uretim Sertifikasi. Bu NFT, egitim iceriginin uretimini ve telif sahipligini kanitlar. Bilgiyi ozgurlestir, uretene hakkini ver.",',
                '"image":"', image, '",',
                '"attributes":[',
                '{"trait_type":"Kademe","value":"', c.stage, '"},',
                '{"trait_type":"Ders","value":"', c.subject, '"},',
                '{"trait_type":"Uretici","value":"', Strings.toHexString(uint160(c.creator), 20), '"},',
                '{"trait_type":"IPFS","value":"', c.cid, '"}',
                ']}'
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    // ------------------------------------------------------------------
    // Yönetim
    // ------------------------------------------------------------------

    function setPlatformFee(uint96 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    function setSecondaryRoyalty(uint96 newBps) external onlyOwner {
        if (newBps > MAX_FEE_BPS) revert InvalidFee();
        secondaryRoyaltyBps = newBps;
        emit SecondaryRoyaltyUpdated(newBps);
    }

    function withdrawPlatform() external onlyOwner nonReentrant {
        uint256 amount = platformBalance;
        if (amount == 0) revert NothingToWithdraw();
        platformBalance = 0;
        (bool ok, ) = payable(owner()).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit PlatformWithdrawn(owner(), amount);
    }

    // ------------------------------------------------------------------
    // Dahili
    // ------------------------------------------------------------------

    function _onlyCreator(uint256 tokenId) private view {
        Certificate storage c = certificates[tokenId];
        if (c.creator == address(0)) revert UnknownToken();
        if (c.creator != msg.sender) revert NotCreator();
    }
}
