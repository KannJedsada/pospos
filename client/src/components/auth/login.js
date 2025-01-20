import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "./authcontext";
import Swal from "sweetalert2";

const Login = () => {
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
      navigate("/schedules");
    } catch (error) {
      if (error.response) {
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบล้มเหลว",
          text: "อีเมลหรือเลขประจำตัวไม่ถูกต้อง",
        });
        console.error("Login failed", error.response.data);
      } else if (error.request) {
        // แจ้งเตือนเมื่อไม่มีการตอบกลับจากเซิร์ฟเวอร์
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        });
        console.error("Login failed", error.request);
      } else {
        // แจ้งเตือนข้อผิดพลาดทั่วไป
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "เกิดปัญหาที่ไม่ทราบสาเหตุ",
        });
        console.error("Login failed", error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">ดูตารางงาน</h2>
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
              onClick={() => navigate("/")}
            >
              เข้าสู่ระบบการจัดการร้านอาหาร
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
