import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "./authcontext";
import Swal from "sweetalert2";

const Login = () => {
  const [idCard, setIdCard] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-lg flex items-center justify-center shadow-md ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600"
                }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </div>

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
