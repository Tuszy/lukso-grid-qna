// React
import { useCallback } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Provider
import { JSON_RPC_PROVIDER } from "../constants";
import { useUpProvider } from "../context/UpProvider";
import { ContextProfile } from "./useContextProfile";

// QNA Contract
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";

// Ethers
import { ethers, TransactionReceipt } from "ethers";

// QueryClient
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "react-toastify";

// Color
import { QnaColorConfig } from "../utils/colorUtils";

function useUpdateColorsFunction({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();
  const navigate = useNavigate();
  return useCallback(
    async (color: QnaColorConfig) => {
      if (!upContext.isConnectedToContextAccount || !upContext.client) {
        return;
      }

      upContext.setIsWaitingForTx(true);
      const owner = upContext.accounts[0] as `0x${string}`;

      const contract = new ethers.Contract(
        owner,
        LSP0ERC725Account.abi,
        upContext.client
      );

      const data: string = contract.interface.encodeFunctionData("setData", [
        "0x6b14278bbcdbca34fa49000048fd0b937c5f6bca9b37c93d4dfaa4c645a0d160", // keccak("QuestionAndAnswer:Config")
        ethers.toUtf8Bytes(JSON.stringify(color)),
      ]);

      const updatePromise = new Promise((resolve, reject) => {
        console.log("Starting to update the colors...");
        upContext.client
          .sendTransaction({
            account: owner,
            to: owner,
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
            console.log("Failed to update the colors.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          updatePromise,
          {
            pending: "Updating the colors...",
            success: "Colors successfully updated!",
            error: "Failed to update the colors!",
          },
          {
            position: "bottom-center",
          }
        );

        navigate("/");
      } catch (e) {
        console.error(e);
      }

      upContext.setIsWaitingForTx(false);
    },
    [upContext, queryClient, contextProfile.address, navigate]
  );
}

export default useUpdateColorsFunction;
