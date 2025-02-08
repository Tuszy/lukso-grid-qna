import { ERC725 } from "@erc725/erc725.js";
import erc725schema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { IPFS_GATEWAY, RPC_ENDPOINT } from "../constants";
import { useQuery } from "@tanstack/react-query";
import { ipfsUrl } from "../utils/profileUtils";

export interface Profile {
  address: `0x${string}`;
  imgUrl?: string;
  name?: string;
}

const fetchProfile = async (address: `0x${string}` | null) => {
  if (!address) return null;

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

const useProfile = (address: `0x${string}` | null) => {
  return useQuery({
    queryKey: ["profile", address],
    queryFn: async () => await fetchProfile(address),
  });
};

export default useProfile;
