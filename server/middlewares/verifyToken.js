const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // หาก JWT หมดอายุ
      return res.status(401).json({ message: "Token expired" });
    }

    // ถ้า JWT ถูกต้อง
    req.userId = decoded.id_card; // เก็บ id_card ใน request เพื่อใช้งานต่อไป
    next();
  });
};

module.exports = verifyToken;
