// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";

contract offRampBased is FunctionsClient, ConfirmedOwner {
	using FunctionsRequest for FunctionsRequest.Request;

	//ISP public spInstance; //0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD
	ISP public spInstance = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
	uint64 public schemaId;

	// State variables to store the last request ID, response, and error
	bytes32 public s_lastRequestId;
	bytes public s_lastResponse;
	bytes public s_lastError;
	string public characters;

	// Unique identifier for the Chainlink DON
	bytes32 private constant donID =
		0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000;
	// Price feed address for ETH/USD
	address private constant priceFeedAddress =
		0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165;
	// Router address for Sepolia
	address private constant router =
		0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C;

	// Callback gas limit
	uint32 private constant gasLimit = 300000;

	error ConfirmationAddressMismatch();
	error UnexpectedRequestID(bytes32 requestId);

	// Mappings to store trade details and role-based access
	mapping(uint256 => Trade) public trades;
	mapping(address => bool) public isMerchant;
	mapping(address => bool) public isSeller;
	mapping(bytes32 => uint256) private requestIdToTradeId;

	// Structures to store trade-related data
	struct Merchant {
		address addr;
		uint256 cryptoLock;
	}

	struct Trade {
		Merchant buyer;
		Merchant seller;
		string Trx_Money;
		uint256 InrAmount;
		uint256 EthLock;
		uint256 INR_Paid_to_Seller;
		bytes32 s_lastRequestId;
		bool agreed;
	}

	// Events to log actions
	event CHAR(string ans);
	event attestationEvent(uint64 id);
	event Response(
		bytes32 indexed requestId,
		string character,
		bytes response,
		bytes err
	);
	event EthClaimed(
		address indexed seller,
		address indexed buyer,
		uint256 tradeId,
		uint256 amountClaimed
	);
	constructor() FunctionsClient(router) ConfirmedOwner(msg.sender) {}
	function setSchemaID(uint64 schemaId_) external onlyOwner {
		schemaId = schemaId_;
	}

	modifier onlyParticipant(uint256 tradeId) {
		require(
			trades[tradeId].buyer.addr == msg.sender ||
				trades[tradeId].seller.addr == msg.sender,
			"Not authorized or trade not agreed"
		);
		_;
	}

	modifier OnlySeller(uint256 tradeId) {
		require(
			trades[tradeId].seller.addr == msg.sender,
			"you are not the authorized seller to claim"
		);
		_;
	}

	function buyer(address _buyer) external {
		isMerchant[_buyer] = true;
	}

	function seller(address _seller) external {
		isSeller[_seller] = true;
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

	function startRound(
		uint256 tradeId
	) external payable onlyParticipant(tradeId) {
		require(
			msg.value == trades[tradeId].EthLock,
			"Incorrect ETH amount sent by seller"
		);
		// trades[tradeId].EthLock = tradeETH;
		trades[tradeId].InrAmount = getPrice(trades[tradeId].EthLock);
	}
	function submitProposalOffRAMP(uint256 tradeId, uint256 tradeETH) external {
		trades[tradeId].seller = Merchant(msg.sender, tradeETH);
		trades[tradeId].EthLock = tradeETH;
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
				trades[tradeId].EthLock,
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
			emit attestationEvent(attestationId);
			trades[tradeId].agreed = true;
			trades[tradeId].buyer = Merchant(
				msg.sender,
				trades[tradeId].EthLock
			);
			return attestationId; //for this attestationid -> both parties match modifier
		} else {
			revert ConfirmationAddressMismatch();
		}
	}

	function claim(uint256 tradeId) external payable OnlySeller(tradeId) {
		Trade storage trade = trades[tradeId];
		uint256 amount = trade.EthLock;
		require(amount > 0, "No ETH available to claim");
		require(
			trades[tradeId].INR_Paid_to_Seller > trades[tradeId].InrAmount * 83,
			"you didnt transfer enough funds to your seller"
		);
		trade.EthLock = 0;
		(bool success, ) = payable(trades[tradeId].buyer.addr).call{
			value: amount
		}("");
		require(success, "Failed to send Ether to seller");
		emit EthClaimed(
			trades[tradeId].buyer.addr,
			trades[tradeId].seller.addr,
			tradeId,
			amount
		);
	}

	function sendRequest(
		uint256 tradeId,
		uint64 subscriptionId,
		string[] calldata args
	) external OnlySeller(tradeId) returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source);
		if (args.length > 0) req.setArgs(args);
		s_lastRequestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
		requestIdToTradeId[s_lastRequestId] = tradeId;
		trades[tradeId].s_lastRequestId = s_lastRequestId;
		return s_lastRequestId;
	}

	function Read(
		uint256 tradeId
	)
		public
		view
		returns (
			address buyerAddress,
			uint256 buyerCryptoLock,
			address sellerAddress,
			uint256 sellerCryptoLock,
			string memory trxMoney,
			uint256 inrAmount,
			uint256 ethLock,
			uint256 INR_Paid_to_Seller,
			bytes32 lastRequestId,
			bool agreed
		)
	{
		Trade storage trade = trades[tradeId];
		return (
			trade.buyer.addr,
			trade.buyer.cryptoLock,
			trade.seller.addr,
			trade.seller.cryptoLock,
			trade.Trx_Money,
			trade.InrAmount,
			trade.EthLock,
			trade.INR_Paid_to_Seller,
			trade.s_lastRequestId,
			trade.agreed
		);
	}

	function extractAmount(
		string memory input
	) internal pure returns (uint256) {
		bytes memory inputBytes = bytes(input);
		uint256 colonIndex = 0;
		for (uint256 i = 0; i < inputBytes.length; i++) {
			if (inputBytes[i] == ":") {
				colonIndex = i;
				break;
			}
		}
		bytes memory amountBytes = new bytes(colonIndex);
		for (uint256 i = 0; i < colonIndex; i++) {
			amountBytes[i] = inputBytes[i];
		}
		return stringToUint(string(amountBytes));
	}

	function stringToUint(string memory s) internal pure returns (uint256) {
		bytes memory b = bytes(s);
		uint256 result = 0;
		for (uint256 i = 0; i < b.length; i++) {
			if (b[i] >= 0x30 && b[i] <= 0x39) {
				result = result * 10 + (uint256(uint8(b[i])) - 48);
			}
		}
		return result;
	}

	// Callback function for fulfilling a request
	function fulfillRequest(
		bytes32 requestId,
		bytes memory response,
		bytes memory err
	) internal override {
		if (s_lastRequestId != requestId) {
			revert UnexpectedRequestID(requestId); // Check if request IDs match
		}

		uint256 tradeId = requestIdToTradeId[requestId];
		trades[tradeId].Trx_Money = string(response);
		trades[tradeId].INR_Paid_to_Seller = extractAmount(
			trades[tradeId].Trx_Money
		);
		s_lastResponse = response;
		s_lastError = err;
		emit Response(
			requestId,
			trades[tradeId].Trx_Money,
			s_lastResponse,
			s_lastError
		);
	}

	// Inline JavaScript source code for the Chainlink request
	string private constant source =
		"const characterId = args[0];"
		"const characterId2 = args[1];"
		"const apiResponse = await Functions.makeHttpRequest({"
		"url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${characterId}/`, "
		"headers: { "
		"Authorization: `Bearer ${characterId2}`"
		"}"
		"});"
		"if (apiResponse.error) {"
		"return Functions.encodeString('Error: ' + apiResponse.error.message);"
		"}"
		"const { data } = apiResponse;"
		"const snippet = data.snippet;"
		"const amountRegex = /(?:\\u20B9\\s?|Paid to\\s?\\w+\\s?\\w+\\s?\\u20B9\\s?)(\\d+)/;"
		"const txnIdRegex = /Txn\\.\\s?ID\\s?:\\s?(\\w+)/;"
		"const amountMatch = snippet.match(amountRegex);"
		"const amount = amountMatch ? amountMatch[1] : 'Amount not found';"
		"const txnIdMatch = snippet.match(txnIdRegex);"
		"const txnId = txnIdMatch ? txnIdMatch[1] : 'Txn ID not found';"
		"return Functions.encodeString(amount + ':' + txnId);";
}
