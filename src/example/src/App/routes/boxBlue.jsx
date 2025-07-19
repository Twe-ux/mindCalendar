import { Outlet } from "react-router-dom";

export default function BoxBlue() {
  return (
    <div className="flex items-center w-full h-full gap-2">
      <div className="box-blue h-full">
        <h2>blueBox</h2>
      </div>
      <Outlet />
    </div>
  );
}
