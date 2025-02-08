// React
import { ReactNode } from "react";

// Router
import { useLocation, useNavigate } from "react-router-dom";

// Button
import IconButton from "./IconButton";

// Button

function NavigationButton({
  children,
  path,
  tooltip,
}: {
  children: ReactNode;
  path: string;
  tooltip?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const onClick = () => navigate(path);

  const isActive = location.pathname === path;

  return (
    <IconButton onClick={onClick} tooltip={tooltip} isActive={isActive}>
      {children}
    </IconButton>
  );
}

export default NavigationButton;
