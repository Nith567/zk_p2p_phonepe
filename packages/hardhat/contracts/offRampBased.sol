// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";

contract offRampBased {
	address private constant priceFeedAddress =
		0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;
	error ConfirmationAddressMismatch();

	event EthClaimed(
		address indexed seller,
		address indexed buyer,
		uint256 tradeId,
		uint256 amountClaimed
	);

	struct Merchant {
		address addr;
		uint256 cryptoLock;
	}
	struct Trade {
		Merchant buyer;
		Merchant seller;
		string Trx_Money;
		uint256 InrAmount;
		uint256 extraEth;
		uint256 EthLock;
		bool agreed;
		bool Paid;
		uint256 remaningEth;
		bool dealDone;
	}
	ISP public spInstance = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
	uint64 public schemaId = 777;
	mapping(uint256 => Trade) public trades;
	mapping(address => bool) public isMerchant;
	mapping(address => bool) public isSeller;
	mapping(bytes32 => uint256) private requestIdToTradeId;

	constructor() {}

	function addressToUint256(address _addr) private pure returns (uint256) {
		return uint256(uint160(_addr));
	}

	function confirmOffRamp(
		address sellerAddress,
		uint256 tradeId,
		bytes memory _data
	) external returns (uint64) {
		address partyB = msg.sender;
		if (trades[tradeId].seller.addr == sellerAddress) {
			bytes[] memory recipients = new bytes[](2);
			recipients[0] = abi.encode(sellerAddress);
			recipients[1] = abi.encode(partyB);
			bytes memory data = abi.encode(
				sellerAddress,
				partyB,
				trades[tradeId].seller.cryptoLock,
				_data
			);
			Attestation memory a = Attestation({
				schemaId: schemaId,
				linkedAttestationId: 0,
				attestTimestamp: 0,
				revokeTimestamp: 0,
				attester: address(this),
				validUntil: 0,
				dataLocation: DataLocation.ONCHAIN,
				revoked: false,
				recipients: recipients,
				data: data
			});
			uint64 attestationId = spInstance.attest(a, "", "", "");
			trades[tradeId].agreed = true;
			trades[tradeId].EthLock = trades[tradeId].seller.cryptoLock;
			trades[tradeId].buyer = Merchant(
				msg.sender,
				trades[tradeId].EthLock
			);
			return attestationId; //for this attestationid -> both parties match modifier
		} else {
			revert ConfirmationAddressMismatch();
		}
	}

	function sendVerifyByBuyer(uint256 tradeId, uint256 amountPaid) public {
		//proof from the buyer with rupees
		//here buyer sends payment through phonepe and make zk proof->
		//require() statement needed
		uint256 rupeee;
		require(
			amountPaid >= getPrice(trades[tradeId].EthLock),
			"Amount must be more than or equal to INR Amount"
		);
		trades[tradeId].Paid = true;
	}

	//enter tnxid by the seller and take your half of amount money -:)and you got your money in your bank+remaming eth(x2) in your wallet
	//the original-x amount went to buyer
	function confirmBySeller(uint256 tradeId, bytes32 txnId) external {
		//enter private tnxID and check , verify from the buyer rom signals array bit
		//if yes then
		uint256 halfEth = trades[tradeId].EthLock / 2;
		require(halfEth > 0, "[Error]: No sufficient ETH to claim");
		payable(msg.sender).transfer(halfEth);
		trades[tradeId].dealDone == true;
	}

	function ClaimByBuyer(uint256 tradeId) external {
		require(
			trades[tradeId].dealDone,
			"seller didnt entered/invalid output"
		);
		payable(msg.sender).transfer(trades[tradeId].remaningEth);
	}

	modifier OnlySeller(uint256 tradeId) {
		require(
			trades[tradeId].seller.addr == msg.sender,
			"you are not the authorized seller to claim"
		);
		_;
	}
	function getPrice(uint256 LockETH) internal view returns (uint256) {
		AggregatorV3Interface priceFeed = AggregatorV3Interface(
			priceFeedAddress
		);
		(, int256 price, , , ) = priceFeed.latestRoundData();
		require(price > 0, "Invalid price from oracle");
		uint256 ethPriceInUsd = uint256(price) * 1e10; // Adjust price for precision
		uint256 usdValue = (LockETH * ethPriceInUsd) / 1e36; // Convert ETH to USD
		return usdValue;
	}

	modifier onlyBuyer(uint256 tradeId) {
		require(
			trades[tradeId].buyer.addr == msg.sender,
			"you are not the authorized seller to claim"
		);
		_;
	}
	event DoubleDeposit(
		uint256 indexed tradeId,
		address indexed seller,
		uint256 tradeETH
	);

	function doubleDeposit(uint256 tradeId, uint256 tradeETH) external {
		trades[tradeId].seller = Merchant(msg.sender, tradeETH);
		emit DoubleDeposit(tradeId, msg.sender, tradeETH);
	}

	function startRound(uint256 tradeId) external payable {
		uint256 requiredETH = trades[tradeId].EthLock;
		uint256 doubledETH = requiredETH * 2;
		// Ensure the seller pays double the required ETH amount later can withdraw other half of it :-)
		require(
			msg.value == doubledETH,
			"Incorrect ETH amount sent by seller into contract, must be double the required ETH"
		);
		trades[tradeId].extraEth = doubledETH - requiredETH;
	}
}
