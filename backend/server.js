const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const pool = require("./database/db");

// Existing routes
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const employeeTemplateRoutes = require("./routes/employeeTemplateRoutes");
const employeeUploadRoutes = require("./routes/employeeUploadRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const pendingEmployeeRoutes = require("./routes/pendingEmployeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const missingPayrollRoutes = require("./routes/missingPayrollRoutes");

// Authentication middleware
const protect = require("./middleware/authMiddleware");

// Payroll processing service
const { splitPayrollPdf } = require("./services/payslipService");

const app = express();

// Create uploads directory if it does not exist
const uploadDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure payroll PDF storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Configure payroll PDF uploads
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  }
});

// Global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);

// Register template and upload routes before general employee routes
app.use("/api/employees", employeeTemplateRoutes);
app.use("/api/employees", employeeUploadRoutes);
app.use("/api/employees", employeeRoutes);

app.use("/api/payroll", payrollRoutes);
app.use("/api/pending-employees", pendingEmployeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/missing-payroll", missingPayrollRoutes);

// Upload and process payroll PDF
app.post(
  "/api/payroll/upload",
  protect,
  upload.single("payroll"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a PDF file"
        });
      }

      await splitPayrollPdf(req.file.path);

      return res.status(201).json({
        message: "Payroll PDF uploaded successfully",
        file: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          size: req.file.size,
          path: req.file.path
        }
      });
    } catch (error) {
      console.error("Payroll upload error:", error);

      return res.status(500).json({
        message: "Failed to upload payroll PDF",
        error: error.message
      });
    }
  }
);

// Database connection test
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    return res.json({
      message: "Database Connected",
      time: result.rows[0]
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      error: error.message
    });
  }
});

// Handle unexpected upload and middleware errors
app.use((error, req, res, next) => {
  console.error("Request error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(400).json({
    message: error.message || "An unexpected request error occurred."
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

