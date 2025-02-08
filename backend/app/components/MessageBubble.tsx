import { ReactNode } from "react";
import { FaUser } from "react-icons/fa6";
import { BigNumberish, ethers } from "ethers";
import { defaultColor, QnaColorConfig } from "../utils/colorUtils";
import { Profile } from "../utils/profileUtils";

function MessageBubble({
  profile,
  reward,
  anchor,
  colorConfig,
  children,
}: {
  profile: Profile;
  reward?: BigNumberish;
  anchor: "left" | "right";
  children: ReactNode;
  preview?: boolean;
  colorConfig?: QnaColorConfig;
}) {
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

  const nameSuffix = profile.address
    ? "#" + profile.address.substring(2, 6).toUpperCase()
    : "";

  return (
    <div
      style={{ gap: "6px" }}
      tw={
        "flex flex-shrink items-start " +
        (anchor === "right" ? "flex-row-reverse" : "flex-row")
      }
    >
      <div
        style={{
          backgroundColor: bubbleColor,
          borderColor: borderColor,
          flexGrow: 0,
          flexShrink: 0,
          height: "48px",
          width: "48px",
        }}
        tw="rounded-full border-2 border-gray-700 bg-white overflow-hidden flex items-center justify-center"
      >
        {profile?.imgUrl ? (
          <img
            src={profile?.imgUrl}
            width={48}
            height={48}
            alt={profile.address + " profile image"}
            tw={"object-contain"}
          />
        ) : (
          <FaUser size={24} color={borderColor} />
        )}
      </div>
      <div
        style={{ backgroundColor: bubbleColor, borderColor: borderColor }}
        tw={
          "flex-grow flex-shrink overflow-hidden mt-1 flex flex-col p-3 border-2 border-black rounded-xl bg-gray-700 " +
          (anchor === "right" ? "rounded-tr-none" : "rounded-tl-none")
        }
      >
        <div
          style={{ gap: "3rem" }}
          tw={
            "flex items-center justify-between " +
            (anchor === "right" ? "flex-row-reverse" : "flex-row")
          }
        >
          <div
            style={{
              color: textColor,
              wordBreak: "break-all",
              overflowWrap: "break-word",
            }}
            tw="flex text-sm font-semibold text-white h-full"
          >
            {profile?.name ? (
              nameSuffix ? (
                <span tw="text-inherit opacity-75">
                  {profile!.name + nameSuffix}
                </span>
              ) : (
                profile!.name
              )
            ) : (
              <span>
                Anonymous
                {nameSuffix && (
                  <span tw="text-inherit opacity-75">{nameSuffix}</span>
                )}
              </span>
            )}
          </div>
          {Boolean(reward) && (
            <span
              style={{ color: textColor, borderColor: textColor }}
              tw={
                "border-2 border-black rounded-full px-1 text-xs font-semibold text-gray-400 opacity-75 "
              }
            >
              {parseFloat(ethers.formatEther(BigInt(reward!)))} LYX
            </span>
          )}
        </div>
        <div
          style={{
            color: textColor,
            wordBreak: "break-all",
            overflowWrap: "break-word",
            textAlign: "start",
          }}
          tw={
            "flex-grow flex text-sm font-normal py-2 my-1 px-2 shadow-inner text-white bg-black rounded-lg bg-opacity-10 justify-start " +
            (anchor === "right" ? "flex-row-reverse" : "flex-row")
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
