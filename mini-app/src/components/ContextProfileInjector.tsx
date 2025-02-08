// React
import { ReactNode } from "react";

// React Router
import { Navigate } from "react-router-dom";

// Icon
import LuksoLogo from "../assets/lukso logo.svg";

// Hooks
import useContextProfile, { ContextProfile } from "../hooks/useContextProfile";

function ContextProfileInjector({
  children,
  stopRedirect,
}: {
  stopRedirect?: boolean;
  children: (contextProfile: ContextProfile) => ReactNode;
}) {
  const { data: contextProfile, isLoading, error } = useContextProfile();

  if (isLoading || !contextProfile)
    return (
      <div className="absolute inset-0 grid place-content-center bg-black/60 transition-all">
        <div className="flex flex-col items-center justify-center gap-4 text-3xl font-black bg-gray-200 rounded-lg p-4 shadow-inner ring-2 ring-gray-400">
          <div className="animate-pulse">LOADING</div>
          <img
            draggable={false}
            src={LuksoLogo}
            width={64}
            height={64}
            className="animate-[spin_3s_linear_infinite] opacity-100"
          />
          <div className="animate-pulse">QUESTION & ANSWER</div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-lg font-bold flex flex-col items-center justify-center w-full mx-0 flex-grow h-full max-h-screen max-w-72 gap-4 text-center">
        {error.message}
      </div>
    );

  if (!contextProfile.qnaContract.address && !stopRedirect) {
    return <Navigate to="/setup" />;
  }

  return children(contextProfile);
}

export default ContextProfileInjector;
