const express = require("express");

const router = express.Router();

const protect =
  require("../middleware/authMiddleware");

const {
  getMissingPayrollEmployees
} = require(
  "../controllers/missingPayrollController"
);


// GET MISSING PAYROLL EMPLOYEES

router.get(
  "/",
  protect,
  getMissingPayrollEmployees
);


module.exports = router;