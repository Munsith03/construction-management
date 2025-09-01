import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-700 mt-4">
          You are not authorized to view this page.
        </p>
        <button
          onClick={() => navigate("/")} // Navigate directly to home
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
