const promotion = require("../models/promoModel");

const get_promotions = async (req, res) => {
  try {
    const promotions = await promotion.get_promotions();
    res.status(200).json({ data: promotions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_promo = async (req, res) => {
  try {
    const promo = await promotion.get_promo();
    res.status(200).json({ data: promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const new_promotion = async (req, res) => {
  try {
    const data = req.body;
    const new_promo = await promotion.new_promotion(data);
    res.status(200).json({ data: new_promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_promotion = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const edit_promo = await promotion.edit_promotion(id, data);
    res.status(200).json({ data: edit_promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_promotion = async (req, res) => {
  try {
    const id = req.params.id;
    const delete_promo = await promotion.delete_promotion(id);
    res.status(200).json({ data: delete_promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_promotions,
  new_promotion,
  edit_promotion,
  delete_promotion,
  get_promo,
};
