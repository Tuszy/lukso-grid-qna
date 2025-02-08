// React
import { useRef, useEffect } from "react";

// React Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Hooks
import { ContextProfile } from "../hooks/useContextProfile";
import useQuestion from "../hooks/useQuestion";
import useRevokeFunction from "../hooks/useRevokeFunction";

// UP
import { useUpProvider } from "../context/UpProvider";

// Components
import MessageBubble from "../components/MessageBubble";
import Messages from "../components/Messages";

// React-Window
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";

// Constant
import { defaultGreeting } from "./TextConfig";

function Overview({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const [queryParams] = useSearchParams();
  const revokeQuestion = useRevokeFunction({ contextProfile });
  const listRef = useRef({}) as React.MutableRefObject<List>;
  const rowHeights = useRef({}) as React.MutableRefObject<number[]>;

  useEffect(() => {
    if (listRef.current?.resetAfterIndex) {
      listRef.current?.resetAfterIndex(0);
    }
  }, [contextProfile.qnaContract.totalSupply]);

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | undefined = undefined;
    const index = parseInt(queryParams.get("scrollIndex") ?? "");
    if (
      isNaN(index) ||
      index < 0 ||
      index >= contextProfile.qnaContract.totalSupply
    ) {
      return;
    }

    scrollInterval = setInterval(() => {
      if (
        listRef.current?.scrollToItem === undefined ||
        listRef.current?.resetAfterIndex === undefined
      ) {
        return;
      }
      if (isNaN(index) || index >= contextProfile.qnaContract.totalSupply) {
        clearInterval(scrollInterval);
        return;
      }

      if (
        listRef.current?.scrollToItem &&
        listRef.current?.resetAfterIndex &&
        rowHeights.current[index + 1] > 0
      ) {
        listRef.current?.resetAfterIndex(0);
        listRef.current?.scrollToItem(index + 1, "start");
        clearInterval(scrollInterval);
      }
    }, 1);

    return () => {
      clearInterval(scrollInterval);
    };
  }, [queryParams, listRef, contextProfile.qnaContract.totalSupply]);

  const setRowHeight = (index: number, size: number) => {
    listRef.current?.resetAfterIndex(0);
    rowHeights.current = { ...rowHeights.current, [index]: size };
  };

  function getRowHeight(index: number) {
    return rowHeights.current[index] || 0;
  }

  function RowWrapper(props: {
    index: number;
    style: React.CSSProperties | undefined;
    data: { contextProfile: ContextProfile };
  }) {
    return props.index === 0 ? <DefaultRow {...props} /> : <Row {...props} />;
  }

  function DefaultRow({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties | undefined;
    data: { contextProfile: ContextProfile };
  }) {
    const rowRef = useRef({}) as React.MutableRefObject<HTMLDivElement>;

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight);
      }
      // eslint-disable-next-line
    }, [rowRef]);

    return (
      <div style={{ ...style }}>
        <div ref={rowRef}>
          <MessageBubble
            address={data.contextProfile?.address}
            colorConfig={data.contextProfile.qnaContract.config}
            anchor={upContext.isConnectedToContextAccount ? "right" : "left"}
          >
            {data.contextProfile.qnaContract.greeting ?? defaultGreeting}
          </MessageBubble>
        </div>
      </div>
    );
  }

  function Row({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties | undefined;
    data: { contextProfile: ContextProfile };
  }) {
    const navigate = useNavigate();
    const { data: qnaData, isLoading } = useQuestion(
      data.contextProfile.qnaContract!.address!,
      index - 1
    );
    const rowRef = useRef({}) as React.MutableRefObject<HTMLDivElement>;

    useEffect(() => {
      if (rowRef.current && qnaData) {
        setRowHeight(index, rowRef.current.clientHeight);
      }
      // eslint-disable-next-line
    }, [rowRef, qnaData]);

    if (isLoading || !qnaData) return null;

    let actionText: string | undefined;
    let onAction: (() => void | Promise<void>) | undefined;

    if (!qnaData.answered && upContext.walletConnected) {
      if (upContext.isConnectedToContextAccount) {
        actionText = "ANSWER";
        onAction = () => navigate("/answer/" + qnaData.index);
      } else if (qnaData.asker === upContext.accounts[0]) {
        actionText = "REVOKE";
        onAction = () => revokeQuestion(qnaData);
      }
    }

    return (
      <div style={{ ...style }}>
        <div ref={rowRef}>
          <MessageBubble
            address={qnaData.asker}
            colorConfig={data.contextProfile.qnaContract.config}
            anchor={upContext.isConnectedToContextAccount ? "left" : "right"}
            reward={qnaData.reward}
            actionText={actionText}
            onAction={onAction}
            qnaContractAddress={contextProfile.qnaContract.address!}
            questionId={qnaData.id}
          >
            {qnaData.question}
          </MessageBubble>
          {qnaData.answered ? (
            <MessageBubble
              address={data.contextProfile?.address}
              colorConfig={data.contextProfile.qnaContract.config}
              anchor={upContext.isConnectedToContextAccount ? "right" : "left"}
              qnaContractAddress={contextProfile.qnaContract.address!}
              questionId={qnaData.id}
            >
              {qnaData.answer}
            </MessageBubble>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-full mx-0 flex-grow max-h-screen">
      <Messages
        center={contextProfile.qnaContract.totalSupply === 0}
        backgroundColor={contextProfile.qnaContract.config?.bg}
      >
        <div className="flex-1">
          <AutoSizer>
            {({ height, width }) => (
              <>
                <List
                  ref={listRef}
                  height={height}
                  itemCount={contextProfile.qnaContract.totalSupply + 1}
                  itemSize={getRowHeight}
                  width={width}
                  itemData={{ contextProfile }}
                >
                  {RowWrapper}
                </List>
              </>
            )}
          </AutoSizer>
        </div>
      </Messages>
    </div>
  );
}

export default Overview;
