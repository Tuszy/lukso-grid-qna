import { ethers } from "ethers";
import {
  fetchQuestionAndAnswerById,
  supportsQNAInterface,
} from "../../utils/contractUtils";
import { NextRequest } from "next/server";
import { DOMAIN, QNA_INTERFACE_ID } from "../../constants";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ contract: `0x${string}`; question: `0x${string}` }> }
) {
  const contractAddress = (await params).contract;
  if (!ethers.isAddress(contractAddress)) {
    return Response.json(
      { msg: `Invalid address ${contractAddress}` },
      { status: 400 }
    );
  }
  let questionId = (await params).question;
  if (!questionId.startsWith("0x") && !questionId.startsWith("0X")) {
    questionId = "0x" + questionId;
  }
  if (!ethers.isHexString(questionId)) {
    return Response.json(
      { msg: `Invalid question id ${questionId}` },
      { status: 400 }
    );
  }

  try {
    const isValid = await supportsQNAInterface(contractAddress);
    if (!isValid) {
      return Response.json(
        {
          msg:
            "Contract address does not support the QnA interface " +
            QNA_INTERFACE_ID,
        },
        { status: 400 }
      );
    }
  } catch (e) {
    return Response.json(
      { msg: "Invalid contract address (e.g. EOA)" },
      { status: 400 }
    );
  }

  try {
    const questionData = await fetchQuestionAndAnswerById(
      contractAddress,
      questionId
    );
    if (!questionData) {
      return Response.json(
        {
          msg: `Question id ${questionId} does not exist`,
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        LSP4Metadata: {
          name: "Question & Answer - Certificate of Authenticity",
          description: "Question & Answer - Certificate of Authenticity",
          icon: [
            {
              width: 512,
              height: 512,
              verification: {
                method: "keccak256(bytes)",
                data: "0xa15c5b9425125ac04c1b6705c39ce9a86306dda4133fa8717a128b465d004aaf",
              },
              url: "ipfs://bafkreic7s2wneuyx7aosqpjqewp7clrs5a35z76avbh7jwknfob2jdkzba",
            },
          ],
          links: [
            {
              title: "Asker",
              url: "https://universaleverything.io/" + questionData.asker,
            },
            {
              title: "Answerer",
              url: "https://universaleverything.io/" + questionData.answerer,
            },
          ],
          images: [
            [
              {
                width: 550,
                height: 500,
                url: `${DOMAIN}/${contractAddress}/${questionId}/img`,
              },
            ],
          ],
          attributes: [
            {
              key: "Asker",
              value: questionData.asker,
              type: "string",
            },
            {
              key: "Answerer",
              value: questionData.answerer,
              type: "string",
            },
            {
              key: "Reward",
              value: questionData.reward,
              type: "number",
            },
            {
              key: "AskTimestamp",
              value: questionData.askTimestamp,
              type: "number",
            },
            {
              key: "AnswerTimestamp",
              value: questionData.answerTimestamp,
              type: "number",
            },
            {
              key: "Question",
              value: questionData.question,
              type: "string",
            },
            {
              key: "Answer",
              value: questionData.answer ?? "",
              type: "string",
            },
            {
              key: "Answered",
              value: questionData.answered,
              type: "boolean",
            },
          ],
          assets: [],
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return Response.json(
      { msg: `Question id ${questionId} does not exist` },
      { status: 404 }
    );
  }
}
