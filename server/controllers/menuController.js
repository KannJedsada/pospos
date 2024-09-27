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
    // Extract form data and file
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { name, category, price, ingredients } = req.body;
    const img = req.file ? req.file.filename : null; // Get uploaded file name

    // Validation
    if (!name || !category || !price || !ingredients || !img) {
      console.error("Missing fields:", {
        name,
        category,
        price,
        ingredients,
        img,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Process and save the menu item
    const new_menu = await menu.add_menu({
      name,
      category,
      price,
      ingredients: JSON.parse(ingredients), // Parse JSON string
      img,
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
    const { menu_name, menu_category, price, ingredients } = req.body;
    const img = req.file ? req.file.filename : null;

    // ตรวจสอบข้อมูลที่ได้รับ
    console.log("Request body:", {
      menu_name,
      menu_category,
      price,
      ingredients,
    });
    console.log("Uploaded file:", img);

    // Fetch existing menu
    const menuToEdit = await menu.get_menu_byid(id);
    if (!menuToEdit) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // If no new image is uploaded, keep the old one
    const updatedImg = img || menuToEdit.menu_img;

    // Validate required fields
    if (!menu_name || !menu_category || !price || !ingredients) {
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
      price,
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
};
