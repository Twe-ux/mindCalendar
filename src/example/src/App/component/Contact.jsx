export default function Contact(props) {
  return (
    <div className="users flex rounded-md gap-2 items-center">
      <div className=" h-12 w-12 rounded-md flex-shrink-0 ">
        <img
          className=" size-12"
          src="/src/assets/img/avatar-homme2.png"
          alt=""
        />
      </div>
      <div className="flex flex-col h-12 w-full rounded-md">
        <div>
          <div className=" flex gap-3 items-baseline">
            <div className="name">{props.name}</div>
            <p className="object">{props.object}</p>
          </div>
          <div className="resume flex items-baseline">
            <p>Lorem ipsum dolor sit amet, consectetur</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center pr-3">
        <div className="time">
          <p>12h15</p>
        </div>
        <div className="badge">
          <p>1</p>
        </div>
      </div>
    </div>
  );
}
