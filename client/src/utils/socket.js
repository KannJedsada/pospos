import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to server");
});

export default socket;
