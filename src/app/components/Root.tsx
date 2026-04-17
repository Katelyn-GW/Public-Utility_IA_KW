import { Outlet } from "react-router";

export default function Root() {
  return (
    <div className="min-h-screen bg-[#8dd7ca]">
      <Outlet />
    </div>
  );
}
