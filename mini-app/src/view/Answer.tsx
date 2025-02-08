// React Router
import { Navigate, useParams } from "react-router-dom";

// Provider
import { useUpProvider } from "../context/UpProvider";
import { ContextProfile } from "../hooks/useContextProfile";

// Components
import MessageBubble from "../components/MessageBubble";
import Messages from "../components/Messages";
import MessageInput from "../components/MessageInput";

// Hooks
import useQuestion from "../hooks/useQuestion";
import useAnswerFunction from "../hooks/useAnswerFunction";

function Answer({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const { questionIndex } = useParams();
  const answerQuestion = useAnswerFunction({ contextProfile });
  const { data: questionData, isError } = useQuestion(
    contextProfile.qnaContract?.address ?? null,
    parseInt(questionIndex!)
  );

  const index = parseInt(questionIndex!);

  if (
    !contextProfile.qnaContract.address ||
    !upContext.walletConnected ||
    !upContext.isConnectedToContextAccount ||
    index < 0 ||
    index >= contextProfile.qnaContract.totalSupply ||
    isError
  ) {
    return <Navigate to="/" />;
  }
  if (!questionData) return null;

  return (
    <div className="flex flex-col items-center justify-between w-full mx-0 flex-grow max-h-screen">
      <Messages backgroundColor={contextProfile.qnaContract.config?.bg}>
        <MessageBubble
          address={questionData!.asker}
          colorConfig={contextProfile.qnaContract.config}
          reward={questionData!.reward}
          anchor="left"
        >
          {questionData.question}
        </MessageBubble>
      </Messages>
      <MessageInput
        placeholder={"Your answer"}
        onConfirm={(answer: string) => answerQuestion(answer, questionData)}
        disabled={upContext.isWaitingForTx}
      />
    </div>
  );
}

export default Answer;
