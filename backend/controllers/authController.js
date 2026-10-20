const pool = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const adminResult = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const admin = adminResult.rows[0];

    const validPassword =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.full_name,
        email: admin.email
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

};

module.exports = {
  login
};