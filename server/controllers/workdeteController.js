const ws = require("../models/workdateModel");

const get_workdate = async (req, res) => {
  try {
    const workdate = await ws.get_workdate();
    res.status(200).json({ data: workdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_data = async (req, res) => {
  try {
    const workdata = await ws.get_data();
    res.status(200).json({ data: workdata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_workdate,
  get_data,
};
