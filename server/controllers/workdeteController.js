const ws = require("../models/workdateModel");
const io = require("../socket/socketHandler").io;

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
    if (req.io) {
      req.io.emit("workdateUpdated", add_date);
    } else {
      console.error("Socket.io is not initialized");
    }
    res.status(200).json({ data: add_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_workdate = async (req, res) => {
  try {
    const { updates } = req.body;
    const results = [];

    for (const update of updates) {
      const edit_ws = await ws.edit_workdate(update);
      results.push(edit_ws);
      if (req.io) {
        req.io.emit("workdateUpdated", edit_ws);
      }
    }
    res.status(200).json({ data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_date = async (req, res) => {
  try {
    const id = req.params.id;
    const del_ws = await ws.delete_data(id);
    if (req.io) {
      req.io.emit("workdateUpdated", del_ws);
    }
    res.status(200).json({ data: del_ws });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const count_workdate = async (req, res) => {
  try {
    const countwd = await ws.count_workdate();
    res.status(200).json({ data: countwd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const check_emp_workdate = async (req, res) => {
  try {
    const check_emp = await ws.check_emp_workdate();
    res.status(200).json({ data: check_emp });
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
  edit_workdate,
  delete_date,
  count_workdate,
  check_emp_workdate
};
