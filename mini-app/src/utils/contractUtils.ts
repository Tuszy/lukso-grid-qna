// Crypto
import { ethers } from "ethers";

// Provider
import { JSON_RPC_PROVIDER, QNA_FACTORY_CONTRACT_ADDRESS } from "../constants";

// Contract
import QnaFactory from "../json/QuestionAndAnswerFactory.json";
import Qna from "../json/QuestionAndAnswer.json";
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";

export const fetchQnaContractAddress = async (
  address: `0x${string}` | null
): Promise<`0x${string}` | null> => {
  if (!address) return null;

  const qnaContractFactory = new ethers.Contract(
    QNA_FACTORY_CONTRACT_ADDRESS,
    QnaFactory.abi,
    JSON_RPC_PROVIDER
  );

  const qnaContractAddress = await qnaContractFactory.QuestionAndAnswerMapping(
    address
  );

  return qnaContractAddress === ethers.ZeroAddress ? null : qnaContractAddress;
};

export const getContract = (contractAddress: `0x${string}`) =>
  new ethers.Contract(contractAddress, Qna.abi, JSON_RPC_PROVIDER);

export const getProfileContract = (profileContractAddress: `0x${string}`) =>
  new ethers.Contract(
    profileContractAddress,
    LSP0ERC725Account.abi,
    JSON_RPC_PROVIDER
  );
