import { useNavigate } from "react-router-dom";

function PageNotFound() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/"); // Update this path as needed
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 text-center">
      <div className="max-w-lg">
        <h1 className="text-9xl font-extrabold text-red-600">404</h1>
        <p className="mt-6 text-2xl font-medium text-gray-800">
          Oops! Page not found.
        </p>
        <p className="mt-2 text-lg text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={handleRedirect}
          className="mt-8 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default PageNotFound;
