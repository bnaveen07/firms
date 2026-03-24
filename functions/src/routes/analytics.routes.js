const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/trends/applications', analyticsController.getApplicationTrend);
router.get('/heatmap/incidents', analyticsController.getIncidentHeatmap);
router.get('/metrics/inspections', analyticsController.getInspectionMetrics);
router.get('/risk-score', analyticsController.getRiskScore);

module.exports = router;
