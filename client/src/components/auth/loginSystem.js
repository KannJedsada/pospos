import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "./authcontext";
import Swal from "sweetalert2";

const LoginSystem = () => {
  const [idCard, setIdCard] = useState("");
  const [email, setEmail] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", {
        id: idCard,
        email: email,
      });
      login(response.data.token, response.data.id_card);

      const access = await axios.get(
        `/api/emp/empdept/${response.data.id_card}`
      );
      // console.log(access.data.data);
      const acc = access?.data?.data?.access;
      if (acc === 2 || acc === 1 || acc === 0) {
        navigate("/manager");
      } else if (acc === 3) {
        navigate("/kitchen");
      } else if (acc === 4) {
        navigate("/order");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบล้มเหลว",
        text: "อีเมลหรือเลขประจำตัวไม่ถูกต้อง",
      });
      console.error("Login failed", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex items-center  justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              อีเมล
            </label>
            <input
              id="email"
              type="text"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="idCard"
              className="block text-sm font-medium text-gray-700"
            >
              เลขประจำตัว
            </label>
            <input
              id="idCard"
              type="password"
              placeholder="เลขประจำตัว"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            เข้าสู่ระบบ
          </button>
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="px-4 py-2 hover:underline text-blue-500"
              onClick={() => navigate("/login")}
            >
              เข้าสู่ระบบดูตารางงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSystem;
