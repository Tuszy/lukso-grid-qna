// Icon
import { IoIosColorPalette } from "react-icons/io";

// Button
import NavigationButton from "./NavigationButton";

function ColorConfigButton() {
  return (
    <NavigationButton path="/color-config" tooltip="Config Colors">
      <IoIosColorPalette color="white" size={"32px"} />
    </NavigationButton>
  );
}

export default ColorConfigButton;
