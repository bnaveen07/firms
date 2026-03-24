const Incident = require('../models/Incident');
const { AUDIT_ACTIONS } = require('../config/constants');
const auditService = require('../services/auditService');

const createIncident = async (req, res, next) => {
  try {
    const incident = await Incident.create({ ...req.body, reportedBy: req.user._id });

    await auditService.log({
      action: AUDIT_ACTIONS.CREATE,
      performedBy: req.user._id,
      resourceType: 'Incident',
      resourceId: incident._id,
      details: { title: incident.title, severity: incident.severity },
      ipAddress: req.ip,
    });

    if (req.io) {
      req.io.emit('incident:new', incident);
    }

    res.status(201).json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

const getIncidents = async (req, res, next) => {
  try {
    const { status, severity, type, page = 1, limit = 20, lat, lng, radius } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    if (lat && lng && radius) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) * 1000,
        },
      };
    }

    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Incident.countDocuments(filter);
    res.json({
      success: true,
      incidents,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTeam', 'name email');

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

const updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (req.io) {
      req.io.emit('incident:updated', incident);
    }

    await auditService.log({
      action: AUDIT_ACTIONS.UPDATE,
      performedBy: req.user._id,
      resourceType: 'Incident',
      resourceId: incident._id,
      details: req.body,
      ipAddress: req.ip,
    });

    res.json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

const addUpdate = async (req, res, next) => {
  try {
    const { message } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          updates: { message, updatedBy: req.user._id, timestamp: new Date() },
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (req.io) {
      req.io.emit('incident:update', { incidentId: req.params.id, message });
    }

    res.json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

const getIncidentStats = async (req, res, next) => {
  try {
    const [bySeverity, byStatus, byType] = await Promise.all([
      Incident.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);

    res.json({ success: true, stats: { bySeverity, byStatus, byType } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  addUpdate,
  getIncidentStats,
};
