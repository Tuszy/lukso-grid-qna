// React
import { ReactNode } from "react";

function IconButton({
  children,
  onClick,
  tooltip,
  isActive,
}: {
  children: ReactNode;
  onClick: () => void;
  tooltip?: string;
  isActive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative cursor-pointer group bg-black rounded-full w-12 h-12 grid place-content-center border-2 border-gray-300 hover:bg-gray-700 active:bg-gray-600 drop-shadow-mg ${
        isActive ? "ring-2 ring-green-600" : ""
      } `}
      disabled={isActive}
    >
      {children}

      <div className="pointer-events-none opacity-100 font-semibold border-2 shadow-2xl hidden w-max text-base absolute -bottom-6 left-9 drop-shadow-2xl bg-gray-200 px-1 z-10 group-hover:block rounded-lg rounded-tl-none border-black break-keep">
        {tooltip}
      </div>
    </button>
  );
}

export default IconButton;
