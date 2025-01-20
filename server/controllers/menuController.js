const menu = require("../models/menuModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/menu");

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Initialize multer with storage configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".gif"];

    // Allow only image files
    if (!allowedExts.includes(ext)) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
  // limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

const get_menucategory = async (req, res) => {
  try {
    const category = await menu.get_menucategory();
    res.status(200).json({ data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_menu_bycategoryone = async (req, res) => {
  try {
    const id = req.params.id;
    const cateone = await menu.get_menu_bycategoryone(id);
    res.status(200).json({ data: cateone });
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
    const price = await menu.get_price_byid(id);
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

const get_menu_cus = async (req, res) => {
  try {
    const menus = await menu.get_menu_cus();
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

const get_menu_bycategory = async (req, res) => {
  try {
    const id = req.params.id;
    const menu_id = await menu.get_menu_bycategory(id);
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
    const { name, category, ingredients, menutype } = req.body;
    const img = req.file ? req.file.filename : null; // Get uploaded file name

    // Validation
    if (!name || !category || !ingredients || !img) {
      console.error("Missing fields:", {
        name,
        category,
        ingredients,
        img,
        menutype,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Process and save the menu item
    const new_menu = await menu.add_menu({
      name,
      category,
      ingredients: JSON.parse(ingredients),
      img,
      menutype,
    });
    res.status(200).json({ data: new_menu });
  } catch (error) {
    console.error("Error adding menu:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_menu = async (req, res) => {
  try {
    const id = req.params.id;
    const { menu_name, menu_category, ingredients } = req.body;
    const img = req.file ? req.file.filename : null;

    // // ตรวจสอบข้อมูลที่ได้รับ
    // console.log("Request body:", {
    //   menu_name,
    //   menu_category,
    //   ingredients,
    // });
    // console.log("Uploaded file:", img);

    // Fetch existing menu
    const menuToEdit = await menu.get_menu_byid(id);
    if (!menuToEdit) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // If no new image is uploaded, keep the old one
    const updatedImg = img || menuToEdit.menu_img;

    // Validate required fields
    if (!menu_name || !menu_category || !ingredients) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedIngredients;
    try {
      parsedIngredients = JSON.parse(ingredients);
    } catch (err) {
      return res.status(400).json({ message: "Invalid ingredients format" });
    }

    const updatedMenu = await menu.edit_menu(id, {
      name: menu_name,
      category: menu_category,
      ingredients: parsedIngredients,
      img: updatedImg,
    });

    if (img && menuToEdit.menu_img) {
      const oldFilePath = path.join(
        __dirname,
        "../uploads/menu",
        menuToEdit.menu_img
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old file:", err);
        } else {
          console.log("Old file deleted successfully");
        }
      });
    }

    res
      .status(200)
      .json({ message: "Menu updated successfully", data: updatedMenu });
  } catch (error) {
    console.error("Error editing menu:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const delete_menu = async (req, res) => {
  try {
    const id = req.params.id;

    // Get the menu to be deleted
    const menuToDelete = await menu.get_menu_byid(id);
    if (!menuToDelete) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Delete the menu
    await menu.delete_menu(id);

    // If the menu has an associated image, delete it from the server
    if (menuToDelete.menu_img) {
      const filePath = path.join(
        __dirname,
        "../uploads/menu",
        menuToDelete.menu_img
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return res.status(500).json({ message: "Error deleting image file" });
        }
        console.log("File deleted successfully");
      });
    }

    // Send a success response
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_menu_type = async (req, res) => {
  try {
    const menu_type = await menu.get_menu_type();
    res.status(200).json({ data: menu_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_menu_type = async (req, res) => {
  try {
    const typename = req.body;
    const add_type = await menu.add_menu_type(typename);
    res.status(200).json({ data: add_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_menu_type = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const edit_type = await menu.edit_menu_type(id, data);
    res.status(200).json({ data: edit_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_menu_type = async (req, res) => {
  try {
    const id = req.params.id;
    const delete_type = await menu.delete_menu_type(id);
    res.status(200).json({ data: delete_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_cost_menu = async (req, res) => {
  try {
    const menu_id = req.params.id;
    const costmenu = await menu.get_cost_menu(menu_id);
    res.status(200).json({ data: costmenu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const new_price = async (req, res) => {
  try {
    const menu_id = req.params.id;
    const data = req.body;
    const newPrice = await menu.new_price(menu_id, data);
    res.status(200).json({ data: newPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_menu_cat = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const edit_cat = await menu.edit_menu_cat(id, data);
    res.status(200).json({ data: edit_cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_menu_cat = async (req, res) => {
  try {
    const id = req.params.id;
    const delete_cat = await menu.delete_menu_cat(id);
    res.status(200).json({ data: delete_cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_recommend = async (req, res) => {
  try {
    const recom = await menu.get_recommend();
    res.status(200).json({ data: recom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  upload,
  get_menucategory,
  get_price,
  get_pricebyid,
  get_menu,
  get_menu_byid,
  get_menu_bycategory,
  get_status,
  add_category,
  add_status,
  add_menu,
  delete_menu,
  edit_menu,
  get_menu_bycategoryone,
  get_menu_type,
  add_menu_type,
  edit_menu_type,
  delete_menu_type,
  get_cost_menu,
  new_price,
  edit_menu_cat,
  delete_menu_cat,
  get_recommend,
  get_menu_cus
};
