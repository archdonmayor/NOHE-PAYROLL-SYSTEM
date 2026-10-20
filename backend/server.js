const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pool = require("./database/db");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const pendingEmployeeRoutes = require("./routes/pendingEmployeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const missingPayrollRoutes = require("./routes/missingPayrollRoutes");
const employeeTemplateRoutes = require("./routes/employeeTemplateRoutes");
const protect = require("./middleware/authMiddleware");

const {
  splitPayrollPdf
} = require("./services/payslipService");

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| Upload Directory
|--------------------------------------------------------------------------
*/

const uploadDirectory = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

/*
|--------------------------------------------------------------------------
| Multer Configuration
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      `${Date.now()}-${file.originalname}`;

    cb(null, uniqueName);

  }

});

const upload = multer({

  storage,

  limits: {
    fileSize: 100 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype !== "application/pdf") {

      return cb(
        new Error("Only PDF files are allowed")
      );

    }

    cb(null, true);

  }

});

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/employees",
  employeeRoutes
);

app.use(
  "/api/payroll",
  payrollRoutes
);

app.use(
  "/api/pending-employees",
  pendingEmployeeRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/missing-payroll",
  missingPayrollRoutes
);

app.use(
  "/api/employees", 
  employeeTemplateRoutes);

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

      await splitPayrollPdf(
        req.file.path
      );

      return res.status(201).json({

        message:
          "Payroll PDF uploaded successfully",

        file: {

          originalName:
            req.file.originalname,

          storedName:
            req.file.filename,

          size:
            req.file.size,

          path:
            req.file.path

        }

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message:
          "Failed to upload payroll PDF",

        error:
          error.message

      });

    }

  }
);

/*
|--------------------------------------------------------------------------
| Database Test Route
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  async (req, res) => {

    try {

      const result =
        await pool.query(
          "SELECT NOW()"
        );

      res.json({

        message:
          "Database Connected",

        time:
          result.rows[0]

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          error.message
      });

    }

  }
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);