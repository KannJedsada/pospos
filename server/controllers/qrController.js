const qr = require("../models/qrModel");
const io = require("../socket/socketHandler").io;

const get_qr = async (req, res) => {
  try {
    const qrcode = await qr.get_qr();
    res.status(200).json({ data: qrcode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const new_qr = async (req, res) => {
  try {
    const { qr_url, table_id } = req.body;
    const new_qrcode = await qr.new_qr(qr_url, table_id);
    if (req.io) {
      req.io.emit("tableUpdated", new_qrcode);
    }
    res.status(200).json({ data: new_qrcode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const change_status = async (req, res) => {
  try {
    const id = req.params.id;
    const change_qr = await qr.change_status(id);
    res.status(200).json({ data: change_qr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_url = async (req, res) => {
  try {
    const { url } = req.body;
    const qrData = await qr.get_by_url({ url });
    res.status(200).json({ data: qrData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_table = async (req, res) => {
  try {
    const table_id = req.params.id;
    const qrData = await qr.get_by_table(table_id);
    res.status(200).json({ data: qrData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_qr,
  new_qr,
  change_status,
  get_by_url,
  get_by_table,
};
