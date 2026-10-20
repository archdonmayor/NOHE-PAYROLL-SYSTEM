const pool = require("../database/db");


// GET MISSING PAYROLL EMPLOYEES
const getMissingPayrollEmployees = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        id,
        ippis_number,
        employee_name,
        payroll_period,
        status,
        reason,
        reviewed_by,
        reviewed_at,
        created_at
      FROM missing_payroll_employees
      ORDER BY id DESC
      `
    );

    res.json({
      employees: result.rows
    });

  } catch (error) {

    console.error(
      "MISSING PAYROLL ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load missing payroll employees",
      error:
        error.message
    });

  }
};


module.exports = {
  getMissingPayrollEmployees
};