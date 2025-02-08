// React
import { useState } from "react";

// Router
import { Navigate } from "react-router-dom";

// Image
import ConstructionSvg from "../assets/construction.svg";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Crypto
import { ContextProfile } from "../hooks/useContextProfile";
import { BigNumberish, ethers } from "ethers";

// Components
import MinimumRewardInput from "../components/MinimumRewardInput";
import useCreateNewQnaContractFunction from "../hooks/useCreateNewQnaContractFunction";

const defaultMinimumReward = ethers.parseEther("1");
function Setup({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const deploy = useCreateNewQnaContractFunction({ contextProfile });

  const [minimumReward, setMinimumReward] =
    useState<BigNumberish>(defaultMinimumReward);

  if (contextProfile.qnaContract.address) {
    return <Navigate to="/" />;
  }

  if (!upContext.walletConnected || !upContext.isConnectedToContextAccount) {
    return (
      <div className="text-xl font-black flex flex-col items-center justify-center w-full mx-0 flex-grow h-full max-h-screen max-w-72 gap-4 text-center">
        <span>Please come back later...</span>
        <img src={ConstructionSvg} width={128} height={128} />
        <span>
          This universal profile is still setting up the Q&A smart contract.
        </span>
      </div>
    );
  }

  return (
    <div className="text-lg font-bold flex flex-col items-center justify-center w-full mx-0 flex-grow h-full max-h-screen p-4 gap-3 text-center">
      <span className="text-4xl font-black cursor-default">Q&A SETUP</span>
      <div className="w-full max-w-lg flex flex-col gap-1 border-2 border-black p-1 bg-white rounded-lg">
        <MinimumRewardInput
          minimumReward={minimumReward}
          setMinimumReward={setMinimumReward}
          disabled={upContext.isWaitingForTx}
          currentMinimumReward={defaultMinimumReward}
        />
        <button
          className="text-xl bg-black text-white rounded-lg font-medium px-4 py-2 w-full disabled:opacity-50 hover:opacity-90 active:opacity-80"
          onClick={() => deploy(minimumReward)}
          disabled={upContext.isWaitingForTx}
        >
          Deploy Q&A smart contract
        </button>
      </div>
    </div>
  );
}

export default Setup;
