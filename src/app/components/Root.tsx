import { Outlet } from "react-router";

export default function Root() {
  return (
    <div className="celestial-theme min-h-screen bg-black">
      <Outlet />
    </div>
  );
}
