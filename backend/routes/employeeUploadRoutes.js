
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const pool = require("../database/db");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const path = require("path");
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("Please upload an Excel file (.xlsx or .xls)."));
    }

    cb(null, true);
  }
});

function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeEmail(value) {
  return normalize(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post(
  "/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an Excel file to upload."
        });
      }

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
        cellDates: false
      });

      const sheetName = workbook.SheetNames.find(
        (name) => name.toLowerCase() === "employees"
      );

      if (!sheetName) {
        return res.status(400).json({
          message: 'The workbook must contain a sheet named "Employees".'
        });
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false
      });

      if (rows.length === 0) {
        return res.status(400).json({
          message: "The Employees sheet contains no employee records."
        });
      }

      const results = {
        totalRows: rows.length,
        imported: [],
        reviewRequired: [],
        errors: []
      };

      const seenIppis = new Set();
      const seenEmails = new Set();

      await client.query("BEGIN");

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const rowNumber = index + 2;

        const ippisNumber = normalize(
          row["IPPIS Number"] ?? row["IPPIS number"]
        );

        const fullName = normalize(
          row["Full Name"] ?? row["Full name"]
        );

        const email = normalizeEmail(row["Email"]);

        const department = normalize(row["Department"]);
        const designation = normalize(row["Designation"]);

        const reasons = [];

        if (!ippisNumber) reasons.push("Missing IPPIS Number");
        if (!fullName) reasons.push("Missing Full Name");
        if (!email) reasons.push("Missing Email");
        else if (!isValidEmail(email)) reasons.push("Invalid Email");
        if (!department) reasons.push("Missing Department");
        if (!designation) reasons.push("Missing Designation");

        if (ippisNumber && seenIppis.has(ippisNumber)) {
          reasons.push("Duplicate IPPIS Number in uploaded file");
        }

        if (email && seenEmails.has(email)) {
          reasons.push("Duplicate Email in uploaded file");
        }

        if (ippisNumber) seenIppis.add(ippisNumber);
        if (email) seenEmails.add(email);

        if (reasons.length > 0) {
          results.reviewRequired.push({
            row: rowNumber,
            ippisNumber,
            fullName,
            email,
            department,
            designation,
            reasons
          });

          continue;
        }

        try {
          const insertResult = await client.query(
            `INSERT INTO employees
              (ippis_number, full_name, email, department, designation)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT DO NOTHING
             RETURNING id, ippis_number, full_name, email`,
            [ippisNumber, fullName, email, department, designation]
          );

          if (insertResult.rowCount === 0) {
            results.reviewRequired.push({
              row: rowNumber,
              ippisNumber,
              fullName,
              email,
              department,
              designation,
              reasons: [
                "IPPIS Number or Email already exists in the database"
              ]
            });

            continue;
          }

          results.imported.push({
            row: rowNumber,
            ...insertResult.rows[0]
          });
        } catch (error) {
          results.errors.push({
            row: rowNumber,
            ippisNumber,
            message: error.message
          });
        }
      }

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Employee Excel file processed.",
        summary: {
          totalRows: results.totalRows,
          imported: results.imported.length,
          reviewRequired: results.reviewRequired.length,
          errors: results.errors.length
        },
        results
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Employee Excel upload error:", error);

      return res.status(500).json({
        message: "Failed to process employee Excel file.",
        error: error.message
      });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
