require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const employeeRoutes = require("./routes/empRoute");
const deptRoutes = require("./routes/deptRoute");
const posRoutes = require("./routes/posRoute");
const tsRoutes = require("./routes/timestampRoute");
const workdateRoutes = require("./routes/workdateRoute");
const loginRoutes = require("./routes/loginlogoutRoute");
const socketHandler = require("./socket/socketHandler");

const app = express();
const PORT = process.env.PORT;

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

socketHandler(io);

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api", loginRoutes);
app.use("/api/emp", employeeRoutes);
app.use("/api/dept", deptRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/ts", tsRoutes);
app.use("/api/ws", workdateRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
