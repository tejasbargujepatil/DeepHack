const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/sales-report',    reportController.getSalesReport);
router.get('/export-sales',    reportController.exportSalesToExcel);
router.get('/export-pdf',      reportController.exportSalesToPDF);

module.exports = router;
