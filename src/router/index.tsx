import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/Layout";
import HomePage from "../pages/HomePage";
import PrepareCustomSVG from "../components/PrepareCustomSVG";
import CustomTemplatePage from "../components/CustomTemplatePage";
import TemplatePage from "@/pages/TemplatePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "template/:templateId",
        element: <TemplatePage />,
      },
      {
        path: "prepare",
        element: <PrepareCustomSVG />,
      },
      {
        path: "custom-template",
        element: <CustomTemplatePage />,
      },
    ],
  },
]);

export default router;
