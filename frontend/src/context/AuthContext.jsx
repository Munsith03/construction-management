import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User data fetched:", response.data);
          setUser(response.data);
        })
        .catch(() => {
          setToken("");
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const register = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
      {
        email,
        password,
      }
    );
    return response.data;
  };

  const login = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        email,
        password,
      }
    );

    setToken(response.data.token);
    setUser(response.data.user);

    localStorage.setItem("token", response.data.token);
  };

  const verifyOTP = async (email, code) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
      {
        email,
        code,
      }
    );
    return response.data;
  };

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
