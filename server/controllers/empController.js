const emp = require("../models/empModel");

const get_emp = async (req, res) => {
  try {
    const employees = await emp.get_emp();
    res.status(200).json({ data: employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_id = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await emp.get_by_id(id);

    if (employee) {
      res.status(200).json({ data: employee });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error("Error getting employee by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_pid = async (req, res) => {
  try {
    const p_id = req.params.p_id;
    const employees = await emp.get_by_pid(p_id);
    res.status(200).json({ data: employees });
  } catch (error) {
    console.error("Error getting employees by position ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_dept = async (req, res) => {
  try {
    const dept_id = req.params.dept_id;
    const employees = await emp.get_by_dept(dept_id);
    res.status(200).json({ data: employees });
  } catch (error) {
    console.error("Error getting employees by department ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_dept_and_position = async (req, res) => {
  try {
    const { dept_id, p_id } = req.params;
    const dept_pos = await emp.get_by_dept_and_position(dept_id, p_id);
    res.status(200).json({ data: dept_pos });
  } catch (error) {
    console.error("Error getting employees by department and position:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_emp = async (req, res) => {
  try {
    const data = req.body;
    const employee = await emp.add_emp(data);
    res
      .status(201)
      .json({ message: "Employee added successfully", data: employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update_emp = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const employee = await emp.update_emp(id, data);

    if (employee) {
      res
        .status(200)
        .json({ message: "Employee updated successfully", data: employee });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_emp = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await emp.delete_emp(id);

    if (employee) {
      res
        .status(200)
        .json({ message: "Employee deleted successfully", data: employee });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_data = async (req, res) => {
  try {
    const id_card = req.params.id_card;
    const data = await emp.get_data(id_card);
    res.status(200).json({ data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_workdate = async (req, res) => {
  try {
    const id_card = req.params.id_card;
    const work_date = await emp.get_workdate(id_card);
    res.status(200).json({ data: work_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_dept = async (req, res) => {
  try {
    const id_card = req.params.id_card;
    const dept = await emp.get_dept(id_card);
    res.status(200).json({ data: dept[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const count_late = async (req, res) => {
  try {
    const id_card = req.params.id_card;
    const result = await emp.count_late(id_card);
    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const count_absent = async (req, res) => {
  try {
    const id_card = req.params.id_card;
    const result = await emp.count_absent(id_card);
    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_emp,
  get_by_id,
  get_by_pid,
  add_emp,
  update_emp,
  delete_emp,
  get_data,
  get_workdate,
  get_dept,
  get_by_dept,
  get_by_dept_and_position,
  count_late,
  count_absent,
};
