import { useAuth } from "../../../contexts/authContext";
import { Link } from "react-router-dom";
import InfiniteTicker from "../../../components/InfiniteTicker";

const Home = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-lvh bg-lime-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to UberEats
      </h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
        Order delicious food from local restaurants, delivered fast.
      </p>
      <InfiniteTicker />

      {isAuthenticated ? (
        userRole === "customer" ? (
          <>
            <p className="text-gray-600 mb-4">
              Hello, {userRole}! Ready to order?
            </p>
            <Link
              to="/restaurants"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Browse Restaurants
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">Hello, {userRole}!</p>
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Go to Dashboard
            </Link>
          </>
        )
      ) : (
        <p className="text-gray-600">
          Please{" "}
          <Link to="/login" className="text-black hover:underline">
            log in
          </Link>{" "}
          or{" "}
          <Link to="/register" className="text-black hover:underline">
            sign up
          </Link>{" "}
          to start ordering.
        </p>
      )}
    </div>
  );
};

export default Home;
