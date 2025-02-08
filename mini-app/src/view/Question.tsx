// React
import { useState } from "react";

// Routing
import { Navigate } from "react-router-dom";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Ethers
import { BigNumberish, ethers } from "ethers";

// Hooks
import { ContextProfile } from "../hooks/useContextProfile";
import useAskFunction from "../hooks/useAskFunction";

// Components
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import Messages from "../components/Messages";
import MinimumRewardInput from "../components/MinimumRewardInput";

// Constant
import { defaultGreeting } from "./TextConfig";

function Question({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const askQuestion = useAskFunction({ contextProfile });
  const [reward, setReward] = useState<BigNumberish>(
    contextProfile.qnaContract.minimumReward ?? 0
  );

  if (
    !upContext.walletConnected ||
    upContext.isConnectedToContextAccount ||
    contextProfile.qnaContract?.minimumReward === null
  ) {
    return <Navigate to="/" />;
  }

  const formattedMinReward = parseFloat(
    ethers.formatEther(contextProfile.qnaContract!.minimumReward!)
  );

  return (
    <div className="flex flex-col items-center justify-between w-full mx-0 flex-grow max-h-screen">
      <Messages backgroundColor={contextProfile.qnaContract.config?.bg}>
        <MessageBubble
          address={contextProfile?.address}
          colorConfig={contextProfile.qnaContract.config}
          anchor="left"
        >
          {contextProfile.qnaContract.greeting ?? defaultGreeting}
        </MessageBubble>
      </Messages>
      <MessageInput
        placeholder={"Your question"}
        onConfirm={(question: string) => askQuestion(question, reward)}
        disabled={upContext.isWaitingForTx}
      >
        <MinimumRewardInput
          text={"REWARD"}
          minimumReward={reward}
          setMinimumReward={setReward}
          currentMinimumReward={contextProfile.qnaContract.minimumReward}
          disabled={upContext.isWaitingForTx}
          error={
            reward < contextProfile.qnaContract.minimumReward
              ? "Must be atleast " + formattedMinReward + " LYX"
              : ""
          }
        />
      </MessageInput>
    </div>
  );
}

export default Question;
