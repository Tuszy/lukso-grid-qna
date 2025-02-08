// Icon
import { IoIosText } from "react-icons/io";

// Button
import NavigationButton from "./NavigationButton";

function TextConfigButton() {
  return (
    <NavigationButton path="/text-config" tooltip="Config Greeting">
      <IoIosText color="white" size={"28px"} />
    </NavigationButton>
  );
}

export default TextConfigButton;
