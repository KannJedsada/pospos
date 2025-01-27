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
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState(() => {
    const token = localStorage.getItem("token");
    const id_card = localStorage.getItem("id_card");
    return token && id_card ? { token, id_card } : {};
  });
  const [access, setAccess] = useState(() => {
    // ดึงค่า access จาก LocalStorage เมื่อเริ่มต้น
    const savedAccess = localStorage.getItem("access");
    return savedAccess ? JSON.parse(savedAccess) : null;
  });

  // เช็ก token หมดอายุ
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
    const interval = setInterval(checkTokenExpiration, 60000); // เช็กทุก 60 วินาที
    return () => clearInterval(interval);
  }, []);

  // ดึงข้อมูล access เมื่อ authData เปลี่ยนแปลง
  useEffect(() => {
    const fetchData = async () => {
      if (authData.token && authData.id_card) {
        try {
          const res = await axios.get(`/api/emp/data/${authData.id_card}`, {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          });
          const userAccess = res.data.data[0].access;
          setAccess(userAccess);
          localStorage.setItem("access", JSON.stringify(userAccess)); // เก็บ access ใน LocalStorage
        } catch (error) {
          console.error("Failed to fetch access data", error);
          logout(); // หากเกิดปัญหา เช่น token ไม่ถูกต้อง ให้ลบข้อมูลและไปหน้า login
        }
      } else {
        navigate("/login");
      }
    };

    fetchData();
  }, [authData, navigate]);

  const login = (token, id_card) => {
    localStorage.setItem("token", token);
    localStorage.setItem("id_card", id_card);
    setAuthData({ token, id_card });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_card");
    localStorage.removeItem("access"); // ลบ access ออกจาก LocalStorage
    setAuthData({});
    setAccess(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ authData, access, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
