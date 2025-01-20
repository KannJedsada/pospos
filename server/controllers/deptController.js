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

const get_by_id = async (req, res) => {
  try {
    const id = req.params.id;
    const dept_by_id = await dept.get_by_id(id);
    res.status(200).json({ data: dept_by_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_dept = async (req, res) => {
  try {
    const data = req.body;
    const new_dept = await dept.add_dept(data);
    res
      .status(200)
      .json({ message: "Department added successfully", data: new_dept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_dept = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const editdata = await dept.edit_dept(id, data);
    res
      .status(200)
      .json({ message: "Department updated successfully", data: editdata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_dept = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedata = await dept.delete_dept(id);
    res.status(200).json({ message: "Department deleted ", data: deletedata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_position = async (req, res) => {
  try {
    const id = req.params.id;
    const position = await dept.get_position(id);
    res.status(200).json({ message: "Position retrieved", data: position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_dept,
  add_dept,
  edit_dept,
  delete_dept,
  get_position,
  get_by_id
};
