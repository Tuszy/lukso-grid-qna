// React
import { Children } from "react";

// Color
import { defaultColor } from "../utils/colorUtils";

function Messages({
  children,
  center,
  backgroundColor,
}: {
  children: React.ReactNode;
  center?: boolean;
  backgroundColor?: string;
}) {
  const count = Children.count(children);
  backgroundColor ??= defaultColor.lm;
  return (
    <div
      style={{ backgroundColor: backgroundColor }}
      className={
        "relative flex-grow bg-white flex-shrink flex flex-col w-full gap-2 p-1 overflow-y-auto overflow-x-hidden " +
        (count <= 1 || center ? "justify-center" : "justify-start")
      }
    >
      {children}
    </div>
  );
}

export default Messages;
