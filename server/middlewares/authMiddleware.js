const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401); // Unauthorized

  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401); // Unauthorized

  // console.log("Token:", token);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });

  // ตรวจสอบ QR code ที่สแกน
  app.post("/scan-qr", authenticateToken, (req, res) => {
    const { qrCodeData } = req.body;

    // ตรวจสอบว่า qrCodeData ตรงกับ token ที่ผู้ใช้ล็อกอินหรือไม่
    if (isValidQRCode(qrCodeData, req.user)) {
      // QR code ใช้งานได้
      res.sendStatus(200);
    } else {
      // QR code ไม่ถูกต้อง
      res.sendStatus(403);
    }
  });

  const isValidQRCode = (qrCodeData, user) => {
    // ฟังก์ชันตรวจสอบ QR code ตามความต้องการ
    // ตรวจสอบว่า qrCodeData ตรงกับ user หรือไม่
    // เช่น การตรวจสอบ token หรือข้อมูลที่ฝังใน QR code
    return true; // เปลี่ยนเป็นการตรวจสอบจริง
  };
};

module.exports = authenticateToken;
