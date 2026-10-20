const pool = require("../database/db");

const getPayrollReports = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        ippis_number,
        employee_name,
        employee_email,
        source_page,
        payslip_filename,
        status,
        message,
        processed_at
      FROM payroll_processing_records
      ORDER BY id DESC
      `
    );

    res.json({
      records: result.rows
    });

  } catch (error) {

    console.error(
      "REPORT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load payroll reports",

      error:
        error.message
    });
  }
};

module.exports = {
  getPayrollReports
};