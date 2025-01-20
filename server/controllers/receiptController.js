const receipt = require(`../models/receiptModel`);
const io = require("../socket/socketHandler").io;

const get_receipts = async (req, res) => {
  try {
    const receipts = await receipt.get_receipts();
    res.status(200).json({ data: receipts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_receipt = async (req, res) => {
  try {
    const table_id = req.params.id;
    const rept = await receipt.get_receipt(table_id);
    res.status(200).json({ data: rept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_rept_detail = async (req, res) => {
  try {
    const id = req.params.id;
    const rept = await receipt.get_rept_detail(id);
    res.status(200).json({ data: rept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_receipt_bytable = async (req, res) => {
  try {
    const table_id = req.params.id;
    const receipt_table = await receipt.get_receipt_bytable(table_id);
    res.status(200).json({ data: receipt_table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_receipt_detail = async (req, res) => {
  try {
    const table_id = req.params.id;
    const receipt_table = await receipt.get_receipt_detail(table_id);
    res.status(200).json({ data: receipt_table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const create_receipt = async (req, res) => {
  try {
    const data = req.body;
    const new_receipt = await receipt.create_receipt(data);
    if (req.io) {
      req.io.emit("orderUpdated", new_receipt);
    }
    res.status(200).json({ data: new_receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const payment_receipt = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const p_rept = await receipt.payment_receipt(id, data);
    if (req.io) {
      req.io.emit("orderUpdated", p_rept);
    }
    res.status(200).json({ data: p_rept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_receipt = async (req, res) => {
  try {
    const id = req.params.id;
    const d_rept = await receipt.delete_receipt(id);
    res.status(200).json({ data: d_rept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_cost_profit = async (req, res) => {
  try {
    const cost_profit = await receipt.get_cost_profit();
    res.status(200).json({ data: cost_profit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_cost_profit_bydata = async (req, res) => {
  try {
    const data = req.body;
    const cost_profit = await receipt.get_cost_profit_bydata(data);
    res.status(200).json({ data: cost_profit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_data = async (req, res) => {
  try {
    const getdata = await receipt.get_data();
    res.status(200).json({ data: getdata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_receiptbyid = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await receipt.get_receiptbyid(id);
    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_receipts,
  get_receipt,
  get_receipt_bytable,
  get_receipt_detail,
  create_receipt,
  payment_receipt,
  get_rept_detail,
  delete_receipt,
  get_cost_profit,
  get_cost_profit_bydata,
  get_data,
  get_receiptbyid,
};
