// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title  RoyaltyDistributor — Piksel ve Umut
 * @notice Erişim-bazlı (access-based) telif dağıtımı.
 *         Üretici içeriğini kaydeder; okuyucu erişim ücreti öder; ücret
 *         (platform payı düşülerek) üreticinin "çekilebilir" bakiyesine eklenir.
 *         Üretici dilediği zaman pull-payment ile telifini çeker.
 * @dev    Güvenlik: ReentrancyGuard + Checks-Effects-Interactions + pull
 *         payment + custom errors + platform ücret tavanı.
 */
contract RoyaltyDistributor is Ownable, ReentrancyGuard {
    // --- Sabitler ---
    uint96 public constant BPS_DENOMINATOR = 10_000;
    uint96 public constant MAX_FEE_BPS = 1_000; // %10 tavan

    // --- Durum ---
    uint96 public platformFeeBps; // örn. 250 = %2.5
    uint256 public platformBalance;
    uint256 public nextContentId = 1;

    struct Content {
        address creator;
        uint256 accessPrice; // wei
        bool active;
        string cid; // IPFS CID
    }

    mapping(uint256 => Content) public contents;
    mapping(uint256 => mapping(address => bool)) public hasAccess;

    mapping(address => uint256) private _withdrawable;
    mapping(address => uint256) private _totalEarned;

    // --- Olaylar ---
    event ContentRegistered(
        uint256 indexed contentId,
        address indexed creator,
        uint256 accessPrice,
        string cid
    );
    event AccessPriceUpdated(uint256 indexed contentId, uint256 newPrice);
    event ContentActiveSet(uint256 indexed contentId, bool active);
    event AccessPurchased(
        uint256 indexed contentId,
        address indexed reader,
        address indexed creator,
        uint256 amount
    );
    event RoyaltyWithdrawn(address indexed creator, uint256 amount);
    event PlatformFeeUpdated(uint96 newFeeBps);
    event PlatformWithdrawn(address indexed to, uint256 amount);

    // --- Hatalar ---
    error InvalidFee();
    error UnknownContent();
    error NotCreator();
    error ContentInactive();
    error AlreadyHasAccess();
    error InsufficientPayment();
    error NothingToWithdraw();
    error TransferFailed();

    constructor(uint96 _platformFeeBps, address initialOwner)
        Ownable(initialOwner)
    {
        if (_platformFeeBps > MAX_FEE_BPS) revert InvalidFee();
        platformFeeBps = _platformFeeBps;
    }

    // ------------------------------------------------------------------
    // Üretici işlemleri
    // ------------------------------------------------------------------

    /// @notice Yeni içerik kaydeder ve contentId döndürür.
    function registerContent(string calldata cid, uint256 accessPrice)
        external
        returns (uint256 contentId)
    {
        contentId = nextContentId++;
        contents[contentId] = Content({
            creator: msg.sender,
            accessPrice: accessPrice,
            active: true,
            cid: cid
        });
        emit ContentRegistered(contentId, msg.sender, accessPrice, cid);
    }

    /// @notice İçeriğin erişim ücretini günceller (yalnızca üretici).
    function setAccessPrice(uint256 contentId, uint256 newPrice) external {
        Content storage c = _ownedContent(contentId);
        c.accessPrice = newPrice;
        emit AccessPriceUpdated(contentId, newPrice);
    }

    /// @notice İçeriği aktif/pasif yapar (yalnızca üretici).
    function setActive(uint256 contentId, bool active) external {
        Content storage c = _ownedContent(contentId);
        c.active = active;
        emit ContentActiveSet(contentId, active);
    }

    // ------------------------------------------------------------------
    // Okuyucu işlemleri — erişim-bazlı dağıtım
    // ------------------------------------------------------------------

    /// @notice Erişim ücretini ödeyerek içeriğe erişim satın alır.
    function accessContent(uint256 contentId)
        external
        payable
        nonReentrant
    {
        Content storage c = contents[contentId];
        if (c.creator == address(0)) revert UnknownContent();
        if (!c.active) revert ContentInactive();
        if (hasAccess[contentId][msg.sender]) revert AlreadyHasAccess();
        if (msg.value < c.accessPrice) revert InsufficientPayment();

        uint256 fee = (msg.value * platformFeeBps) / BPS_DENOMINATOR;
        uint256 creatorShare = msg.value - fee;

        // Effects (Interactions yok — pull payment)
        hasAccess[contentId][msg.sender] = true;
        _withdrawable[c.creator] += creatorShare;
        _totalEarned[c.creator] += creatorShare;
        platformBalance += fee;

        emit AccessPurchased(contentId, msg.sender, c.creator, msg.value);
    }

    // ------------------------------------------------------------------
    // Telif çekimi (pull payment)
    // ------------------------------------------------------------------

    function withdrawableRoyalty(address creator)
        external
        view
        returns (uint256)
    {
        return _withdrawable[creator];
    }

    function totalEarned(address creator) external view returns (uint256) {
        return _totalEarned[creator];
    }

    /// @notice Birikmiş telifi çeker. Reentrancy'e karşı güvenli.
    function withdraw() external nonReentrant {
        uint256 amount = _withdrawable[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        _withdrawable[msg.sender] = 0; // Effects önce
        (bool ok, ) = payable(msg.sender).call{value: amount}(""); // Interaction sonra
        if (!ok) revert TransferFailed();

        emit RoyaltyWithdrawn(msg.sender, amount);
    }

    // ------------------------------------------------------------------
    // Yönetim
    // ------------------------------------------------------------------

    function setPlatformFee(uint96 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
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

    function _ownedContent(uint256 contentId)
        private
        view
        returns (Content storage c)
    {
        c = contents[contentId];
        if (c.creator == address(0)) revert UnknownContent();
        if (c.creator != msg.sender) revert NotCreator();
    }
}
