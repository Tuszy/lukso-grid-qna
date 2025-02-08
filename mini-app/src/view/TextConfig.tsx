// React
import { useState } from "react";

// React Router
import { Navigate } from "react-router-dom";

// Provider
import { useUpProvider } from "../context/UpProvider";
import { ContextProfile } from "../hooks/useContextProfile";

// Components
import MessageBubble from "../components/MessageBubble";
import Messages from "../components/Messages";
import MessageInput from "../components/MessageInput";

// Icon
import { FaCircleCheck } from "react-icons/fa6";

// Hooks
import useUpdateGreetingFunction from "../hooks/useUpdateGreetingFunction";

export const defaultGreeting =
  "Welcome! Feel free to ask me anything, but you gonna pay for it.";

function TextConfig({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const updateGreeting = useUpdateGreetingFunction({ contextProfile });
  const [text, setText] = useState<string>("");

  if (
    !contextProfile.qnaContract.address ||
    !upContext.walletConnected ||
    !upContext.isConnectedToContextAccount
  ) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col items-center justify-between w-full mx-0 flex-grow max-h-screen">
      <span className="text-4xl flex-shrink-0 font-black cursor-default mt-3 select-none">
        GREETING CONFIG
      </span>
      <div className="relative flex flex-grow justify-center items-center overflow-hidden">
        <div
          className="scale-[80%] rounded-lg overflow-hidden flex-grow"
          style={{ background: contextProfile.qnaContract.config?.bg }}
        >
          <Messages backgroundColor={contextProfile.qnaContract.config?.bg}>
            <MessageBubble
              preview={true}
              address={contextProfile.address}
              colorConfig={contextProfile.qnaContract.config}
              anchor="right"
            >
              {text.length > 0
                ? text
                : contextProfile.qnaContract.greeting ?? defaultGreeting}
            </MessageBubble>
          </Messages>
        </div>
      </div>
      {upContext.walletConnected && (
        <MessageInput
          placeholder={
            "Your greeting. The current is the following:\n" +
            (contextProfile.qnaContract.greeting ?? defaultGreeting)
          }
          onConfirm={(greeting: string) => updateGreeting(greeting)}
          maxLength={100}
          disabled={upContext.isWaitingForTx}
          onInputChange={setText}
          iconElement={<FaCircleCheck color="white" size={36} />}
        />
      )}
    </div>
  );
}

export default TextConfig;
