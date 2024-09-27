// utils/socket.js
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // ปรับพอร์ตตามเซิร์ฟเวอร์ของคุณ

export default socket;
