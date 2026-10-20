const pool = require("../database/db");

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, ippis_number, full_name, email,
              department, designation, status, created_at
       FROM employees
       ORDER BY full_name ASC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve employees",
      error: error.message
    });
  }
};


// Get one employee
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, ippis_number, full_name, email,
              department, designation, status, created_at
       FROM employees
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve employee",
      error: error.message
    });
  }
};


// Create employee
const createEmployee = async (req, res) => {
  try {

    const {
      ippis_number,
      full_name,
      email,
      department,
      designation
    } = req.body;

    if (!ippis_number || !full_name || !email) {
      return res.status(400).json({
        message: "IPPIS number, full name and email are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO employees
       (ippis_number, full_name, email, department, designation)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        ippis_number,
        full_name,
        email,
        department,
        designation
      ]
    );

    res.status(201).json({
      message: "Employee created successfully",
      employee: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "IPPIS number or email already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create employee",
      error: error.message
    });
  }
};


// Update employee
const updateEmployee = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      ippis_number,
      full_name,
      email,
      department,
      designation,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE employees
       SET ippis_number = $1,
           full_name = $2,
           email = $3,
           department = $4,
           designation = $5,
           status = $6
       WHERE id = $7
       RETURNING *`,
      [
        ippis_number,
        full_name,
        email,
        department,
        designation,
        status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee updated successfully",
      employee: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update employee",
      error: error.message
    });
  }
};


// Delete employee
const deleteEmployee = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM employees
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete employee",
      error: error.message
    });
  }
};


module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
};