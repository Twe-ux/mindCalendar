import { Outlet } from "react-router";

export default function ComponentMessage() {
  return (
    <div className="flex justify-end items-center w-full h-full gap-2">
      <div className="flex flex-col rounded-md p-3 overflow-x-scroll h-full w-full text-black bg-white">
        hello hello
      </div>
      <Outlet />
    </div>
  );
}
