// React
import { useCallback } from "react";

// Provider
import { JSON_RPC_PROVIDER } from "../constants";
import { useUpProvider } from "../context/UpProvider";
import { ContextProfile } from "../hooks/useContextProfile";

// Interface
import QuestionAndAnswer from "../json/QuestionAndAnswer.json";

// Hooks
import { QuestionAndAnswerData } from "../hooks/useQuestion";

// Ethers
import { ethers, TransactionReceipt } from "ethers";

// QueryClient
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "react-toastify";

const useRevokeFunction = ({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) => {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();

  return useCallback(
    async (questionData: QuestionAndAnswerData) => {
      if (
        !upContext.walletConnected ||
        upContext.isConnectedToContextAccount ||
        !questionData ||
        questionData?.answered
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

      const data: string = contract.interface.encodeFunctionData("revoke", [
        questionData!.id,
      ]);

      const updatePromise = new Promise((resolve, reject) => {
        console.log("Starting to revoke question...");
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
                queryKey: ["question"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["profile-questions"],
              }),
            ]);
          })
          .then(resolve)
          .catch((e: unknown) => {
            console.log("Failed to revoke the question.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          updatePromise,
          {
            pending: "Revoking question...",
            success: "Question successfully revoked!",
            error: "Failed to revoke the question!",
          },
          {
            position: "bottom-center",
          }
        );
        upContext.setIsWaitingForTx(false);
      } catch (e) {
        console.error(e);
        upContext.setIsWaitingForTx(false);
      }
    },
    [upContext, contextProfile.qnaContract, contextProfile.address, queryClient]
  );
};

export default useRevokeFunction;
