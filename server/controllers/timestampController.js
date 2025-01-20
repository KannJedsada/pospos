const ts = require("../models/timestampModel");

const get_timestamp = async (req, res) => {
  try {
    const timestamp = await ts.get_timestamp();
    res.status(200).json({ data: timestamp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const check_in = async (req, res) => {
  try {
    const data = req.body;
    const ts_checkin = await ts.checkin(data);
    res.status(200).json({ data: ts_checkin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const check_out = async (req, res) => {
  try {
    const data = req.body;
    const ts_checkout = await ts.checkout(data);
    res.status(200).json({ data: ts_checkout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const check_late = async (req, res) => {
  try {
    const late = await ts.check_late();
    res.status(200).json({ data: late });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const count_late = async (req, res) => {
  try {
    const countlate = await ts.count_late();
    res.status(200).json({ data: countlate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_timestamp,
  check_in,
  check_out,
  check_late,
  count_late,
};
