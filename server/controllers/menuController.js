const menu = require("../models/menuModel");

const get_menucategory = async (req, res) => {
  try {
    const category = await menu.get_menucategory();
    res.status(200).json({ data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_price = async (req, res) => {
  try {
    const price = await menu.get_price();
    res.status(200).json({ data: price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_pricebyid = async (req, res) => {
  try {
    const id = req.params.id;
    const price = await menu.get_menu_byid(id);
    res.status(200).json({ data: price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_menu = async (req, res) => {
  try {
    const menus = await menu.get_menu();
    res.status(200).json({ data: menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_menu_byid = async (req, res) => {
  try {
    const id = req.params.id;
    const menu_id = await menu.get_menu_byid(id);
    res.status(200).json({ data: menu_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_status = async (req, res) => {
  try {
    const status = await menu.get_status();
    res.status(200).json({ data: status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_category = async (req, res) => {
  try {
    const data = req.body;
    const category = await menu.add_category(data);
    res.status(200).json({ data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_status = async (req, res) => {
  try {
    const data = req.body;
    const status = await menu.add_status(data);
    res.status(200).json({ data: status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_menu = async (req, res) => {
  try {
    const data = req.body;
    const new_menu = await menu.add_menu(data);
    res.status(200).json({ data: new_menu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_menucategory,
  get_price,
  get_pricebyid,
  get_menu,
  get_menu_byid,
  get_status,
  add_category,
  add_status,
  add_menu,
};
