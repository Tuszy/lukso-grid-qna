import { useQuery } from "@tanstack/react-query";
import { BigNumberish, BytesLike, ethers } from "ethers";
import { getContract } from "../utils/contractUtils";

export interface QuestionAndAnswerData {
  id: BytesLike;
  index: BigNumberish;
  reward: BigNumberish;
  question: string;
  answer: string;
  answered: boolean;
  asker: `0x${string}`;
  askTimestamp: BigNumberish;
  answerTimestamp: BigNumberish;
}

export const fetchQuestionAndAnswerById = async (
  contractAddress: `0x${string}` | null,
  questionId: BytesLike,
  index: BigNumberish
): Promise<QuestionAndAnswerData | null> => {
  if (!contractAddress) return null;
  const [
    asker,
    reward,
    askTimestamp,
    answerTimestamp,
    question,
    answer,
    answered,
  ] = await getContract(contractAddress).getQuestionAndAnswer(questionId);

  return {
    id: questionId,
    index,
    reward,
    question: ethers.toUtf8String(question),
    answer: ethers.toUtf8String(answer),
    answered,
    asker,
    askTimestamp,
    answerTimestamp,
  };
};

export const fetchQuestionAndAnswerByIndex = async (
  contractAddress: `0x${string}` | null,
  questionIndex: BigNumberish
): Promise<QuestionAndAnswerData | null> => {
  if (!contractAddress) return null;
  try {
    const questionId = await getContract(contractAddress).tokenAt(
      questionIndex
    );

    return await fetchQuestionAndAnswerById(
      contractAddress,
      questionId,
      questionIndex
    );
  } catch (e) {
    console.log(`Fetching question by index ${questionIndex} failed (${e})`);
    return null;
  }
};

const useQuestion = (
  contractAddress: `0x${string}` | null,
  index: BigNumberish
) => {
  return useQuery({
    queryKey: ["question", contractAddress, index],
    queryFn: async () =>
      await fetchQuestionAndAnswerByIndex(contractAddress, index),
  });
};

export default useQuestion;
