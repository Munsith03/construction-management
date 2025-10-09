import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useContext(AuthContext);

  useEffect(() => {
    // Extract token from query params
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Save token in localStorage
      localStorage.setItem("token", token);
      setToken(token);

      // (Optional) Fetch user details with token
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((userData) => {
          setUser(userData);
          navigate("/home"); // ✅ Redirect to dashboard
        })
        .catch(() => {
          navigate("/signin"); // fallback in case of error
        });
    } else {
      navigate("/signin"); // No token → back to signin
    }
  }, [location, navigate, setToken, setUser]);

  return <p className="text-center mt-10">Signing you in...</p>;
};

export default AuthCallback;
