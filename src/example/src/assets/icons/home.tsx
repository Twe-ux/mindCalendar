import { Link } from "react-router-dom";

export default function IconHome() {
  return (
    <Link
      className="text-white text-xl cursor-pointer fa-solid fa-house-user"
      to="/user"
    ></Link>
  );
}
