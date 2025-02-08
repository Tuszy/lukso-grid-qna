import { IPFS_GATEWAY } from "../constants";

export const ipfsUrl = (url?: string) => url?.replace("ipfs://", IPFS_GATEWAY);
