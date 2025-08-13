import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const SignUp = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        newErrors.name =
          value.length >= 2 && value.length <= 50
            ? ""
            : "Name must be 2-50 characters long.";
        break;
      case "email":
        newErrors.email =
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
            ? ""
            : "Please enter a valid email address.";
        break;
      case "password":
        newErrors.password =
          value.length >= 8 && value.length <= 20
            ? ""
            : "Password must be 8-20 characters long.";
        break;
      case "confirmPassword":
        newErrors.confirmPassword =
          value === formData.password ? "" : "Passwords do not match.";
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateAllFields = () => {
    validateField("name", formData.name);
    validateField("email", formData.email);
    validateField("password", formData.password);
    validateField("confirmPassword", formData.confirmPassword);
    return (
      Object.values(errors).every((error) => error === "") &&
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== ""
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateAllFields();

    if (!isValid) {
      const firstErrorField = Object.keys(errors).find(
        (key) => errors[key] !== ""
      );
      const fieldMap = {
        name: "input[name='name']",
        email: "input[name='email']",
        password: "input[name='password']",
        confirmPassword: "input[name='confirmPassword']",
      };
      if (firstErrorField) {
        const input = document.querySelector(fieldMap[firstErrorField]);
        input.setAttribute("title", "Fill correctly");
        input.focus();
      }
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setErrors({
        form: err.response?.data?.error || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-2/3">
      <div className="w-96 max-w-lg bg-white rounded-lg overflow-hidden ">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
              Create an Account
            </h1>
            <p className="text-gray-600 mt-2">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-blue-500 hover:underline font-medium"
              >
                Sign In
              </a>
            </p>
          </div>

          {errors.form && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {errors.form}
            </div>
          )}

          <div className="space-y-3">
            <a
              href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
              className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5 mr-4"
              />
              Continue with Google
            </a>
            <a
              href={`${import.meta.env.VITE_API_URL}/api/auth/facebook`}
              className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/355033/facebook.svg"
                alt="Facebook"
                className="w-5 h-5 mr-4"
              />
              Continue with Facebook
            </a>
            <a
              href={`${import.meta.env.VITE_API_URL}/api/auth/github`}
              className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/355036/github.svg"
                alt="GitHub"
                className="w-5 h-5 mr-4"
              />
              Continue with GitHub
            </a>
            <a
              href={`${import.meta.env.VITE_API_URL}/api/auth/apple`}
              className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/355032/apple.svg"
                alt="Apple"
                className="w-5 h-5 mr-4"
              />
              Continue with Apple
            </a>
          </div>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-sm text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative bg-inherit">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-gray-500 focus:outline-none focus:border-gray-600 transition-all"
                placeholder="Enter your name"
                required
              />
              <label
                htmlFor="name"
                className="absolute cursor-text left-4 -top-3 text-sm text-gray-600 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all"
              >
                Name
              </label>
              {errors.name && (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
              )}
            </div>

            {/* Email Input */}
            <div className="relative bg-inherit">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-gray-500 focus:outline-none focus:border-gray-600 transition-all"
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
                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative bg-inherit">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-gray-500 focus:outline-none focus:border-gray-600 transition-all"
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
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {/* Confirm Password Input */}
            <div className="relative bg-inherit">
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-gray-500 focus:outline-none focus:border-gray-600 transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute cursor-text left-4 -top-3 text-sm text-gray-600 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all"
                >
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-2">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg focus:outline-none transition-colors flex items-center justify-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 text-white"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-5 h-5 mr-2 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="#1C64F2"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-gray-600 text-center mt-4">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline text-black hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline text-black hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
