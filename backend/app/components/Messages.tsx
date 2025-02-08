// Color
import { defaultColor } from "../utils/colorUtils";

function Messages({
  children,
  backgroundColor,
}: {
  children: React.ReactNode;
  center?: boolean;
  backgroundColor?: string;
}) {
  backgroundColor ??= defaultColor.lm;
  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        overflow: "hidden",
        gap: "1rem",
      }}
      tw={
        "relative w-full flex-grow bg-white flex-shrink flex flex-col p-1 justify-center"
      }
    >
      {children}
    </div>
  );
}

export default Messages;
