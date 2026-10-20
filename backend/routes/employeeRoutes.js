const express = require("express");

const router = express.Router();

const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const protect = require("../middleware/authMiddleware");


router.get("/", protect, getEmployees);

router.get("/:id", protect, getEmployee);

router.post("/", protect, createEmployee);

router.put("/:id", protect, updateEmployee);

router.delete("/:id", protect, deleteEmployee);


module.exports = router;