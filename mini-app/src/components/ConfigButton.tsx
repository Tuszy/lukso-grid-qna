// Icon
import { IoMdSettings } from "react-icons/io";

// Button
import NavigationButton from "./NavigationButton";

function ConfigButton() {
  return (
    <NavigationButton path="/config" tooltip="Config Q&A">
      <IoMdSettings color="white" size={"32px"} />
    </NavigationButton>
  );
}

export default ConfigButton;
