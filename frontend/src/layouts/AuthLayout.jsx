import { Outlet, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi"; // Feather-style clean arrow

function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen font-sourceSans relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center text-white gap-2 px-4 py-2 rounded-full  transition-all duration-200"
        aria-label="Return to main site"
      >
        <FiArrowLeft size={20} />
        Return To Home
      </button>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-center bg-black text-white p-20 w-1/3 shadow-xl">
        <h1 className="text-5xl font-extrabold">UISplash</h1>
        <p className="mt-6 text-lg leading-relaxed">
          Get access to{" "}
          <span className="font-semibold text-green-400">442,527+</span> free
          web UI components you can’t find anywhere else.
        </p>
      </div>

      {/* Auth Page Content */}

      <Outlet />
    </div>
  );
}

export default AuthLayout;
