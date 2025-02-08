// React
import { useEffect, useState } from "react";

// Router
import { Navigate } from "react-router-dom";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Hooks
import { ContextProfile } from "../hooks/useContextProfile";
import useUpdateColorsFunction from "../hooks/useUpdateColorsFunction";

// Components
import Messages from "../components/Messages";
import MessageBubble from "../components/MessageBubble";

// Color
import { PopoverPicker } from "../components/color-picker/PopoverPicker";
import {
  colorKeyToName,
  defaultColor,
  QnaColorConfig,
} from "../utils/colorUtils";

function ColorConfig({ contextProfile }: { contextProfile: ContextProfile }) {
  const upContext = useUpProvider();
  const [color, setColor] = useState<QnaColorConfig>({
    ...(contextProfile.qnaContract.config ?? defaultColor),
  });
  const updateColors = useUpdateColorsFunction({ contextProfile });

  useEffect(() => {
    setColor({
      ...(contextProfile.qnaContract.config ?? defaultColor),
    });
  }, [contextProfile.qnaContract.config]);

  if (
    !contextProfile.qnaContract.address ||
    !upContext.isConnectedToContextAccount
  ) {
    return <Navigate to="/" />;
  }

  const setSpecificColor = (key: keyof QnaColorConfig, color: string) =>
    setColor((c) => ({ ...c, [key]: color }));

  return (
    <>
      <div className="text-lg font-bold flex flex-col items-center justify-center w-full flex-grow h-full max-h-screen px-2 text-center select-none">
        <span className="text-4xl font-black cursor-default mt-2">
          COLOR CONFIG
        </span>
        <div className="flex items-center justify-center w-full flex-grow">
          <div className="relative flex-grow flex flex-col items-center justify-center">
            <div className="absolute -top-1.5 z-10 bg-black text-white rounded-xl text-xs px-2 py-[1px]">
              PREVIEW
            </div>
            <div className="overflow-hidden ring-4 ring-black rounded-lg scale-[95%]">
              <Messages center={true} backgroundColor={color.bg}>
                <MessageBubble
                  address={"0x1ADFdD71491798D520Fb8C0f4a6228e65A714819"}
                  preview={true}
                  anchor={"left"}
                  colorConfig={color}
                  reward={1000000000000000000n}
                >
                  What can I do here?!
                </MessageBubble>
                <MessageBubble
                  preview={true}
                  address={contextProfile.address}
                  anchor={"right"}
                  colorConfig={color}
                >
                  Click on the colors below & you'll find out.
                </MessageBubble>
              </Messages>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-start px-1 pb-1 gap-2 w-full">
          {Object.keys(color).map((key) => (
            <PopoverPicker
              key={key}
              name={colorKeyToName[key as keyof QnaColorConfig]}
              color={color[key as keyof QnaColorConfig]}
              setColor={(value) =>
                setSpecificColor(key as keyof QnaColorConfig, value)
              }
            />
          ))}
          <button
            className="text-xl bg-black text-white rounded-lg font-medium px-4 py-0.5 w-full disabled:opacity-50 hover:opacity-90 active:opacity-80"
            onClick={() => updateColors(color)}
            disabled={upContext.isWaitingForTx}
          >
            Update
          </button>
        </div>
      </div>
    </>
  );
}

export default ColorConfig;
