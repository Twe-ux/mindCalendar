// import { Link } from "react-router";

export default function IconSliders() {
  return (
    <div>
      <button
        onClick={() => {
          const panel = document.getElementById("panel");
          // const home = document.getElementById("home");
          // console.log(home);

          // home?.removeEventListener("/user");
          panel?.classList.add("hidden");
        }}
        className="text-white text-xl cursor-pointer fa-solid fa-right-to-bracket fa-flip-horizontal"
      ></button>
    </div>
  );
}
