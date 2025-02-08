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

// Ethers
import { BigNumberish, ethers, TransactionReceipt } from "ethers";

// QueryClient
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "react-toastify";

const useAskFunction = ({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) => {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();
  const navigate = useNavigate();

  return useCallback(
    async (question: string, reward: BigNumberish) => {
      if (
        !upContext.walletConnected ||
        upContext.isConnectedToContextAccount ||
        contextProfile.qnaContract?.minimumReward === null ||
        reward < contextProfile.qnaContract.minimumReward!
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

      const questionAsBytes = ethers.toUtf8Bytes(question);
      const questionId = ethers.keccak256(questionAsBytes);

      const data: string = contract.interface.encodeFunctionData("ask", [
        questionId,
        questionAsBytes,
      ]);

      const scrollToIndex = contextProfile.qnaContract.totalSupply!;
      const updatePromise = new Promise((resolve, reject) => {
        console.log("Starting to send question...");
        upContext.client
          .sendTransaction({
            account: owner,
            to: contextProfile.qnaContract.address,
            value: reward,
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
                  "profile-questions",
                  contextProfile.qnaContract.address,
                  owner,
                ],
              }),
            ]);
          })
          .then(resolve)
          .catch((e: unknown) => {
            console.log("Failed to send the question.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          updatePromise,
          {
            pending: "Sending question...",
            success: "Question successfully sent!",
            error: "Failed to send the question!",
          },
          {
            position: "bottom-center",
          }
        );
        upContext.setIsWaitingForTx(false);
        navigate("/?scrollIndex=" + scrollToIndex);
      } catch (e) {
        console.error(e);
        upContext.setIsWaitingForTx(false);
      }
    },
    [
      upContext,
      contextProfile.qnaContract,
      queryClient,
      navigate,
      contextProfile.address,
    ]
  );
};

export default useAskFunction;
