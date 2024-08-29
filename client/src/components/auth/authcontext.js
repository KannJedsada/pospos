import React, { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    const token = localStorage.getItem("token");
    const id_card = localStorage.getItem("id_card");
    return token && id_card ? { token, id_card } : {};
  });

  const login = (token, id_card) => {
    localStorage.setItem("token", token);
    localStorage.setItem("id_card", id_card);
    setAuthData({ token, id_card });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_card");
    setAuthData({});
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
