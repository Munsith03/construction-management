import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const AuthCallback = () => {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  }, [location, setToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
};

export default AuthCallback;
