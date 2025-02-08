// React
import { useState } from "react";

// Hooks
import { BigNumberish, ethers } from "ethers";

function MinimumRewardInput({
  text = "MINIMUM REWARD",
  setMinimumReward,
  disabled,
  currentMinimumReward,
  error,
}: {
  text?: string;
  minimumReward: BigNumberish;
  setMinimumReward: (value: BigNumberish) => void;
  currentMinimumReward: BigNumberish;
  disabled: boolean;
  error?: string;
}) {
  const [minimumRewardInput, setMinimumRewardInput] = useState<string>("");

  const onChangeMinimumReward = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.value !== "") {
        setMinimumReward(ethers.parseEther(e.target.value));
      } else {
        setMinimumReward(currentMinimumReward);
      }
      setMinimumRewardInput(e.target.value);
    } catch (e) {
      console.log(e);
    }
  };

  const currentMinimumRewardAsString = currentMinimumReward
    ? ethers.formatEther(currentMinimumReward)
    : undefined;

  return (
    <div
      className={`relative flex flex-row border-4 rounded-lg border-black overflow-hidden flex-shrink-0 flex-grow-0 w-full ${
        disabled && "opacity-50 select-none"
      }`}
    >
      <label
        htmlFor="minimumReward"
        className="text-sm bg-black text-white p-1.5 -top-1 py-0.5 flex items-center justify-start select-none"
      >
        {text}
      </label>
      <div className="flex-grow w-full flex relative pt-1">
        <input
          id="minimumReward"
          className={
            "text-black bg-white font-bold flex items-center justify-center p-2 flex-grow w-full text-right rounded-lg placeholder:select-none disabled:select-none focus:outline-none "
          }
          style={{
            background: (error?.length ?? 0) > 0 ? "#faa" : undefined,
          }}
          placeholder={currentMinimumRewardAsString}
          value={minimumRewardInput}
          onChange={onChangeMinimumReward}
          disabled={disabled}
        />
        <div className="select-none absolute -bottom-[3px] text-xs text-red-700 font-semibold left-0 right-0 text-center animate-bounce">
          {error}
        </div>
      </div>
      <div className="flex-shrink-0 flex-grow-0 pl-2 pr-6 border-l-2 border-black bg-black text-white font-bold flex items-center justify-center select-none">
        LYX
      </div>
    </div>
  );
}

export default MinimumRewardInput;
