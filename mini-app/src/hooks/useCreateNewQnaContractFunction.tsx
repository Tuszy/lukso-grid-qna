// React
import { useCallback } from "react";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Hooks
import { ContextProfile } from "../hooks/useContextProfile";
import { BigNumberish, ethers, TransactionReceipt } from "ethers";

// QNA Factory Contract
import QuestionAndAnswerFactory from "../json/QuestionAndAnswerFactory.json";
import {
  JSON_RPC_PROVIDER,
  lsp4MetadataVerifiableUrl,
  QNA_FACTORY_CONTRACT_ADDRESS,
} from "../constants";

// Toast
import { toast } from "react-toastify";

// Query Client
import { useQueryClient } from "@tanstack/react-query";

function useCreateNewQnaContractFunction({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();

  return useCallback(
    async (minimumReward: BigNumberish) => {
      if (!upContext.isConnectedToContextAccount || !upContext.client) return;

      upContext.setIsWaitingForTx(true);
      const owner = upContext.accounts[0] as `0x${string}`;

      const contract = new ethers.Contract(
        QNA_FACTORY_CONTRACT_ADDRESS,
        QuestionAndAnswerFactory.abi,
        upContext.client
      );

      const data: string = contract.interface.encodeFunctionData(
        "CreateNewQuestionAndAnswerContract",
        [owner, lsp4MetadataVerifiableUrl, minimumReward]
      );

      const deployPromise = new Promise((resolve, reject) => {
        console.log("Starting to deploy QNA smart contract...");
        upContext.client
          .sendTransaction({
            account: owner,
            to: QNA_FACTORY_CONTRACT_ADDRESS as `0x${string}`,
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
            console.log("Failed to deploy QNA smart contract.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          deployPromise,
          {
            pending: "Deploying Q&A smart contract...",
            success: "Q&A smart contract successfully deployed!",
            error: "Failed to deploy Q&A smart contract!",
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
    [upContext, queryClient, contextProfile.address]
  );
}

export default useCreateNewQnaContractFunction;
