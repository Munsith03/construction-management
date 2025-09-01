import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { loginUser } from "../../services/authServices";
import googleIcon from "../../assets/icons/google-icon.svg";
import facebookIcon from "../../assets/icons/facebook-icon.svg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../../components/ui/Loader";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate a single field and return the error message (if any)
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "This field is required.";
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
          return "Please enter a valid email address.";
        return "";
      case "password":
        if (!value.trim()) return "This field is required.";
        if (value.length < 8 || value.length > 20)
          return "Password must be 8-20 characters long.";
        return "";
      default:
        return "";
    }
  };

  // Validate all fields and return true if all are valid
  const validateAllFields = () => {
    const newErrors = {
      email: validateField("email", email),
      password: validateField("password", password),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      if (response.success) {
        alert(response.message);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", response.data.token);
        login(response.data.token, response.data.role);
        navigate("/");
      } else {
        setErrors({
          form: `Error ${response.status}: ${
            response.status === 400
              ? "Please ensure all fields are correctly filled."
              : response.status === 401
              ? "Invalid email or password."
              : response.status === 403
              ? "You do not have access."
              : response.message
          }`,
        });
      }
    } catch (error) {
      setErrors({
        form: error.response
          ? `Server Error: ${error.response.data.message}`
          : error.request
          ? "Please check your connection."
          : `Unexpected Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAllFields()) {
      handleLogin();
    } else {
      const firstErrorField = Object.keys(errors).find(
        (key) => errors[key] !== ""
      );
      if (firstErrorField) {
        const fieldMap = {
          email: "input[name='email']",
          password: "input[name='password']",
        };
        const input = document.querySelector(fieldMap[firstErrorField]);
        if (input) {
          input.setAttribute("title", "Fill correctly");
          input.focus();
        }
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-2/3">
      <div className="w-96 max-w-lg bg-white rounded-lg overflow-hidden">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
              Login to your account
            </h1>
            <p className="text-gray-600 mt-2">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-500 hover:underline font-medium p-1"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Form-level errors */}
          {errors.form && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {errors.form}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <img src={googleIcon} alt="Google" className="w-5 h-5 mr-4" />
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <img src={facebookIcon} alt="Facebook" className="w-5 h-5 mr-4" />
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-sm text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Login Form */}
          <form id="loginForm" onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="bg-white rounded-lg max-w-md mx-auto py-2">
              <div className="relative bg-inherit">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                    validateField("email", e.target.value);
                  }}
                  onBlur={(e) => validateField("email", e.target.value)}
                  className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-gray-500 focus:outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute cursor-text left-4 -top-3 text-sm text-gray-600 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all"
                >
                  Email
                </label>
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="bg-white rounded-lg max-w-md mx-auto py-2">
              <div className="relative bg-inherit">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                      validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
                    className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-gray-500 focus:outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <label
                    htmlFor="password"
                    className="absolute cursor-text left-4 -top-3 text-sm text-gray-600 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="text-red-500 text-sm mt-2">
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button with Spinner */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 text-white"
              }`}
            >
              {loading ? <Loader /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
