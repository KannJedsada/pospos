// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./authcontext";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      logout();
      navigate("/login", { replace: true });
    };

    performLogout();
  }, [logout, navigate]);

  return null;
};

export default Logout;
