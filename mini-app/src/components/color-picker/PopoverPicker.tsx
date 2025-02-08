import { useCallback, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

import useClickOutside from "./useClickOutside";

export const PopoverPicker = ({
  color,
  setColor,
  name,
}: {
  name: string;
  color: string;
  setColor: (c: string) => void;
}) => {
  const popover = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <div className="picker">
      <div
        className={`relative cursor-pointer peer rounded-lg w-7 h-7 border-[3px] border-gray-200 ring-1 shadow-inner ring-black drop-shadow-xl ${
          isOpen ? "animate-pulse border-green-500" : ""
        }`}
        style={{ backgroundColor: color }}
        onClick={() => toggle(true)}
      ></div>

      <div className="pointer-events-none drop-shadow-xl hidden w-max text-sm absolute -bottom-[6px] left-4 bg-gray-200 px-1 z-10 peer-hover:block rounded-lg rounded-tl-none border border-black break-keep">
        {name}
      </div>

      {isOpen && (
        <div className="popover" ref={popover}>
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )}
    </div>
  );
};
