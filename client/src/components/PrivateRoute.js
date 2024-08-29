import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthContext from "./auth/authcontext";

const PrivateRoute = () => {
  const { authData } = useContext(AuthContext);
  const location = useLocation();

  if (location.pathname !== "/schedules" && !authData.token) {
    return <Navigate to="/" replace />;
  }
  else if (!authData.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
