// utils/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // ปรับตามพอร์ตที่ใช้งาน
  headers: { "Content-Type": "application/json" },
});

export default instance;
