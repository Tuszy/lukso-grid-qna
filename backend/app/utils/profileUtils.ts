import { ERC725 } from "@erc725/erc725.js";
import erc725schema from "../schemas/QuestionAndAnswerSchema.json";
import { IPFS_GATEWAY, RPC_ENDPOINT } from "../constants";

import { fetchOwnerOfQNAContractAddress } from "../utils/contractUtils";
import { QnaColorConfig } from "../utils/colorUtils";
import { defaultConfig } from "next/dist/server/config-shared";

export const ipfsUrl = (url?: string) => url?.replace("ipfs://", IPFS_GATEWAY);

export interface QnaContract {
  address: `0x${string}` | null;
  config?: QnaColorConfig;
}

export interface ContextProfile {
  address: `0x${string}`;
  imgUrl?: string;
  name?: string;
  qnaContract: QnaContract;
}

export interface Profile {
  address: `0x${string}`;
  imgUrl?: string;
  name?: string;
}

export const fetchContextProfile = async (
  qnaContractAddress: `0x${string}`
): Promise<ContextProfile | null> => {
  const address = await fetchOwnerOfQNAContractAddress(qnaContractAddress);
  if (!address) return null;

  let config;
  try {
    const contextProfile = new ERC725(erc725schema, address, RPC_ENDPOINT, {
      ipfsGateway: IPFS_GATEWAY,
    });
    const fetchedData = await contextProfile.fetchData("LSP3Profile");
    const qnaConfigData = await contextProfile.getData(
      "QuestionAndAnswer:Config"
    );

    if (qnaConfigData && qnaConfigData?.value) {
      try {
        config = JSON.parse(qnaConfigData!.value as string);
      } catch (e) {
        console.error(e);
      }
    }

    if (
      fetchedData?.value &&
      typeof fetchedData.value === "object" &&
      "LSP3Profile" in fetchedData.value
    ) {
      const profileImage = fetchedData.value.LSP3Profile.profileImage;
      const imgUrl = ipfsUrl(profileImage?.[0]?.url);
      const name = fetchedData.value.LSP3Profile.name;

      return {
        address,
        name,
        imgUrl,
        qnaContract: {
          address: qnaContractAddress,
          config: config ?? defaultConfig,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching context profile data:", error);
  }
  return null;
};

export const fetchProfile = async (address: `0x${string}`) => {
  try {
    const config = { ipfsGateway: IPFS_GATEWAY };
    const profile = new ERC725(erc725schema, address, RPC_ENDPOINT, config);
    const fetchedData = await profile.fetchData("LSP3Profile");

    if (
      fetchedData?.value &&
      typeof fetchedData.value === "object" &&
      "LSP3Profile" in fetchedData.value
    ) {
      const profileImage = fetchedData.value.LSP3Profile.profileImage;
      const imgUrl = ipfsUrl(profileImage?.[0]?.url);
      const name = fetchedData.value.LSP3Profile.name;

      return {
        address,
        name,
        imgUrl,
      };
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
  }
  return {
    address,
  };
};
