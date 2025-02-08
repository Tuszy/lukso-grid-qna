// React
import { useCallback } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Provider
import { JSON_RPC_PROVIDER } from "../constants";
import { useUpProvider } from "../context/UpProvider";
import { ContextProfile } from "./useContextProfile";

// Crypto
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";
import { ERC725YDataKeys, INTERFACE_IDS } from "@lukso/lsp-smart-contracts";
import ERC725 from "@erc725/erc725.js";
import { concat, isHexString, toBeHex, toNumber } from "ethers";
import { getProfileContract } from "../utils/contractUtils";

// Ethers
import { ethers, TransactionReceipt } from "ethers";

// QueryClient
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "react-toastify";

const generateArrayElementKeyAtIndex = (arrayKey: string, index: number) => {
  let arrayKeyHex = arrayKey;

  if (!isHexString(arrayKey, 32)) {
    arrayKeyHex = ethers.keccak256(ethers.toUtf8Bytes(arrayKey));
  }

  const elementInArray = concat([
    arrayKeyHex.substring(0, 34),
    toBeHex(index, 16),
  ]);

  return elementInArray;
};

function useSetLSP12IssuedAssetsFunction({
  contextProfile,
}: {
  contextProfile: ContextProfile;
}) {
  const queryClient = useQueryClient();
  const upContext = useUpProvider();
  const navigate = useNavigate();
  return useCallback(async () => {
    if (
      !upContext.isConnectedToContextAccount ||
      !upContext.client ||
      !contextProfile.qnaContract.address ||
      !contextProfile.address
    ) {
      return;
    }

    upContext.setIsWaitingForTx(true);
    const owner = upContext.accounts[0] as `0x${string}`;

    const contract = new ethers.Contract(
      owner,
      LSP0ERC725Account.abi,
      upContext.client
    );

    const issuedAssetsLengthHex = await getProfileContract(owner).getData(
      ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length
    );

    let issuedAssetsLength: number;

    if (issuedAssetsLengthHex === "" || issuedAssetsLengthHex === "0x") {
      issuedAssetsLength = 0;
    } else if (!isHexString(issuedAssetsLengthHex, 16)) {
      issuedAssetsLength = 0;
    } else {
      issuedAssetsLength = toNumber(issuedAssetsLengthHex);
    }

    const dataKeys = [
      ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
      generateArrayElementKeyAtIndex(
        ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
        issuedAssetsLength
      ),
      ERC725.encodeKeyName("LSP12IssuedAssetsMap:<address>", [
        contextProfile.qnaContract.address.toString(),
      ]),
    ];

    const dataValues = [
      toBeHex(issuedAssetsLength + 1, 16),
      contextProfile.qnaContract.address.toString(),
      concat([
        INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
        toBeHex(issuedAssetsLength, 16),
      ]),
    ];

    const data: string = contract.interface.encodeFunctionData("setDataBatch", [
      dataKeys,
      dataValues,
    ]);

    const updatePromise = new Promise((resolve, reject) => {
      console.log("Starting to verify the ownership...");
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
            queryKey: ["context-profile", contextProfile.address.toUpperCase()],
          });
        })
        .then(resolve)
        .catch((e: unknown) => {
          console.log("Failed to verify the ownership.");
          reject(e);
        });
    });

    try {
      await toast.promise(
        updatePromise,
        {
          pending: "Verifying the ownership...",
          success: "Ownership successfully verified!",
          error: "Failed to verify the ownership!",
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
  }, [
    upContext,
    queryClient,
    contextProfile.address,
    navigate,
    contextProfile.qnaContract.address,
  ]);
}

export default useSetLSP12IssuedAssetsFunction;
