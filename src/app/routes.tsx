import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Splash from "./pages/Splash";
import Explore from "./pages/Explore";
import Library from "./pages/Library";
import ARCamera from "./pages/ARCamera";
import UploadTattoo from "./pages/UploadTattoo";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Splash },
      { path: "splash", Component: Splash },
      { path: "explore", Component: Explore },
      { path: "library", Component: Library },
      { path: "upload", Component: UploadTattoo },
      { path: "ar-camera", Component: ARCamera },
      { path: "ar-camera/:tattooId", Component: ARCamera },
    ],
  },
]);