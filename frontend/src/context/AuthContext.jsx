import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // ✅ Fetch user when token changes
  useEffect(() => {
    if (token) {
      console.log("AuthContext token:", user); // Debug log
      axios
        .get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User data fetched:", response.data);
          setUser(response.data);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setToken("");
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  // ✅ Email/password register
  const register = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      { email, password }
    );
    return response.data;
  };

  // ✅ Email/password login
  const login = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      { email, password }
    );

    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem("token", response.data.token);
  };

  // ✅ OTP verification
  const verifyOTP = async (email, code) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
      { email, code }
    );
    return response.data;
  };

  // ✅ Handle Google login callback
  const handleGoogleCallback = () => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      // Save immediately
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);

      // ✅ Use tokenFromUrl here, not token
      axios
        .get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${tokenFromUrl}` },
        })
        .then((res) => {
          setUser(res.data);
          navigate("/dashboard"); // redirect after success
        })
        .catch((err) => {
          console.error("Google login failed:", err);
          navigate("/signin");
        });
    } else {
      console.warn("No token found in URL");
      navigate("/signin");
    }
  };

  // ✅ Logout
  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        setUser,
        register,
        login,
        verifyOTP,
        handleGoogleCallback, // ⬅️ added for Google login
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
