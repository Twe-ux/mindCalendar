import { Outlet } from "react-router-dom";
import ComponentPanel from "../component/panel";

export default function Main() {
  return (
    <div className="flex w-full justify-around items-center">
      <div className="flex w-full h-full">
        <ComponentPanel />
        {/* <Login /> */}
        <Outlet />
      </div>
    </div>
  );
}
