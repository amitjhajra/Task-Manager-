const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { exportTaskReport, exportUserReport } = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks",protect,adminOnly,exportTaskReport); // export all tasks as excel/pdf

router.get("/export/users",protect,adminOnly,exportUserReport) // export user-task excel report

module.exports = router;