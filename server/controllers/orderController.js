const order = require("../models/orderModel");
const io = require("../socket/socketHandler").io;

const get_order = async (req, res) => {
  try {
    const orders = await order.get_order();
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_ordered = async (req, res) => {
  try {
    const ordered = await order.get_ordered();
    res.status(200).json({ data: ordered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_order_detail = async (req, res) => {
  try {
    const { table_id } = req.params;
    const order_detail = await order.get_order_detail(table_id);
    res.status(200).json({ data: order_detail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_order = async (req, res) => {
  try {
    const data = req.body;
    const new_order = await order.add_order(data);
    if (req.io) {
      req.io.emit("orderUpdated", new_order);
    } else {
      console.error("Socket.io is not initialized");
    }
    res.status(200).json({ data: new_order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const decrease_qty = async (req, res) => {
  try {
    const order_detail_id = req.params.id;
    const { qty } = req.body;
    const result = await order.decrease_qty(order_detail_id, { qty });
    if (req.io) {
      req.io.emit("orderUpdated", {
        tableId: result.table_id, // ID ของโต๊ะที่เกี่ยวข้อง
        orderDetailId: order_detail_id,
        updatedOrder: result, // ข้อมูลคำสั่งซื้อที่อัปเดต
      });
    }
    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const change_dish_status = async (req, res) => {
  try {
    const { order_id, new_status } = req.body;
    const newStatus = await order.change_dish_status(order_id, new_status);
    if (req.io) {
      req.io.emit("orderUpdated", newStatus);
    }
    res.status(200).json({ data: newStatus });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_carts = async (req, res) => {
  try {
    const table_id = req.params.id;
    const getCarts = await order.get_carts(table_id);

    res.status(200).json({ data: getCarts });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_to_cart = async (req, res) => {
  try {
    const data = req.body;
    const newCart = await order.add_to_cart(data);
    if (req.io) {
      req.io.emit("orderUpdated", newCart);
    }
    res.status(200).json({ data: newCart });
  } catch (error) {
    console.error("Error in add_to_cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove_from_cart = async (req, res) => {
  try {
    const cart_id = req.params.id;
    const removeCart = await order.remove_from_cart(cart_id);
    if (req.io) {
      req.io.emit("orderUpdated", removeCart);
    }
    res.status(200).json({ data: removeCart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_order,
  get_ordered,
  get_order_detail,
  add_order,
  decrease_qty,
  change_dish_status,
  get_carts,
  add_to_cart,
  remove_from_cart,
};
