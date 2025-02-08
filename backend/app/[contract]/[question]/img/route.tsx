// Image
import { ImageResponse } from "next/og";

// Crypto
import { ethers } from "ethers";

// Sharp
import sharp from "sharp";

// Data
import {
  fetchQuestionAndAnswerById,
  supportsQNAInterface,
} from "@/app/utils/contractUtils";
import { fetchContextProfile, fetchProfile } from "@/app/utils/profileUtils";

// Components
import Messages from "@/app/components/Messages";
import MessageBubble from "@/app/components/MessageBubble";
import { NextRequest } from "next/server";

const compressArrayBuffer = async (
  arrayBuffer: ArrayBuffer
): Promise<ArrayBuffer> => {
  const buffer = Buffer.from(arrayBuffer);
  const compressedBuffer = await sharp(buffer).jpeg({ quality: 65 }).toBuffer();
  return new Uint8Array(compressedBuffer).buffer;
};

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ contract: `0x${string}`; question: `0x${string}` }> }
) {
  const contractAddress = (await params).contract;
  if (!ethers.isAddress(contractAddress)) {
    return Response.json(
      { error: "Invalid contract address" },
      {
        status: 400,
      }
    );
  }

  let questionId = (await params).question;
  if (!questionId.startsWith("0x") && !questionId.startsWith("0X")) {
    questionId = "0x" + questionId;
  }
  if (!ethers.isHexString(questionId)) {
    return Response.json(
      { error: "Invalid question id" },
      {
        status: 400,
      }
    );
  }

  try {
    if (!(await supportsQNAInterface(contractAddress))) {
      return Response.json(
        { error: "Contract address does not support Q&A interface id" },
        {
          status: 400,
        }
      );
    }
  } catch (e) {
    return Response.json(
      { error: "Invalid contract address type" },
      {
        status: 400,
      }
    );
  }

  try {
    const questionData = await fetchQuestionAndAnswerById(
      contractAddress,
      questionId
    );
    if (!questionData) {
      return Response.json(
        { error: "Failed to fetch question data" },
        {
          status: 400,
        }
      );
    }

    const contextProfile = await fetchContextProfile(contractAddress);
    if (!contextProfile) {
      return Response.json(
        { error: "Failed to fetch context profile" },
        {
          status: 400,
        }
      );
    }

    const profile = await fetchProfile(questionData.asker);
    if (!profile) {
      return Response.json(
        { error: "Failed to fetch profile data" },
        {
          status: 400,
        }
      );
    }

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: contextProfile.qnaContract.config?.bg,
            overflow: "hidden",
          }}
        >
          <div tw="flex flex-grow rounded-lg">
            <Messages backgroundColor={contextProfile.qnaContract.config?.bg}>
              <MessageBubble
                profile={profile}
                colorConfig={contextProfile.qnaContract.config}
                anchor={"right"}
                reward={questionData.reward}
              >
                {questionData.question}
              </MessageBubble>
              {questionData.answered ? (
                <MessageBubble
                  profile={contextProfile}
                  colorConfig={contextProfile.qnaContract.config}
                  anchor={"left"}
                >
                  {questionData.answer}
                </MessageBubble>
              ) : null}
            </Messages>
          </div>
        </div>
      ),
      { width: 500, height: 450 }
    );
    const arrayBuffer = await imageResponse.arrayBuffer();
    const compressedImage = await compressArrayBuffer(arrayBuffer);

    const headers = new Headers();
    headers.set("Content-Type", "image/jpeg");
    headers.set(
      "Cache-Control",
      "public, immutable, no-transform, max-age=31536000"
    );
    return new Response(compressedImage, {
      status: 200,
      statusText: "OK",
      headers,
    });
  } catch (e) {
    console.log(e);
    return Response.json(
      { error: e?.toString() },
      {
        status: 400,
      }
    );
  }
}
