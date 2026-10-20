const pool = require("../database/db");


// =====================================
// GET PENDING EMPLOYEES
// =====================================

const getPendingEmployees = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        id,
        ippis_number,
        full_name,
        email,
        department,
        designation,
        status,
        created_at
      FROM pending_employees
      ORDER BY id DESC
    `);

    res.json({
      employees: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to load pending employees",

      error:
        error.message
    });

  }
};


// =====================================
// APPROVE PENDING EMPLOYEE
// =====================================

const approvePendingEmployee = async (req, res) => {

  const { id } = req.params;

  const {
    email,
    department,
    designation
  } = req.body;

  try {

    // ---------------------------------
    // VALIDATE REQUIRED FIELDS
    // ---------------------------------

    if (!email) {

      return res.status(400).json({
        message:
          "Employee email is required"
      });

    }


    // ---------------------------------
    // FIND PENDING EMPLOYEE
    // ---------------------------------

    const pendingResult =
      await pool.query(
        `
        SELECT *
        FROM pending_employees
        WHERE id = $1
        `,
        [id]
      );


    if (
      pendingResult.rows.length === 0
    ) {

      return res.status(404).json({
        message:
          "Pending employee not found"
      });

    }


    const pendingEmployee =
      pendingResult.rows[0];


    // ---------------------------------
    // CHECK IF ALREADY EXISTS
    // ---------------------------------

    const existingEmployee =
      await pool.query(
        `
        SELECT *
        FROM employees
        WHERE ippis_number = $1
        `,
        [
          pendingEmployee.ippis_number
        ]
      );


    if (
      existingEmployee.rows.length > 0
    ) {

      return res.status(409).json({
        message:
          "Employee already exists in employees table"
      });

    }


    // ---------------------------------
    // ADD TO EMPLOYEES TABLE
    // ---------------------------------

    const employeeResult =
      await pool.query(
        `
        INSERT INTO employees
        (
          ippis_number,
          full_name,
          email,
          department,
          designation,
          status
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          pendingEmployee.ippis_number,
          pendingEmployee.full_name,
          email,
          department || null,
          designation || null,
          true
        ]
      );


    // ---------------------------------
    // UPDATE PENDING STATUS
    // ---------------------------------

    await pool.query(
      `
      UPDATE pending_employees
      SET
        email = $1,
        department = $2,
        designation = $3,
        status = 'APPROVED'
      WHERE id = $4
      `,
      [
        email,
        department || null,
        designation || null,
        id
      ]
    );


    // ---------------------------------
    // RESPONSE
    // ---------------------------------

    res.status(201).json({

      message:
        "Employee approved successfully",

      employee:
        employeeResult.rows[0]

    });

  } catch (error) {

    console.error(
      "APPROVE EMPLOYEE ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to approve employee",

      error:
        error.message

    });

  }
};


module.exports = {
  getPendingEmployees,
  approvePendingEmployee
};