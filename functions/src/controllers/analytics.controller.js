const Application = require('../models/Application');
const Incident = require('../models/Incident');
const Inspection = require('../models/Inspection');
const NOCCertificate = require('../models/NOCCertificate');
const User = require('../models/User');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalApplications,
      pendingApplications,
      activeIncidents,
      certificatesIssued,
      totalInspectors,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      Incident.countDocuments({ status: 'active' }),
      NOCCertificate.countDocuments({ status: 'issued' }),
      User.countDocuments({ role: 'inspector' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalApplications,
        pendingApplications,
        activeIncidents,
        certificatesIssued,
        totalInspectors,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trend = await Application.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, trend });
  } catch (error) {
    next(error);
  }
};

const getIncidentHeatmap = async (req, res, next) => {
  try {
    const incidents = await Incident.find(
      { 'location.coordinates.lat': { $exists: true } },
      { 'location.coordinates': 1, severity: 1, status: 1 }
    );

    const heatmapData = incidents.map((inc) => ({
      lat: inc.location.coordinates.lat,
      lng: inc.location.coordinates.lng,
      weight:
        inc.severity === 'critical'
          ? 4
          : inc.severity === 'high'
            ? 3
            : inc.severity === 'medium'
              ? 2
              : 1,
    }));

    res.json({ success: true, heatmapData });
  } catch (error) {
    next(error);
  }
};

const getInspectionMetrics = async (req, res, next) => {
  try {
    const [passRate, avgScore, byResult] = await Promise.all([
      Inspection.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: { $sum: { $cond: [{ $eq: ['$overallResult', 'pass'] }, 1, 0] } },
            avgScore: { $avg: '$score' },
          },
        },
      ]),
      Inspection.aggregate([
        { $match: { status: 'completed', score: { $exists: true } } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } },
      ]),
      Inspection.aggregate([
        { $group: { _id: '$overallResult', count: { $sum: 1 } } },
      ]),
    ]);

    const metrics = passRate[0] || { total: 0, passed: 0, avgScore: 0 };
    res.json({
      success: true,
      metrics: {
        passRate: metrics.total > 0 ? Math.round((metrics.passed / metrics.total) * 100) : 0,
        avgScore: Math.round(metrics.avgScore || 0),
        total: metrics.total,
        byResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRiskScore = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = city ? { 'location.city': city } : {};
    const recentIncidents = await Incident.find({
      ...filter,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const criticalCount = recentIncidents.filter((i) => i.severity === 'critical').length;
    const highCount = recentIncidents.filter((i) => i.severity === 'high').length;
    const mediumCount = recentIncidents.filter((i) => i.severity === 'medium').length;

    const riskScore = Math.min(
      100,
      criticalCount * 25 + highCount * 15 + mediumCount * 5
    );

    res.json({
      success: true,
      riskScore,
      breakdown: { critical: criticalCount, high: highCount, medium: mediumCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getApplicationTrend,
  getIncidentHeatmap,
  getInspectionMetrics,
  getRiskScore,
};
