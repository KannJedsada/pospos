const pos = require("../models/posModel");

const get_pos = async (req, res) => {
  try {
    const positions = await pos.get_pos();
    res.status(200).json({ data: positions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_pos = async (req, res) => {
  try {
    const data = req.body;
    const position = await pos.add_pos(data);
    res
      .status(201)
      .json({ message: "Position added successfully", data: position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update_pos = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const position = await pos.update_pos(id, data);

    if (position) {
      res
        .status(200)
        .json({ message: "Position updated successfully", data: position });
    } else {
      res.status(404).json({ message: "Position not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_pos = async (req, res) => {
  try {
    const id = req.params.id;
    const position = await pos.delete_pos(id);

    if (position) {
      res
        .status(200)
        .json({ message: "Position deleted successfully", data: position });
    } else {
      res.status(404).json({ message: "Position not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_pos_byid = async (req, res) => {
  try {
    const id = req.params.id;
    const position = await pos.get_pos_byid(id);
    res.status(200).json({ data: position})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  get_pos,
  add_pos,
  update_pos,
  delete_pos,
  get_pos_byid
};
