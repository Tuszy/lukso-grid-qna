// Icon
import { FaPersonCircleQuestion } from "react-icons/fa6";

// Button
import NavigationButton from "./NavigationButton";

function PersonalOverviewButton() {
  return (
    <NavigationButton path="/personal" tooltip="My Questions">
      <FaPersonCircleQuestion color="white" size={"32px"} />
    </NavigationButton>
  );
}

export default PersonalOverviewButton;
