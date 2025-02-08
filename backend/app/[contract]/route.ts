import { ethers } from "ethers";
import { supportsQNAInterface } from "../utils/contractUtils";
import { NextRequest } from "next/server";
import { QNA_INTERFACE_ID } from "../constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contract: `0x${string}` }> }
) {
  const contractAddress = (await params).contract;
  if (!ethers.isAddress(contractAddress)) {
    return Response.json({ msg: "Invalid address" }, { status: 400 });
  }
  try {
    const isValid = await supportsQNAInterface(contractAddress);
    if (!isValid) {
      return Response.json(
        {
          msg:
            "Contract address does not support the QnA interface " +
            QNA_INTERFACE_ID,
        },
        { status: 400 }
      );
    }
  } catch (e) {
    return Response.json(
      { msg: "Invalid contract address (e.g. EOA)" },
      { status: 400 }
    );
  }

  return Response.json(
    { msg: "Valid contract address" },
    {
      status: 200,
    }
  );
}
