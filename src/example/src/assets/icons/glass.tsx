import { Link } from "react-router-dom";

export default function IconGlass() {
  return (
    <Link
      to="/user/message"
      className="text-white text-xl cursor-pointer fa-solid fa-magnifying-glass"
    ></Link>
  );
}
