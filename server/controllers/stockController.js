const stock = require("../models/stockModel");
const io = require("../socket/socketHandler").io;

const get_category = async (req, res) => {
  try {
    const categories = await stock.get_category();
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_categoryby_id = async (req, res) => {
  const id = req.params.id;
  try {
    // Call the correct function from your model
    const categories = await stock.get_categoryby_id(id);
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_category = async (req, res) => {
  try {
    const data = req.body;
    const new_category = await stock.add_category(data);

    res.status(200).json({ data: new_category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_category = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const category = await stock.edit_category(id, data);
    res.status(200).json({ data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_category = async (req, res) => {
  try {
    const id = req.params.id;
    const delete_cat = await stock.delete_category(id);
    res.status(200).json({ data: delete_cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_stocks = async (req, res) => {
  try {
    const stocks = await stock.get_stocks();
    res.status(200).json({ data: stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_stockby_cat = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await stock.get_stockby_cat(id);
    res.status(200).json({ data: cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const new_stock = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data.stock_detail ||
      !Array.isArray(data.stock_detail) ||
      data.stock_detail.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "stock_detail must be a non-empty array" });
    }

    const n_stock = await stock.new_stock(data);
    if (req.io) {
      req.io.emit("orderUpdated", n_stock);
    }
    res.status(200).json({ data: n_stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const add_stock = async (req, res) => {
  try {
    const stocks = await stock.add_stock();
    res.status(200).json({ data: stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_min = async (req, res) => {
  try {
    const id = req.params.id;
    const { min_qty } = req.body;
    await stock.edit_min(id, { min_qty });
    res.status(200).json({ message: "Minimum quantity updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_material = async (req, res) => {
  try {
    const id = req.params.id;
    const stock_m = await stock.get_by_material(id);
    res.status(200).json({ data: stock_m });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_stock = async (req, res) => {
  try {
    const get_stock_at = await stock.get_stock();
    res.status(200).json({ data: get_stock_at });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_stock_detail = async (req, res) => {
  try {
    const id = req.params.id;
    const get_detail = await stock.get_stock_detail(id);
    res.status(200).json({ data: get_detail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_stockless = async (req, res) => {
  try {
    const stockless = await stock.get_stockless();
    res.status(200).json({ data: stockless });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_category,
  get_categoryby_id,
  add_category,
  edit_category,
  delete_category,
  get_stocks,
  get_stockby_cat,
  add_stock,
  new_stock,
  edit_min,
  get_by_material,
  get_stock,
  get_stock_detail,
  get_stockless,
};
