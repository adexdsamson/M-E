// import notfound from "../assets/404.gif";

export function NotFound() {
  return (
    <div className="container mx-auto h-screen grid xl:grid-cols-2 gap-8 justify-center">
      <div className="flex items-center">
        {/* <img className="w-full" src={notfound} alt="" /> */}
      </div>
      <div className="flex flex-col items-center xl:items-start xl:justify-center xl:text-left text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-8">
          Oops,
          <br />
          <span className="text-primary">Page not found</span>
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          The page you are looking for is either removed or does not exist.
          {/* {getEnvironment("DEVELOPMENT") && <pre>{error.message}</pre>} */}
        </p>
        <a
          href="/"
          className="px-4 py-2 rounded-lg underline text-primary underline-offset-2"
        >
          Home
        </a>
      </div>
    </div>
  );
}
