// React
import { useCallback } from "react";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Hooks
import { ContextProfile } from "../hooks/useContextProfile";
import { BigNumberish, ethers, TransactionReceipt } from "ethers";

// QNA Contract
import QuestionAndAnswer from "../json/QuestionAndAnswer.json";
import { JSON_RPC_PROVIDER } from "../constants";

// Toast
import { toast } from "react-toastify";

// Query Client
import { useQueryClient } from "@tanstack/react-query";

function useUpdateMinimumRewardFunction({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();

  return useCallback(
    async (minimumReward: BigNumberish) => {
      if (
        !upContext.isConnectedToContextAccount ||
        !upContext.client ||
        !contextProfile.qnaContract.address ||
        minimumReward === contextProfile.qnaContract.minimumReward
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

      const data: string = contract.interface.encodeFunctionData(
        "setMinReward",
        [minimumReward]
      );

      const updatePromise = new Promise((resolve, reject) => {
        console.log("Starting to update the minimum reward...");
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
            return queryClient.invalidateQueries({
              queryKey: [
                "context-profile",
                contextProfile.address.toUpperCase(),
              ],
            });
          })
          .then(resolve)
          .catch((e: unknown) => {
            console.log("Failed to update the minimum reward.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          updatePromise,
          {
            pending: "Updating minimum reward...",
            success: "Minimum reward successfully updated!",
            error: "Failed to update minimum reward!",
          },
          {
            position: "bottom-center",
          }
        );
      } catch (e) {
        console.error(e);
      }

      upContext.setIsWaitingForTx(false);
    },
    [upContext, contextProfile.qnaContract, queryClient, contextProfile.address]
  );
}

export default useUpdateMinimumRewardFunction;
