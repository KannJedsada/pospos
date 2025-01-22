require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const employeeRoutes = require("./routes/empRoute");
const deptRoutes = require("./routes/deptRoute");
const posRoutes = require("./routes/posRoute");
const tsRoutes = require("./routes/timestampRoute");
const workdateRoutes = require("./routes/workdateRoute");
const loginRoutes = require("./routes/loginlogoutRoute");
const unitRoutes = require("./routes/unitRoute");
const menuRoutes = require("./routes/menuRoute");
const materilaRoutes = require("./routes/materailRoute");
const stockRoutes = require("./routes/stockRoutes");
const socketHandler = require("./socket/socketHandler");
const qrRoutes = require(`./routes/qrRoute`);
const tableRoutes = require(`./routes/tableRoute`);
const promotionRoutes = require("./routes/promoRoute");
const orderRoutes = require("./routes/orderRoute");
const receiptRoutes = require("./routes/receitRoute");

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const clientUrl = process.env.FRONT_URL;

const io = socketIo(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

socketHandler(io);

const corsOptions = {
  origin: clientUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ตั้งค่าเส้นทาง API
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (error) {
    console.error('Error querying database:', error);
  }
});


app.use("/api", loginRoutes);
app.use("/api/emp", employeeRoutes);
app.use("/api/dept", deptRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/ts", tsRoutes);
app.use("/api/ws", workdateRoutes);
app.use("/api/unit", unitRoutes);
app.use("/api/material", materilaRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/promotion", promotionRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/receipt", receiptRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
