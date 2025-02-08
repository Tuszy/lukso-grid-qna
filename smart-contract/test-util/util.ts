import ERC725 from "@erc725/erc725.js";
import { Interface, toBigInt, toBeHex, zeroPadValue } from "ethers";

export const getInterfaceId = (contractInterface: Interface) => {
  let interfaceID = toBigInt(0);
  contractInterface.forEachFunction(
    (func) => (interfaceID ^= toBigInt(func.selector))
  );

  return zeroPadValue(toBeHex(interfaceID), 4);
};

export const lsp4MetadataVerifiableUrl = ERC725.encodeDataSourceWithHash(
  {
    method: "keccak256(utf8)",
    data: "0x2b2d1d7d16cc722ea9a3129ebccf71fe72cd4aad8c4a493821061bc919e80bc6",
  },
  "ipfs://bafkreihlsmbflr52q2spwskip4ge6vgpbdowuqsrlu2fswsdptgj6sy4ea"
);
