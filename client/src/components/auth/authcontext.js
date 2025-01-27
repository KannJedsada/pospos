// import React, { createContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authData, setAuthData] = useState(() => {
//     const token = localStorage.getItem("token");
//     const id_card = localStorage.getItem("id_card");
//     return token && id_card ? { token, id_card } : {};
//   });

//   useEffect(() => {
//     const checkTokenExpiration = () => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         const payload = JSON.parse(atob(token.split(".")[1]));
//         const now = Math.floor(Date.now() / 1000);
//         if (payload.exp < now) {
//           logout();
//         }
//       }
//     };
//     checkTokenExpiration(); 
//     const interval = setInterval(checkTokenExpiration, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const login = (token, id_card) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("id_card", id_card);
//     setAuthData({ token, id_card });
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("id_card");
//     setAuthData({});
//   };

//   return (
//     <AuthContext.Provider value={{ authData, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
import React, { createContext, useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    const token = localStorage.getItem("token");
    const id_card = localStorage.getItem("id_card");
    return token && id_card ? { token, id_card } : {};
  });

  const [access, setAccess] = useState(() => {
    const savedAccess = localStorage.getItem("access");
    return savedAccess ? JSON.parse(savedAccess) : null; // ดึงค่า access จาก localStorage
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

  useEffect(() => {
    const fetchData = async () => {
      if (window.location.pathname === "/login") {
        return;
      }

      if (authData.token && authData.id_card) {
        try {
          const res = await axios.get(`/api/emp/data/${authData.id_card}`, {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          });
          const fetchedAccess = res.data.data[0].access;

          // บันทึก access ลง localStorage
          setAccess(fetchedAccess);
          localStorage.setItem("access", JSON.stringify(fetchedAccess));
        } catch (error) {
          console.error("Failed to fetch access data", error);
          logout(); // logout หากไม่สามารถดึงข้อมูลได้
        }
      }
    };
    fetchData();
  }, [authData]);

  const login = (token, id_card) => {
    localStorage.setItem("token", token);
    localStorage.setItem("id_card", id_card);
    setAuthData({ token, id_card });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_card");
    localStorage.removeItem("access");
    setAuthData({});
    setAccess(null);
  };

  return (
    <AuthContext.Provider value={{ authData, access, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
