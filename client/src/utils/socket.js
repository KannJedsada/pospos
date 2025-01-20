import io from "socket.io-client";

const socket = io(process.env.REACT_APP_NGROK_URL_5000, {
  transports: ["websocket"],
});

export default socket;
