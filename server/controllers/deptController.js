const dept = require("../models/deptModel");

const get_dept = async (req, res) => {
  try {
    const depts = await dept.get_dept();
    res.status(200).json({ data: depts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_dept = async (req, res) => {
  try {
    const data = req.body;
    const new_dept = await dept.add_dept(data);
    res.status(201).json({ message: "Department added successfully", data: new_dept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_dept,
  add_dept,
};
