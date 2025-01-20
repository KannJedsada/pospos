const table = require("../models/tableModel");
const io = require("../socket/socketHandler").io;

const get_table_status = async (req, res) => {
  try {
    const table_status = await table.get_table_status();
    res.status(200).json({ data: table_status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_table_status = async (req, res) => {
  try {
    const data = req.body;
    const new_table_status = await table.add_table_status(data);
    res.status(200).json({ data: new_table_status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_tables = async (req, res) => {
  try {
    const tables = await table.get_tables();
    res.status(200).json({ data: tables });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_table = async (req, res) => {
  try {
    const id = req.params.id;
    const table_by_id = await table.get_table(id);
    res.status(200).json({ data: table_by_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_table = async (req, res) => {
  try {
    const data = req.body;
    const new_table = await table.add_table(data);
    if (req.io) {
      req.io.emit("tableUpdated", new_table);
    }
    res.status(200).json({ data: new_table });
  } catch (error) {
    console.error(error);
    if (error.message === "Table name already exists") {
      return res.status(400).json({ message: "Table name already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const change_status = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const change = await table.change_status(id, data);
    if (req.io) {
      req.io.emit("tableUpdated", change);
    }
    res.status(200).json({ data: change });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_table = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const table_edit = table.edit_table(id, data);
    res.status(200).json({ data: table_edit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_table = async (req, res) => {
  try {
    const id = req.params.id;
    const table_delete = await table.delete_table(id);
    res.status(200).json({ data: table_delete });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_byname = async (req, res) => {
  try {
    const t_name = req.body;
    const table_name = await table.get_byname(t_name);
    res.status(200).json({ data: table_name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_table_status,
  add_table_status,
  get_tables,
  get_table,
  add_table,
  change_status,
  edit_table,
  delete_table,
  get_byname,
};
