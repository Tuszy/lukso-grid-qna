// React
import { useCallback } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Provider
import { JSON_RPC_PROVIDER } from "../constants";
import { useUpProvider } from "../context/UpProvider";
import { ContextProfile } from "./useContextProfile";

// Interface
import QuestionAndAnswer from "../json/QuestionAndAnswer.json";

// Hooks
import { QuestionAndAnswerData } from "./useQuestion";

// Ethers
import { ethers, TransactionReceipt } from "ethers";

// QueryClient
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "react-toastify";

const useAnswerFunction = ({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) => {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();
  const navigate = useNavigate();

  return useCallback(
    async (answer: string, questionData: QuestionAndAnswerData) => {
      if (
        !upContext.walletConnected ||
        !upContext.isConnectedToContextAccount ||
        !questionData ||
        questionData?.answered ||
        answer.length === 0
      ) {
        return;
      }

      upContext.setIsWaitingForTx(true);
      const owner = upContext.accounts[0] as `0x${string}`;

      const contract = new ethers.Contract(
        contextProfile.qnaContract.address!,
        QuestionAndAnswer.abi,
        upContext.client
      );

      const answerAsBytes = ethers.toUtf8Bytes(answer);

      const data: string = contract.interface.encodeFunctionData("answer", [
        questionData!.id,
        answerAsBytes,
      ]);

      const updatePromise = new Promise((resolve, reject) => {
        console.log("Starting to send answer...");
        upContext.client
          .sendTransaction({
            account: owner,
            to: contextProfile.qnaContract.address,
            data,
          })
          .then((tx: `0x${string}`) => {
            console.log("TX:", tx);
            return JSON_RPC_PROVIDER.waitForTransaction(tx);
          })
          .then((receipt: TransactionReceipt) => {
            console.log("RECEIPT:", receipt);
            return Promise.all([
              queryClient.invalidateQueries({
                queryKey: [
                  "context-profile",
                  contextProfile.address.toUpperCase(),
                ],
              }),
              queryClient.invalidateQueries({
                queryKey: [
                  "question",
                  contextProfile.qnaContract.address,
                  questionData.index,
                ],
              }),
            ]);
          })
          .then(resolve)
          .catch((e: unknown) => {
            console.log("Failed to send the answer.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          updatePromise,
          {
            pending: "Sending answer...",
            success: "Answer successfully sent!",
            error: "Failed to send the answer!",
          },
          {
            position: "bottom-center",
          }
        );
        upContext.setIsWaitingForTx(false);
        navigate("/?scrollIndex=" + questionData.index);
      } catch (e) {
        console.error(e);
        upContext.setIsWaitingForTx(false);
      }
    },
    [
      upContext,
      contextProfile.qnaContract,
      contextProfile.address,
      queryClient,
      navigate,
    ]
  );
};

export default useAnswerFunction;
