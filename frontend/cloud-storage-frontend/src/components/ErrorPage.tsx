const ErrorPage = ({ code }: { code: number }) => {
  let message = "Something went wrong";

  if (code === 404) {
    message = "Page not found";
  } else if (code === 500) {
    message = "Server error — please try again later";
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Error {code}</h1>
      <p className="text-gray-600">{message}</p>
      <a href="/" className="mt-4 text-blue-600 underline">Go Home</a>
    </div>
  );
};

export default ErrorPage;
