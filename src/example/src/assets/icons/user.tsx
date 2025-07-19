import { Link } from "react-router";

export default function IconUser() {
  return (
    <Link
      to="/login"
      className="text-white text-xl cursor-pointer fa-regular fa-circle-user"
    ></Link>
  );
}
