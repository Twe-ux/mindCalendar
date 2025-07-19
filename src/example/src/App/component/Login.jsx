export default function Login() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="w-1/5 h-2/5">
        <main className="bg-teal-400">
          <div className="flex flex-col gap-8 justify-center items-center">
            <div className="title mt-5 text-white">
              <p className="size-7 font-bold w-full text-white">
                Create account
              </p>
            </div>
            <form className="flex flex-col gap-3 ">
              {/* <form onSubmit={handleSubmit}> */}
              <div className="flex flex-col">
                <label htmlFor="username">Name</label>
                <input
                  className="rounded-md"
                  //   type="text"
                  //   name="username"
                  //   placeholder="Jean Dupont"
                  //   id="username"
                  //   value={username}
                  //   onChange={(event) => {
                  //     setUsername(event.target.value);
                  //     // console.log("log=>", username);
                  //   }}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <input
                  className="rounded-md"

                  //   type="email"
                  //   name="email"
                  //   placeholder="jean.dupont@lereacteur.io"
                  //   id="email"
                  //   value={email}
                  //   onChange={(event) => {
                  //     setEmail(event.target.value);
                  //   }}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="password">Password</label>
                <input
                  className="rounded-md"

                  //   className={border}
                  //   type="password"
                  //   name="password"
                  //   placeholder="qdfKL242"
                  //   id="password"
                  //   value={password}
                  //   onChange={(event) => {
                  //     setPassword(event.target.value);
                  //   }}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="confirmPassword">Confirm your password</label>
                <input
                  className="rounded-md"
                  //   className={border}
                  type="password"
                  name="password"
                  placeholder="qdfKL242"
                  id="confirmPassword"
                  //   value={confirmPassword}
                  //   onChange={(event) => {
                  //     setConfirmPassword(event.target.value);
                  //   }}
                />
              </div>

              <button className="mb-4 mt-4 text-white bg-teal-800 ">
                Registrer
              </button>
              {/* {errorMessage && <p>{errorMessage}</p>}
              {password !== confirmPassword && (
                <p>les mots de passe ne sont pas identiques</p>
              )} */}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
