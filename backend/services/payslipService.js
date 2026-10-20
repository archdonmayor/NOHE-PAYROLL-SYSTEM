const fs = require("fs");
const path = require("path");

const { PDFDocument } = require("pdf-lib");
const { PDFParse } = require("pdf-parse");

const pool = require("../database/db");

const {
  createPayrollBatch,
  completePayrollBatch
} = require("../controllers/payrollBatchController");


// ==================================================
// EXTRACT PAYROLL PERIOD
// ==================================================

const extractPayrollPeriod = (text) => {

  const match = text.match(
    /\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{4})\b/i
  );

  if (!match) {
    return "UNKNOWN";
  }

  return `${match[1].toUpperCase()} ${match[2]}`;
};


// ==================================================
// SPLIT AND PROCESS PAYROLL PDF
// ==================================================

const splitPayrollPdf = async (pdfPath) => {

  let batchId = null;

  let successfulPayslips = 0;
  let failedRecords = 0;
  let processedPages = 0;

  try {

    console.log("");
    console.log("==============================================");
    console.log("STARTING PAYROLL PDF PROCESSING");
    console.log("==============================================");


    // ==================================================
    // LOAD PDF
    // ==================================================

    const pdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);

    const totalPages = pdfDoc.getPageCount();

    console.log(
      `TOTAL PAGES FOUND: ${totalPages}`
    );


    // ==================================================
    // CREATE OUTPUT DIRECTORY
    // ==================================================

    const outputFolder = path.join(
      __dirname,
      "..",
      "processed_payslips"
    );

    if (!fs.existsSync(outputFolder)) {

      fs.mkdirSync(
        outputFolder,
        {
          recursive: true
        }
      );

    }


    // ==================================================
    // DETERMINE PAYROLL PERIOD
    // ==================================================

    let payrollPeriod = "UNKNOWN";

    try {

      console.log("");
      console.log(
        "DETECTING PAYROLL PERIOD..."
      );


      const firstPagePdf =
        await PDFDocument.create();


      const [firstPage] =
        await firstPagePdf.copyPages(
          pdfDoc,
          [0]
        );


      firstPagePdf.addPage(
        firstPage
      );


      const firstPageBytes =
        await firstPagePdf.save();


      const firstPagePath =
        path.join(
          outputFolder,
          "temp_payroll_period.pdf"
        );


      fs.writeFileSync(
        firstPagePath,
        firstPageBytes
      );


      const parser =
        new PDFParse({
          url: firstPagePath
        });


      const result =
        await parser.getText();


      await parser.destroy();


      payrollPeriod =
        extractPayrollPeriod(
          result.text || ""
        );


      console.log(
        `PAYROLL PERIOD DETECTED: ${payrollPeriod}`
      );


      if (
        fs.existsSync(firstPagePath)
      ) {

        fs.unlinkSync(
          firstPagePath
        );

      }

    } catch (periodError) {

      console.error(
        "PAYROLL PERIOD EXTRACTION ERROR:",
        periodError.message
      );

      payrollPeriod = "UNKNOWN";

    }


    // ==================================================
    // CREATE PAYROLL BATCH
    // ==================================================

    const batch =
      await createPayrollBatch(
        payrollPeriod,
        path.basename(pdfPath),
        totalPages
      );


    batchId = batch.id;


    console.log("");
    console.log(
      `PAYROLL BATCH CREATED: ${batchId}`
    );

    console.log(
      `PAYROLL PERIOD: ${payrollPeriod}`
    );

    console.log(
      `TOTAL PAGES: ${totalPages}`
    );


    // ==================================================
    // PROCESS ALL PAGES
    // ==================================================

    const pagesToProcess = totalPages;


    console.log("");
    console.log(
      "=============================================="
    );

    console.log(
      `PROCESSING ALL ${pagesToProcess} PAGES`
    );

    console.log(
      "=============================================="
    );


    // ==================================================
    // PAGE PROCESSING LOOP
    // ==================================================

    for (
      let pageIndex = 0;
      pageIndex < pagesToProcess;
      pageIndex++
    ) {

      const pageNumber =
        pageIndex + 1;


      processedPages = pageNumber;


      console.log("");
      console.log(
        "----------------------------------------------"
      );

      console.log(
        `PROCESSING PAGE ${pageNumber} OF ${totalPages}`
      );

      console.log(
        "----------------------------------------------"
      );


      let tempPdfPath = null;


      try {

        // ==================================================
        // CREATE SINGLE PAGE PDF
        // ==================================================

        const singlePagePdf =
          await PDFDocument.create();


        const [page] =
          await singlePagePdf.copyPages(
            pdfDoc,
            [pageIndex]
          );


        singlePagePdf.addPage(
          page
        );


        const singlePageBytes =
          await singlePagePdf.save();


        tempPdfPath =
          path.join(
            outputFolder,
            `temp_page_${pageNumber}.pdf`
          );


        fs.writeFileSync(
          tempPdfPath,
          singlePageBytes
        );


        // ==================================================
        // EXTRACT TEXT FROM PAGE
        // ==================================================

        const parser =
          new PDFParse({
            url: tempPdfPath
          });


        const result =
          await parser.getText();


        await parser.destroy();


        const pageText =
          result.text || "";


        // ==================================================
        // EXTRACT EMPLOYEE NAME
        // ==================================================

        const employeeNameMatch =
          pageText.match(
            /Employee\s+Name\s+(.+?)\s+Grade\s*:/i
          );


        let extractedEmployeeName = null;


        if (employeeNameMatch) {

          extractedEmployeeName =
            employeeNameMatch[1]
              .replace(/\s+/g, " ")
              .trim();


          console.log(
            `EMPLOYEE NAME FOUND: ${extractedEmployeeName}`
          );

        } else {

          console.log(
            "EMPLOYEE NAME NOT FOUND"
          );

        }


        // ==================================================
        // EXTRACT IPPIS NUMBER
        // ==================================================

        const ippisMatch =
          pageText.match(
            /IPPIS\s*Number\s*:\s*(\d+)/i
          );


        if (!ippisMatch) {

          console.log(
            "IPPIS NUMBER NOT FOUND"
          );


          await pool.query(
            `
            INSERT INTO payroll_processing_records
            (
              batch_id,
              payroll_period,
              source_page,
              status,
              message
            )
            VALUES
            ($1,$2,$3,$4,$5)
            `,
            [
              batchId,
              payrollPeriod,
              pageNumber,
              "IPPIS_NOT_FOUND",
              "IPPIS number could not be detected"
            ]
          );


          failedRecords++;


          if (
            fs.existsSync(tempPdfPath)
          ) {

            fs.unlinkSync(
              tempPdfPath
            );

          }


          continue;

        }


        const ippisNumber =
          ippisMatch[1];


        console.log(
          `IPPIS FOUND: ${ippisNumber}`
        );


        // ==================================================
        // FIND EMPLOYEE IN DATABASE
        // ==================================================

        const employeeResult =
          await pool.query(
            `
            SELECT *
            FROM employees
            WHERE ippis_number = $1
            `,
            [
              ippisNumber
            ]
          );


        // ==================================================
        // EMPLOYEE NOT FOUND
        // ==================================================

        if (
          employeeResult.rows.length === 0
        ) {

          console.log(
            `EMPLOYEE NOT FOUND: ${ippisNumber}`
          );


          // ----------------------------------------------
          // ADD TO PENDING EMPLOYEES
          // ----------------------------------------------

          await pool.query(
            `
            INSERT INTO pending_employees
            (
              ippis_number,
              full_name,
              status
            )
            VALUES
            ($1,$2,$3)
            ON CONFLICT (ippis_number)
            DO NOTHING
            `,
            [
              ippisNumber,
              extractedEmployeeName,
              "PENDING"
            ]
          );


          console.log(
            "ADDED TO PENDING EMPLOYEES"
          );


          // ----------------------------------------------
          // SAVE PROCESSING RECORD
          // ----------------------------------------------

          await pool.query(
            `
            INSERT INTO payroll_processing_records
            (
              batch_id,
              payroll_period,
              ippis_number,
              extracted_employee_name,
              source_page,
              status,
              message
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7)
            `,
            [
              batchId,
              payrollPeriod,
              ippisNumber,
              extractedEmployeeName,
              pageNumber,
              "EMPLOYEE_NOT_FOUND",
              "Employee added to pending review queue"
            ]
          );


          failedRecords++;


          if (
            fs.existsSync(tempPdfPath)
          ) {

            fs.unlinkSync(
              tempPdfPath
            );

          }


          continue;

        }


        // ==================================================
        // EMPLOYEE FOUND
        // ==================================================

        const employee =
          employeeResult.rows[0];


        console.log(
          `EMPLOYEE FOUND: ${employee.full_name}`
        );


        console.log(
          `EMAIL: ${employee.email}`
        );


        // ==================================================
        // NAME VERIFICATION
        // ==================================================

        let verificationStatus =
          "NOT_CHECKED";


        if (
          extractedEmployeeName
        ) {

          const pdfName =
            extractedEmployeeName
              .trim()
              .toUpperCase();


          const dbName =
            employee.full_name
              .trim()
              .toUpperCase();


          if (
            pdfName === dbName
          ) {

            verificationStatus =
              "PASSED";


            console.log(
              "NAME VERIFICATION: PASSED"
            );

          } else {

            verificationStatus =
              "FAILED";


            console.log(
              "NAME VERIFICATION: FAILED"
            );


            console.log(
              `PDF NAME: ${pdfName}`
            );


            console.log(
              `DATABASE NAME: ${dbName}`
            );


            // ------------------------------------------
            // SAVE NAME MISMATCH
            // ------------------------------------------

            await pool.query(
              `
              INSERT INTO payroll_processing_records
              (
                batch_id,
                payroll_period,
                ippis_number,
                employee_name,
                extracted_employee_name,
                employee_email,
                source_page,
                status,
                name_verification_status,
                message
              )
              VALUES
              ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
              `,
              [
                batchId,
                payrollPeriod,
                employee.ippis_number,
                employee.full_name,
                extractedEmployeeName,
                employee.email,
                pageNumber,
                "NAME_MISMATCH",
                "FAILED",
                "Employee name in PDF does not match database record"
              ]
            );


            failedRecords++;


            console.log(
              "PAYSLIP CREATION BLOCKED"
            );


            if (
              fs.existsSync(tempPdfPath)
            ) {

              fs.unlinkSync(
                tempPdfPath
              );

            }


            continue;

          }

        }


        // ==================================================
        // CREATE FINAL PAYSLIP
        // ==================================================

        const finalFilename =
          `${ippisNumber}.pdf`;


        const finalPdfPath =
          path.join(
            outputFolder,
            finalFilename
          );


        fs.writeFileSync(
          finalPdfPath,
          singlePageBytes
        );


        console.log(
          `PAYSLIP CREATED: ${finalFilename}`
        );


        // ==================================================
        // SAVE SUCCESSFUL PROCESSING RECORD
        // ==================================================

        await pool.query(
          `
          INSERT INTO payroll_processing_records
          (
            batch_id,
            payroll_period,
            ippis_number,
            employee_name,
            extracted_employee_name,
            employee_email,
            source_page,
            payslip_filename,
            status,
            name_verification_status,
            message
          )
          VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          `,
          [
            batchId,
            payrollPeriod,
            employee.ippis_number,
            employee.full_name,
            extractedEmployeeName,
            employee.email,
            pageNumber,
            finalFilename,
            "SUCCESS",
            verificationStatus,
            "Payslip successfully created"
          ]
        );


        successfulPayslips++;


        console.log(
          "PROCESSING RECORD SAVED"
        );


        // ==================================================
        // DELETE TEMPORARY PDF
        // ==================================================

        if (
          fs.existsSync(tempPdfPath)
        ) {

          fs.unlinkSync(
            tempPdfPath
          );

        }


        console.log(
          `PAGE ${pageNumber} COMPLETE`
        );


      } catch (pageError) {

        console.error("");
        console.error(
          `ERROR PROCESSING PAGE ${pageNumber}`
        );

        console.error(
          pageError.message
        );


        // ==================================================
        // SAVE PAGE ERROR
        // ==================================================

        await pool.query(
          `
          INSERT INTO payroll_processing_records
          (
            batch_id,
            payroll_period,
            source_page,
            status,
            message
          )
          VALUES
          ($1,$2,$3,$4,$5)
          `,
          [
            batchId,
            payrollPeriod,
            pageNumber,
            "ERROR",
            pageError.message
          ]
        );


        failedRecords++;


        // ==================================================
        // DELETE TEMPORARY FILE
        // ==================================================

        if (
          tempPdfPath &&
          fs.existsSync(tempPdfPath)
        ) {

          fs.unlinkSync(
            tempPdfPath
          );

        }

      }

    }


    // ==================================================
    // COMPLETE PAYROLL BATCH
    // ==================================================

    await completePayrollBatch(
      batchId,
      processedPages,
      successfulPayslips,
      failedRecords
    );


    console.log("");
    console.log(
      "=============================================="
    );

    console.log(
      "PAYROLL PAGE PROCESSING COMPLETE"
    );

    console.log(
      "=============================================="
    );

    console.log(
      `BATCH ID: ${batchId}`
    );

    console.log(
      `PAYROLL PERIOD: ${payrollPeriod}`
    );

    console.log(
      `TOTAL PAGES: ${totalPages}`
    );

    console.log(
      `PROCESSED PAGES: ${processedPages}`
    );

    console.log(
      `SUCCESSFUL PAYSLIPS: ${successfulPayslips}`
    );

    console.log(
      `FAILED RECORDS: ${failedRecords}`
    );


    // ==================================================
    // MISSING EMPLOYEE DETECTION
    // ==================================================

    console.log("");
    console.log(
      "=============================================="
    );

    console.log(
      "STARTING MISSING EMPLOYEE DETECTION"
    );

    console.log(
      "=============================================="
    );


    /*
      Compare every ACTIVE employee in the database
      against every IPPIS number found in THIS
      payroll batch.

      If an active employee does not appear in this
      batch, create a missing-payroll record.
    */

    const missingEmployeesResult =
      await pool.query(
        `
        INSERT INTO missing_payroll_employees
        (
          ippis_number,
          employee_name,
          payroll_period,
          status,
          reason
        )
        SELECT
          e.ippis_number,
          e.full_name,
          $1,
          'REVIEW',
          'Employee exists in database but was not found in payroll upload'
        FROM employees e
        WHERE e.status = TRUE
          AND NOT EXISTS
          (
            SELECT 1
            FROM payroll_processing_records p
            WHERE p.batch_id = $2
              AND p.ippis_number = e.ippis_number
              AND p.status = 'SUCCESS'
          )
        ON CONFLICT
        (
          ippis_number,
          payroll_period
        )
        DO NOTHING
        RETURNING
          id,
          ippis_number,
          employee_name,
          payroll_period
        `,
        [
          payrollPeriod,
          batchId
        ]
      );


    console.log(
      `MISSING EMPLOYEES FOUND: ${missingEmployeesResult.rowCount}`
    );


    // ==================================================
    // DISPLAY MISSING EMPLOYEES
    // ==================================================

    if (
      missingEmployeesResult.rows.length > 0
    ) {

      console.log("");
      console.log(
        "EMPLOYEES MISSING FROM PAYROLL:"
      );


      missingEmployeesResult.rows.forEach(
        (employee) => {

          console.log(
            `${employee.ippis_number} - ${employee.employee_name}`
          );

        }
      );

    } else {

      console.log(
        "NO MISSING EMPLOYEES DETECTED"
      );

    }


    console.log("");
    console.log(
      "MISSING EMPLOYEE DETECTION COMPLETE"
    );


    // ==================================================
    // FINAL PROCESSING SUMMARY
    // ==================================================

    console.log("");
    console.log(
      "=============================================="
    );

    console.log(
      "PAYROLL PROCESSING COMPLETE"
    );

    console.log(
      "=============================================="
    );

    console.log(
      `BATCH ID: ${batchId}`
    );

    console.log(
      `PAYROLL PERIOD: ${payrollPeriod}`
    );

    console.log(
      `TOTAL PAGES: ${totalPages}`
    );

    console.log(
      `PROCESSED PAGES: ${processedPages}`
    );

    console.log(
      `SUCCESSFUL PAYSLIPS: ${successfulPayslips}`
    );

    console.log(
      `FAILED RECORDS: ${failedRecords}`
    );

    console.log(
      `MISSING EMPLOYEES: ${missingEmployeesResult.rowCount}`
    );

    console.log(
      "=============================================="
    );


    // ==================================================
    // RETURN RESULT
    // ==================================================

    return {

      success: true,

      batchId,

      payrollPeriod,

      totalPages,

      pagesTested:
        processedPages,

      successfulPayslips,

      failedRecords,

      missingEmployees:
        missingEmployeesResult.rowCount

    };


  } catch (error) {

    console.error("");
    console.error(
      "=============================================="
    );

    console.error(
      "PAYROLL PDF PROCESSING ERROR"
    );

    console.error(
      "=============================================="
    );

    console.error(
      error
    );


    // ==================================================
    // MARK BATCH AS FAILED
    // ==================================================

    if (batchId) {

      try {

        await pool.query(
          `
          UPDATE payroll_batches
          SET
            status = 'FAILED',
            processed_pages = $1,
            successful_payslips = $2,
            failed_records = $3,
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

      } catch (batchError) {

        console.error(
          "FAILED TO UPDATE PAYROLL BATCH:",
          batchError.message
        );

      }

    }


    throw error;

  }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
  splitPayrollPdf
};