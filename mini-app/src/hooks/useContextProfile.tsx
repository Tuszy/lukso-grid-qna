import { ERC725 } from "@erc725/erc725.js";
import erc725schema from "../json/QuestionAndAnswerSchema.json";
import { IPFS_GATEWAY, RPC_ENDPOINT } from "../constants";
import { useQuery } from "@tanstack/react-query";
import { useUpProvider } from "../context/UpProvider";
import {
  fetchQnaContractAddress,
  getContract,
  getProfileContract,
} from "../utils/contractUtils";
import { BigNumberish, ethers } from "ethers";
import { ipfsUrl } from "../utils/profileUtils";
import { QnaColorConfig } from "../utils/colorUtils";

export interface QnaContract {
  address: `0x${string}` | null;
  minimumReward: BigNumberish | null;
  isVerified: boolean;
  totalSupply: number;
  config?: QnaColorConfig;
  greeting?: string;
}

export interface ContextProfile {
  address: `0x${string}`;
  imgUrl?: string;
  name?: string;
  qnaContract: QnaContract;
}

export const fetchTotalSupply = async (
  contractAddress: `0x${string}` | null
): Promise<number> => {
  if (!contractAddress) return 0;
  return Number(await getContract(contractAddress).totalSupply());
};

export const fetchMinimumReward = async (
  contractAddress: `0x${string}` | null
): Promise<BigNumberish | null> => {
  if (!contractAddress) return null;
  return await getContract(contractAddress).minReward();
};

const fetchContextProfile = async (
  address: `0x${string}` | undefined
): Promise<ContextProfile | null> => {
  if (!address) return null;

  const qnaContractAddress = await fetchQnaContractAddress(address);
  if (!qnaContractAddress) {
    return {
      address,
      qnaContract: {
        address: null,
        minimumReward: null,
        isVerified: false,
        totalSupply: 0,
      },
    };
  }
  const minimumReward = await fetchMinimumReward(qnaContractAddress);
  const totalSupply = await fetchTotalSupply(qnaContractAddress);
  const isVerified =
    (await getProfileContract(address).getData(
      ERC725.encodeKeyName("LSP12IssuedAssetsMap:<address>", [
        qnaContractAddress.toString(),
      ])
    )) !== "0x";

  let config;
  let greeting;
  try {
    const contextProfile = new ERC725(erc725schema, address, RPC_ENDPOINT, {
      ipfsGateway: IPFS_GATEWAY,
    });
    const fetchedData = await contextProfile.fetchData("LSP3Profile");
    const qnaConfigData = await contextProfile.getData([
      "QuestionAndAnswer:Config",
      "QuestionAndAnswer:Greeting",
    ]);

    if (qnaConfigData[0] && qnaConfigData[0]?.value) {
      try {
        config = JSON.parse(qnaConfigData[0]!.value as string);
      } catch (e) {
        console.error(e);
      }
    }

    if (qnaConfigData[1] && qnaConfigData[1]?.value) {
      try {
        greeting = qnaConfigData[1]!.value as string;
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
          isVerified,
          minimumReward,
          totalSupply,
          config,
          greeting,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching context profile data:", error);
  }
  return {
    address,
    qnaContract: {
      address: qnaContractAddress,
      isVerified,
      minimumReward,
      totalSupply,
      config,
      greeting,
    },
  };
};

const useContextProfile = () => {
  const upContext = useUpProvider();
  return useQuery({
    queryKey: ["context-profile", upContext.contextAccounts[0]?.toUpperCase()],
    queryFn: async () =>
      await fetchContextProfile(upContext.contextAccounts[0]),
  });
};

export default useContextProfile;
