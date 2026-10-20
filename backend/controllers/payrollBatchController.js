const pool = require("../database/db");

const createPayrollBatch = async (
  payrollPeriod,
  originalFilename,
  totalPages
) => {
  const result = await pool.query(
    `
    INSERT INTO payroll_batches (
      payroll_period,
      original_filename,
      total_pages,
      status
    )
    VALUES ($1, $2, $3, 'PROCESSING')
    RETURNING *
    `,
    [
      payrollPeriod,
      originalFilename,
      totalPages
    ]
  );

  return result.rows[0];
};

const completePayrollBatch = async (
  batchId,
  processedPages,
  successfulPayslips,
  failedRecords
) => {
  await pool.query(
    `
    UPDATE payroll_batches
    SET
      processed_pages = $1,
      successful_payslips = $2,
      failed_records = $3,
      status = 'COMPLETED',
      completed_at = CURRENT_TIMESTAMP
    WHERE id = $4
    `,
    [
      processedPages,
      successfulPayslips,
      failedRecords,
      batchId
    ]
  );
};

module.exports = {
  createPayrollBatch,
  completePayrollBatch
};