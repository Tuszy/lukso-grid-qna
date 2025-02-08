// Crypto
import { Interface } from "ethers";

// ABI
import { abi as LSP0ERC725AccountABI } from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import { abi as LSP6KeyManagerABI } from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import { abi as QuestionAndAnswerABI } from "../artifacts/contracts/QuestionAndAnswer.sol/QuestionAndAnswer.json";

// Util
import { getInterfaceId } from "./util";

export const LSP0ERC725AccountABIInterface = new Interface(
  LSP0ERC725AccountABI
);
export const LSP6KeyManagerInterface = new Interface(LSP6KeyManagerABI);
export const QuestionAndAnswerInterface = new Interface(QuestionAndAnswerABI);

export const INTERFACE_ID_OF_QUESTION_AND_ANSWER = "0xcdc5f2fd"; // TODO DT

export const interfaceIdOfQnA = getInterfaceId(QuestionAndAnswerInterface);
console.log("QuestionAndAnswer ERC165 Interface ID:", interfaceIdOfQnA);
