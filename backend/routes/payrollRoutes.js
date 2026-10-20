const express = require("express");

const router = express.Router();

const {
  getPayrollReports
} = require("../controllers/payrollController");

const protect =
  require("../middleware/authMiddleware");

router.get(
  "/reports",
  protect,
  getPayrollReports
);

module.exports = router;