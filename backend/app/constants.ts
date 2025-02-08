import { ethers } from "ethers";

// Constants for the IPFS gateway and RPC endpoint for the LUKSO mainnet
export const IPFS_GATEWAY = "https://api.universalprofile.cloud/ipfs/";
export const RPC_ENDPOINT = "https://rpc.mainnet.lukso.network";

export const JSON_RPC_PROVIDER = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export const QNA_FACTORY_CONTRACT_ADDRESS: `0x${string}` =
  "0xe1dA84dF8b3700CD406738E72AB0fbAf559b474F";

export const QNA_INTERFACE_ID: `0x${string}` = "0xcdc5f2fd";

export const DOMAIN = "https://lukso-grid-qna-baseuri.tuszy.com";
