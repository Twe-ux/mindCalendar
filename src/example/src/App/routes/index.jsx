import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../component/Login";
import ComponentMessage from "../component/Message";
import ComponentPanel from "../component/Panel";
import BoxRed from "./boxRed";

const Routes = [
  {
    path: "*",
    element: <App />,
    children: [
      {
        path: "user",
        element: <ComponentPanel />,
        children: [
          {
            path: "message",
            element: <ComponentMessage />,
            children: [
              {
                path: "detail",
                element: <BoxRed />,
              },
            ],
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "message",
        element: <ComponentMessage />,
        children: [
          {
            path: "detail",
            element: <BoxRed />,
          },
        ],
      },
    ],

    // children: [
    //   {
    //     path: "home",
    //     element: <Main />,
    //     // children: [
    //     //   {
    //     //     path: "green",
    //     //     element: <BoxGreen />,
    //     //   },
    //     // ],
    //   },
    //   {
    //     path: "red",
    //     element: <BoxRed />,
    //   },
    //   {
    //     path: "blue",
    //     element: <BoxBlue />,
    //     children: [
    //       {
    //         path: "red",
    //         element: <BoxRed />,
    //       },
    //     ],
    //   },
    //   {
    //     path: "zinc",
    //     element: <BoxZinc />,
    //   },
    //   {
    //     path: "box/*",
    //     element: <BoxRed />,
    //     children: [
    //       {
    //         path: "green",
    //         element: <BoxGreen />,
    //       },
    //     ],
    //   },
    // ],
  },
];

const Router = createBrowserRouter(Routes);
export default Router;
