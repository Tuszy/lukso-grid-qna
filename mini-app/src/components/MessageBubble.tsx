import { ReactNode } from "react";
import { FaUser } from "react-icons/fa6";
import { MdRemoveRedEye } from "react-icons/md";
import useProfile from "../hooks/useProfile";
import { BigNumberish, BytesLike, ethers } from "ethers";
import { defaultColor, QnaColorConfig } from "../utils/colorUtils";

function MessageBubble({
  address,
  reward,
  anchor,
  children,
  preview,
  colorConfig,
  actionText,
  onAction,
  qnaContractAddress,
  questionId,
}: {
  address: `0x${string}`;
  reward?: BigNumberish;
  anchor: "left" | "right";
  children: ReactNode;
  preview?: boolean;
  colorConfig?: QnaColorConfig;
  actionText?: string;
  onAction?: () => void;
  qnaContractAddress?: `0x${string}`;
  questionId?: BytesLike;
}) {
  const { data } = useProfile(preview ? null : address);

  const bubbleColor =
    anchor === "left"
      ? colorConfig?.lm ?? defaultColor.lm
      : colorConfig?.rm ?? defaultColor.rm;
  const textColor =
    anchor === "left"
      ? colorConfig?.lt ?? defaultColor.lt
      : colorConfig?.rt ?? defaultColor.rt;
  const borderColor =
    anchor === "left"
      ? colorConfig?.lb ?? defaultColor.lb
      : colorConfig?.rb ?? defaultColor.rb;

  const nameSuffix = address ? "#" + address.substring(2, 6).toUpperCase() : "";

  return (
    <div
      draggable={false}
      className={
        "flex items-start gap-1.5 " +
        (anchor === "right" ? "flex-row-reverse" : "flex-row") +
        (preview ? " pointer-events-none select-none" : "")
      }
    >
      <a
        draggable={false}
        href={"https://universaleverything.io/" + address}
        target="_blank"
        style={{ backgroundColor: bubbleColor, borderColor: borderColor }}
        className="w-12 h-12 min-w-12 min-h-12 rounded-full border-2 border-gray-700 grid place-content-center overflow-hidden bg-white"
      >
        {data?.imgUrl ? (
          <img
            draggable={false}
            className="w-full h-full"
            src={data?.imgUrl}
            alt={address + " profile image"}
          />
        ) : (
          <FaUser size={24} color={borderColor} />
        )}
      </a>
      <div
        style={{ backgroundColor: bubbleColor, borderColor: borderColor }}
        className={
          "w-full max-w-lg relative overflow-hidden mt-1 flex flex-col p-3 border-2 border-black rounded-xl bg-gray-700 " +
          (anchor === "right" ? "rounded-tr-none" : "rounded-tl-none")
        }
      >
        <div
          className={
            "relative flex gap-3 items-center justify-between " +
            (anchor === "right" ? "flex-row-reverse" : "flex-row")
          }
        >
          <a
            draggable={false}
            style={{ color: textColor }}
            className="text-sm font-semibold text-white break-all h-full"
            href={"https://universaleverything.io/" + address}
            target="_blank"
          >
            {data?.name ? (
              nameSuffix ? (
                <span className="text-inherit opacity-75">
                  {data!.name + nameSuffix}
                </span>
              ) : (
                data!.name
              )
            ) : (
              <span>
                Anonymous
                {nameSuffix && (
                  <span className="text-inherit opacity-75">{nameSuffix}</span>
                )}
              </span>
            )}
          </a>
          {Boolean(reward) && (
            <span
              style={{ color: textColor, borderColor: textColor }}
              className={
                "border-2 border-color-black rounded-full px-1 text-xs font-semibold text-gray-400 opacity-75 "
              }
            >
              {parseFloat(ethers.formatEther(reward!))} LYX
            </span>
          )}
        </div>
        <div
          style={{ color: textColor, wordBreak: "break-word" }}
          className={
            "flex-grow flex text-sm font-normal py-2 my-1 px-2 shadow-inner text-white bg-black rounded-lg bg-opacity-10 text-start break-words justify-start " +
            (anchor === "right" ? "flex-row-reverse" : "flex-row") +
            (actionText && onAction ? " pb-6" : "")
          }
        >
          {children}
        </div>
        {actionText && onAction && (
          <button
            onClick={onAction}
            style={{ color: bubbleColor, backgroundColor: borderColor }}
            className={`absolute bottom-0 text-sm font-normal text-gray-400 px-2 py-0.5 ${
              anchor === "right"
                ? "left-0 rounded-bl-lg rounded-tr-lg"
                : "right-0 rounded-br-lg rounded-tl-lg"
            } hover:cursor-pointer hover:opacity-80 active:opacity-70`}
          >
            {actionText}
          </button>
        )}
        {qnaContractAddress && questionId && (
          <a
            href={`https://universaleverything.io/asset/${qnaContractAddress}/tokenId/${questionId.toString()}`}
            target="_blank"
          >
            <div
              className={
                "absolute -top-0.5 rounded-full " +
                (anchor === "right" ? "left-0" : "right-0")
              }
            >
              <MdRemoveRedEye size={20} color={textColor} />
            </div>{" "}
          </a>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
