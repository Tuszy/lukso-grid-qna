// React
import { useState } from "react";

// Router
import { Navigate } from "react-router-dom";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Crypto
import { ContextProfile } from "../hooks/useContextProfile";
import { BigNumberish } from "ethers";

// Hooks
import useUpdateMinimumRewardFunction from "../hooks/useUpdateMinimumRewardFunction";
import useSetLSP12IssuedAssetsFunction from "../hooks/useSetLSP12IssuedAssetsFunction";

// Components
import MinimumRewardInput from "../components/MinimumRewardInput";

function Config({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const updateMinimumReward = useUpdateMinimumRewardFunction({
    contextProfile,
  });
  const setLSP12IssuedAssets = useSetLSP12IssuedAssetsFunction({
    contextProfile,
  });

  const [minimumReward, setMinimumReward] = useState<BigNumberish>(
    contextProfile.qnaContract.minimumReward ?? 0
  );

  if (
    !contextProfile.qnaContract.address ||
    !upContext.isConnectedToContextAccount
  ) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="text-lg font-bold flex flex-col items-center justify-center w-full mx-0 flex-grow h-full max-h-screen p-4 gap-1 text-center">
        <span className="text-4xl font-black cursor-default select-none">
          Q&A CONFIG
        </span>

        <div className="w-full max-w-lg border-2 border-black p-1 bg-white rounded-lg text-xs flex flex-col justify-center items-center font-black select-none">
          <div className="text-base">CONTRACT ADDRESS</div>
          <a
            className="select-all bg-gray-300 p-1 rounded-lg"
            target="_blank"
            href={
              "https://universaleverything.io/collection/" +
              contextProfile.qnaContract.address
            }
          >
            {contextProfile.qnaContract.address}
          </a>
        </div>
        <div className="max-w-lg w-full flex flex-col gap-1 border-2 border-black p-1 bg-white rounded-lg">
          <MinimumRewardInput
            minimumReward={minimumReward}
            setMinimumReward={setMinimumReward}
            disabled={upContext.isWaitingForTx}
            currentMinimumReward={contextProfile.qnaContract.minimumReward ?? 0}
          />
          <button
            className="text-xl bg-black text-white rounded-lg font-medium px-4 py-2 w-full disabled:opacity-50 hover:opacity-90 active:opacity-80 select-none"
            onClick={() => updateMinimumReward(minimumReward)}
            disabled={upContext.isWaitingForTx}
          >
            Update Minimum Reward
          </button>
        </div>
        {!contextProfile.qnaContract.isVerified && (
          <div className="max-w-lg w-full border-2 border-black p-1 bg-white rounded-lg">
            <button
              className="text-lg bg-black text-white rounded-lg font-medium px-4 py-2 w-full disabled:opacity-50 hover:opacity-90 active:opacity-80 select-none"
              onClick={() => setLSP12IssuedAssets()}
              disabled={upContext.isWaitingForTx}
            >
              Verify Ownership (LSP12-IssuedAssets)
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Config;
