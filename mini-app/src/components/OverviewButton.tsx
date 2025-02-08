// Icon
import { IoChatbubblesSharp } from "react-icons/io5";

// Button
import NavigationButton from "./NavigationButton";

function OverviewButton() {
  return (
    <NavigationButton path="/" tooltip="All Questions">
      <IoChatbubblesSharp color="white" size={"24px"} />
    </NavigationButton>
  );
}

export default OverviewButton;
