import { useQuery } from "@tanstack/react-query";
import { getContract } from "../utils/contractUtils";
import { QuestionAndAnswerData } from "./useQuestion";
import { ethers } from "ethers";

export const fetchProfileQuestions = async (
  contractAddress: `0x${string}` | null,
  profileAddress: `0x${string}` | null
): Promise<QuestionAndAnswerData[]> => {
  if (!contractAddress || !profileAddress) return [];
  const questionIds = await getContract(contractAddress).tokenIdsOf(
    profileAddress
  );

  const questions = [] as QuestionAndAnswerData[];
  for (let index = 0; index < questionIds.length; index++) {
    const [
      asker,
      reward,
      askTimestamp,
      answerTimestamp,
      question,
      answer,
      answered,
    ] = await getContract(contractAddress).getQuestionAndAnswer(
      questionIds[index]
    );
    questions.push({
      id: questionIds[index],
      reward,
      question: ethers.toUtf8String(question),
      answer: ethers.toUtf8String(answer),
      answered,
      index,
      asker,
      askTimestamp,
      answerTimestamp,
    });
  }

  return questions;
};

const useProfileQuestions = (
  contractAddress: `0x${string}` | null,
  profileAddress: `0x${string}` | null
) => {
  return useQuery({
    queryKey: ["profile-questions", contractAddress, profileAddress],
    queryFn: async () =>
      await fetchProfileQuestions(contractAddress, profileAddress),
  });
};

export default useProfileQuestions;
