import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

const OTPVerification = () => {
  const { verifyOTP, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || ""; // Get email from state
  const [formData, setFormData] = useState({
    email: initialEmail,
    code: ["", "", "", "", "", ""],
  });
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...formData.code];
    newCode[index] = value;
    setFormData({ ...formData, code: newCode });

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !formData.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...formData.code];

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setFormData({ ...formData, code: newCode });

    // Focus appropriate input after paste
    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = formData.code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    try {
      await verifyOTP(formData.email, fullCode);
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      setError("Please provide an email address");
      return;
    }
    try {
      await register(formData.email, "temp_password"); // Password ignored for existing users
      setResendMessage("New OTP sent to your email.");
      setError("");
      setFormData({ ...formData, code: ["", "", "", "", "", ""] });
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
      setResendMessage("");
    }
  };

  const isCodeComplete = formData.code.every((digit) => digit !== "");

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-2/3">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate("/signup")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">Back to Sign Up</span>
        </button>

        {/* Main content */}
        <div className="bg-white rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            OTP Verification
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            A 6-digit verification code has been sent to{" "}
            {initialEmail ? (
              <span className="font-medium">{initialEmail}</span>
            ) : (
              "your email"
            )}
            . Please enter it below.
          </p>

          {/* Email input */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-4">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
              readOnly={!!initialEmail}
              className={initialEmail ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          {/* Code input section */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-4">
              Enter your 6-digit security code
            </label>

            <div className="flex gap-3 mb-6">
              {formData.code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-medium border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              ))}
            </div>

            {/* Verify button */}
            <Button
              onClick={handleSubmit}
              disabled={!isCodeComplete}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isCodeComplete
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Verify OTP
            </Button>
          </div>

          {/* Error and success messages */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {resendMessage && (
            <p className="text-green-500 mb-4 text-center">{resendMessage}</p>
          )}

          {/* Resend link */}
          <div className="text-center">
            <span className="text-gray-600">Didn't get the code? </span>
            <button
              onClick={handleResendOTP}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={!formData.email}
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
