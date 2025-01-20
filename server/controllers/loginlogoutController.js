const Emp = require("../models/empModel");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { id, email } = req.body;

    const employee = await Emp.get_by_id(id);

    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }

    if (employee.emp_mail !== email) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id_card: employee.id_card },
      process.env.JWT_SECRET,
      {
        expiresIn: "10h",
      }
    );
    res
      .status(200)
      .json({ token, id_card: employee.id_card, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
  logout,
};
