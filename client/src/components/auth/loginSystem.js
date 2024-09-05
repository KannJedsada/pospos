import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "./authcontext";

const LoginSystem = () => {
  const [idCard, setIdCard] = useState("");
  const [email, setEmail] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login", {
        id: idCard,
        email: email,
      });
      login(response.data.token, response.data.id_card);
      const deptResponse = await axios.get(
        `/emp/empdept/${response.data.id_card}`
      );
      const dept = deptResponse.data.data.id;
      if (dept === 5) {
        navigate("/manager");
      } else if (dept === 2) {
        navigate("/kitchen");
      }
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="idCard"
              className="block text-sm font-medium text-gray-700"
            >
              ID Card
            </label>
            <input
              id="idCard"
              type="text"
              placeholder="Enter ID Card"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="text"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="px-4 py-2"
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
