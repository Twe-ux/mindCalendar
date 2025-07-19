import "../assets/css/App.css";

import Main from "./routes/main";
import IconFacebook from "../assets/icons/facebook";
import IconInstagram from "../assets/icons/instagram";
import IconUser from "../assets/icons/user";
import IconHome from "../assets/icons/home";
import IconInBox from "../assets/icons/inBox";

function App() {
  return (
    <>
      <header>
        <div className=" w-full flex justify-between items-center ">
          <h1
            className="z-10 cursor-pointer absolute flex w-full justify-center
            text-white"
          >
            GMAIL
          </h1>

          <nav className="z-10 relative flex h-12 justify-between items-center w-full">
            <div className="flex gap-6">
              <IconHome />
              <IconInBox />

              <IconFacebook />
              <IconInstagram />
            </div>
            <div className="flex gap-6">
              <IconUser />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex">
        <Main />
      </main>
    </>
  );
}

export default App;
