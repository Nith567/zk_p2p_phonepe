/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  84532: {
    offRampBased: {
      address: "0xeC1fD51fdB3b637983Cf056f112346ecc5e3CbAe",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "ConfirmationAddressMismatch",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "seller",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "tradeETH",
              type: "uint256",
            },
          ],
          name: "DoubleDeposit",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "seller",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "buyer",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountClaimed",
              type: "uint256",
            },
          ],
          name: "EthClaimed",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
          ],
          name: "ClaimByBuyer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
            {
              internalType: "bytes32",
              name: "txnId",
              type: "bytes32",
            },
          ],
          name: "confirmBySeller",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "sellerAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "confirmOffRamp",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "tradeETH",
              type: "uint256",
            },
          ],
          name: "doubleDeposit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "isMerchant",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "isSeller",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "schemaId",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amountPaid",
              type: "uint256",
            },
          ],
          name: "sendVerifyByBuyer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "spInstance",
          outputs: [
            {
              internalType: "contract ISP",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tradeId",
              type: "uint256",
            },
          ],
          name: "startRound",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "trades",
          outputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "addr",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "cryptoLock",
                  type: "uint256",
                },
              ],
              internalType: "struct offRampBased.Merchant",
              name: "buyer",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "addr",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "cryptoLock",
                  type: "uint256",
                },
              ],
              internalType: "struct offRampBased.Merchant",
              name: "seller",
              type: "tuple",
            },
            {
              internalType: "string",
              name: "Trx_Money",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "InrAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "extraEth",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "EthLock",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "agreed",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "Paid",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "remaningEth",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "dealDone",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
