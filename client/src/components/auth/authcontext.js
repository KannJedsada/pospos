import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    const token = localStorage.getItem("token");
    const id_card = localStorage.getItem("id_card");
    return token && id_card ? { token, id_card } : {};
  });

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          logout();
        }
      }
    };
    checkTokenExpiration(); 
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

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
