const ws = require("../models/workdateModel");

const get_workdate = async (req, res) => {
  try {
    const workdate = await ws.get_workdate();
    res.status(201).json({ data: workdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_data = async (req, res) => {
  try {
    const workdata = await ws.get_data();
    res.status(201).json({ data: workdata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_newdate = async (req, res) => {
  try {
    const newworkdate = await ws.get_newdate();
    res.status(201).json({ data: newworkdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_workdate = async (req, res) => {
  try {
    const data = req.body;
    const add_date = await ws.add_workdate(data);
    res.status(201).json({ data: add_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_workdate,
  get_data,
  add_workdate,
  get_newdate,
};
