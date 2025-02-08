// Crypto
import { BigNumberish, BytesLike, ethers } from "ethers";

// Provider
import { JSON_RPC_PROVIDER, QNA_INTERFACE_ID } from "../constants";

// Contract
import Qna from "../contracts/QuestionAndAnswer.json";
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";

export interface QuestionAndAnswerData {
  id: BytesLike;
  reward: BigNumberish;
  question: string;
  answer: string;
  answered: boolean;
  asker: `0x${string}`;
  answerer: `0x${string}`;
  askTimestamp: BigNumberish;
  answerTimestamp: BigNumberish;
}

export const fetchOwnerOfQNAContractAddress = async (
  address: `0x${string}`
): Promise<`0x${string}` | null> => await getContract(address).owner();

export const supportsQNAInterface = async (
  address: `0x${string}`
): Promise<boolean> =>
  await getContract(address).supportsInterface(QNA_INTERFACE_ID);

export const getContract = (contractAddress: `0x${string}`) =>
  new ethers.Contract(contractAddress, Qna.abi, JSON_RPC_PROVIDER);

export const getProfileContract = (profileContractAddress: `0x${string}`) =>
  new ethers.Contract(
    profileContractAddress,
    LSP0ERC725Account.abi,
    JSON_RPC_PROVIDER
  );

export const fetchQuestionAndAnswerById = async (
  contractAddress: `0x${string}`,
  questionId: BytesLike
): Promise<QuestionAndAnswerData | null> => {
  const [
    asker,
    reward,
    askTimestamp,
    answerTimestamp,
    question,
    answer,
    answered,
  ] = await getContract(contractAddress).getQuestionAndAnswer(questionId);
  const answerer = await getContract(contractAddress).owner();

  return {
    id: questionId,
    reward: Number(reward),
    question: ethers.toUtf8String(question),
    answer: ethers.toUtf8String(answer),
    answered,
    asker,
    answerer,
    askTimestamp: Number(askTimestamp),
    answerTimestamp: Number(answerTimestamp),
  };
};
