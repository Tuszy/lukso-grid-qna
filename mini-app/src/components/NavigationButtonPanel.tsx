import { PropsWithChildren } from "react";
import { FaChevronDown } from "react-icons/fa6";

function NavigationButtonPanel({ children }: PropsWithChildren) {
  return (
    <nav className="absolute mx-auto -top-[62px] isolate hover:-top-1 transition-all duration-300 flex flex-row p-1 px-2 bg-white rounded-b-lg items-center justify-center z-10 border-black border-2 drop-shadow-2xl">
      <div className="bg-white flex flex-row items-center justify-center gap-2">
        {children}
      </div>
      <div className="absolute -bottom-[22px] bg-white -z-10 px-2 rounded-b-full border-black border-2 border-t-0">
        <FaChevronDown size={20} />
      </div>
    </nav>
  );
}

export default NavigationButtonPanel;
