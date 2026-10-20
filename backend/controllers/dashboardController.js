const pool = require("../database/db");

const getDashboardStats = async (req, res) => {
  try {

    const totalEmployees =
      await pool.query(
        "SELECT COUNT(*) FROM employees"
      );

    const pendingEmployees =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM pending_employees
        WHERE status = 'PENDING'
        `
      );

    const approvedEmployees =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM pending_employees
        WHERE status = 'APPROVED'
        `
      );

    const processedPayslips =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM payroll_processing_records
        WHERE status = 'SUCCESS'
        `
      );

    const failedRecords =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM payroll_processing_records
        WHERE status <> 'SUCCESS'
        `
      );

    res.json({
      totalEmployees:
        Number(
          totalEmployees.rows[0].count
        ),

      pendingEmployees:
        Number(
          pendingEmployees.rows[0].count
        ),

      approvedEmployees:
        Number(
          approvedEmployees.rows[0].count
        ),

      processedPayslips:
        Number(
          processedPayslips.rows[0].count
        ),

      failedRecords:
        Number(
          failedRecords.rows[0].count
        )
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to load dashboard statistics",
      error:
        error.message
    });

  }
};

module.exports = {
  getDashboardStats
};