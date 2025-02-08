// Routing
import Router from "./routes/Router";
import { useLocation, useRoutes } from "react-router-dom";

// Toast
import { Bounce, ToastContainer } from "react-toastify";

// Styling
import "./App.css";

// Icon
import LuksoLogo from "./assets/lukso logo.svg";

// UP
import { useUpProvider } from "./context/UpProvider";

// Navigation
import NavigationButtonPanel from "./components/NavigationButtonPanel";
import ConfigButton from "./components/ConfigButton";
import OverviewButton from "./components/OverviewButton";
import ColorConfigButton from "./components/ColorConfigButton";
import QuestionButton from "./components/QuestionButton";
import PersonalOverviewButton from "./components/PersonalOverviewButton";
import TextConfigButton from "./components/TextConfigButton";

function App() {
  const upContext = useUpProvider();
  const location = useLocation();
  const routing = useRoutes(Router);

  return (
    <>
      {routing}
      {upContext.walletConnected &&
        !location.pathname.startsWith("/setup") &&
        !upContext.isWaitingForTx && (
          <NavigationButtonPanel>
            {<OverviewButton />}
            {!upContext.isConnectedToContextAccount && (
              <PersonalOverviewButton />
            )}
            {!upContext.isConnectedToContextAccount && <QuestionButton />}
            {upContext.isConnectedToContextAccount && <ColorConfigButton />}
            {upContext.isConnectedToContextAccount && <TextConfigButton />}
            {upContext.isConnectedToContextAccount && <ConfigButton />}
          </NavigationButtonPanel>
        )}
      {upContext.isWaitingForTx && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.65)] z-10 grid place-content-center transition-all select-none">
          <img
            draggable={false}
            src={LuksoLogo}
            width={64}
            height={64}
            className="animate-[spin_3s_linear_infinite] opacity-100"
          />
        </div>
      )}

      <ToastContainer
        className={"z-50"}
        closeButton={false}
        closeOnClick={false}
        autoClose={3000}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        theme="dark"
        transition={Bounce}
        draggable={false}
      />
    </>
  );
}

export default App;
