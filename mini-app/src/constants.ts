import ERC725 from "@erc725/erc725.js";
import { ethers } from "ethers";

// Constants for the IPFS gateway and RPC endpoint for the LUKSO mainnet
export const IPFS_GATEWAY = "https://api.universalprofile.cloud/ipfs/";
export const RPC_ENDPOINT = "https://rpc.mainnet.lukso.network";

export const JSON_RPC_PROVIDER = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export const QNA_FACTORY_CONTRACT_ADDRESS: `0x${string}` =
  "0xe1dA84dF8b3700CD406738E72AB0fbAf559b474F";

export const QNA_INTERFACE_ID: `0x${string}` = "0xcdc5f2fd";

// DEFAULT LSP4
export const lsp4MetadataVerifiableUrl = ERC725.encodeDataSourceWithHash(
  {
    method: "keccak256(utf8)",
    data: "0x2b2d1d7d16cc722ea9a3129ebccf71fe72cd4aad8c4a493821061bc919e80bc6",
  },
  "ipfs://bafkreihlsmbflr52q2spwskip4ge6vgpbdowuqsrlu2fswsdptgj6sy4ea"
);
