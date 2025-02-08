import { Navigate } from "react-router-dom";
import ContextProfileInjector from "../components/ContextProfileInjector";
import Overview from "../view/Overview";
import Setup from "../view/Setup";
import Config from "../view/Config";
import Answer from "../view/Answer";
import Question from "../view/Question";
import ColorConfig from "../view/ColorConfig";
import PersonalOverview from "../view/PersonalOverview";
import TextConfig from "../view/TextConfig";

const Router = [
  {
    path: "/",
    children: [
      {
        path: "/",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => <Overview contextProfile={contextProfile} />}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/personal",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => (
              <PersonalOverview contextProfile={contextProfile} />
            )}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/question",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => <Question contextProfile={contextProfile} />}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/answer/:questionIndex",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => <Answer contextProfile={contextProfile} />}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/setup",
        exact: true,
        element: (
          <ContextProfileInjector stopRedirect={true}>
            {(contextProfile) => <Setup contextProfile={contextProfile} />}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/config",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => <Config contextProfile={contextProfile} />}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/color-config",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => (
              <ColorConfig contextProfile={contextProfile} />
            )}
          </ContextProfileInjector>
        ),
      },
      {
        path: "/text-config",
        exact: true,
        element: (
          <ContextProfileInjector>
            {(contextProfile) => <TextConfig contextProfile={contextProfile} />}
          </ContextProfileInjector>
        ),
      },
      { path: "*", element: <Navigate to="/overview" /> },
    ],
  },
];

export default Router;
