import { Link } from "react-router";

export default function IconInBox() {
  return (
    <Link
      to="/user/message"
      className="text-white text-xl cursor-pointer fa-solid fa-inbox"
    ></Link>
  );
}
