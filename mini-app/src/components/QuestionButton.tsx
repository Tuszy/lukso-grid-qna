// Icon
import { TbPencilQuestion } from "react-icons/tb";

// Button
import NavigationButton from "./NavigationButton";

function QuestionButton() {
  return (
    <NavigationButton path="/question" tooltip="Ask Question">
      <TbPencilQuestion color="white" size={"28px"} />
    </NavigationButton>
  );
}

export default QuestionButton;
