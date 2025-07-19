import { Outlet } from "react-router";
import IconGlass from "../../assets/icons/glass";
import IconPenToSquare from "../../assets/icons/pen-to-square";
import IconSliders from "../../assets/icons/sliders";
import Contact from "./Contact";

export default function ComponentPanel() {
  return (
    <div className="flex w-full">
      <div id="panel" className="minW h-full flex flex-col justify-between ">
        <div className=" flex flex-col  gap-4">
          <div className="flex justify-between pl-3 pr-7">
            <IconSliders />
            <IconPenToSquare />
          </div>
          <div className="flex flex-col gap-4 min-w-14 panel p-2  ">
            <div>
              <div className="">
                <div className="flex relative justify-between items-center gap-4 pr-5">
                  <div className="flex w-full">
                    <div className="icon">
                      <IconGlass />
                    </div>
                    <button className="search" type="button">
                      Rechercher un message
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex flex-row justify-between card h-12 mt-3 pr-5">
                    <div className="box w-12 h-12">
                      <img src="/src/assets/img/avatar-homme2.png" alt="" />
                    </div>
                    <div className="box w-12 h-12">
                      <img src="/src/assets/img/avatar-homme.png" alt="" />
                    </div>
                    <div className="box w-12 h-12">
                      <img src="/src/assets/img/avatar-femme.png" alt="" />
                    </div>
                    <div className="box w-12 h-12">
                      <img src="/src/assets/img/avatar-homme.png" alt="" />
                    </div>
                    <div className="box w-12 h-12">
                      <img src="/src/assets/img/avatar-homme2.png" alt="" />
                    </div>
                  </div>
                </div>
                <Contact name="thiery" object="Réunion demain" />
                <Contact name="Christele" object="Demande de rendez vous" />
                <Contact name="Calvin" object="Réunion demain" />
                <Contact name="JB" object="Réunion demain" />
                <Contact name="thiery" object="Réunion demain" />

                {/* <div className=" flex mt-3 overflow-hidden rounded-lg">
            <div className="test overflow-x-scroll flex flex-col gap-5 pr-3 w-full  ">
              hello
            </div>
          </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between p-1 items-center h-min gap-4 overflow-hidden">
          <div className="flex gap-4 overflow-y-scroll">
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
            <div>+</div>
          </div>
          <div className="flex pr-1">+</div>
        </div>
      </div>
      {/* <div className="flex-1"></div> */}

      <Outlet />
    </div>
  );
}
