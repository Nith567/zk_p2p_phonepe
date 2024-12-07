// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract filBuilderScore is FunctionsClient, ConfirmedOwner {
	using FunctionsRequest for FunctionsRequest.Request;
	bytes32 public s_lastRequestId;
	bytes public s_lastResponse;
	bytes public s_lastError;
	string public characters;

	address public deployer;
	uint256 public price;
	string private cid;
	uint256 public totalPurchases;
	uint256 public builderScore;

	mapping(address => bool) public hasAccess;

	// Unique identifier for the Chainlink DON
	bytes32 private constant donID =
		0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000;
	// Router address for Sepolia
	address private constant router =
		0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C;

	// Callback gas limit
	uint32 private constant gasLimit = 300000;

	error ConfirmationAddressMismatch();
	error UnexpectedRequestID(bytes32 requestId);
	address builder;
	mapping(address => bool) public isbuyed;
	mapping(bytes32 => uint256) private requestIdToTradeId;
	mapping(address => uint256) BuyerScore;
	mapping(bytes32 => address) requestchainlinkfunction;

	constructor(
		string memory _cid,
		uint256 _price
	) FunctionsClient(router) ConfirmedOwner(msg.sender) {
		deployer = msg.sender;
		cid = _cid;
		price = _price;
		totalPurchases = 0;
	}

	function purchaseAccess() public payable returns (string memory) {
		if (price != 0 && !hasAccess[msg.sender]) {
			require(
				msg.value >= price,
				"must pay with price with above or equal"
			);
			payable(deployer).transfer(msg.value);
			totalPurchases += 1;
		}
		hasAccess[msg.sender] = true;
		return cid;
	}

	function isActive(address userAddress) public view returns (int256) {
		if (hasAccess[userAddress]) {
			return 1;
		} else {
			return 0;
		}
	}

	function transferownership() public {
		require(
			BuyerScore[msg.sender] >= builderScore,
			"Insufficient builder score to transfer ownership"
		);
		builder = msg.sender;
	}

	string private constant source =
		"const characterId = args[0];"
		"const apiResponse = await Functions.makeHttpRequest({"
		"url: `https://api.talentprotocol.com/api/v2/passports/${walletAddress}/`, "
		"headers: { "
		"Authorization: Bearer 120725ec3104ed5864767332fb49dc86"
		"}"
		"});"
		"if (apiResponse.error) {"
		"return Functions.encodeString('Error: ' + apiResponse.error.message);"
		"}"
		"const { data } = apiResponse;"
		"const score = data.passport.score;"
		"return Functions.encodeString(score);";

	function sendRequest(
		uint64 subscriptionId,
		string[] calldata args
	) external returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source);
		if (args.length > 0) req.setArgs(args);
		s_lastRequestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);

		requestchainlinkfunction[s_lastRequestId] = msg.sender;
		return s_lastRequestId;
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
		address buyer = requestchainlinkfunction[requestId];

		BuyerScore[buyer] = extractAmount(string(response));
		s_lastResponse = response;
		s_lastError = err;
	}
}
