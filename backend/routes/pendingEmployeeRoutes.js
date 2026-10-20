const express = require("express");

const router = express.Router();

const protect =
  require("../middleware/authMiddleware");

const {
  getPendingEmployees,
  approvePendingEmployee
} = require(
  "../controllers/pendingEmployeeController"
);


// =====================================
// GET PENDING EMPLOYEES
// =====================================

router.get(
  "/",
  protect,
  getPendingEmployees
);


// =====================================
// APPROVE EMPLOYEE
// =====================================

router.post(
  "/:id/approve",
  protect,
  approvePendingEmployee
);


module.exports = router;