const Inspection = require('../models/Inspection');
const Application = require('../models/Application');
const { AUDIT_ACTIONS, APPLICATION_STATUS } = require('../config/constants');
const auditService = require('../services/auditService');

const createInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.create(req.body);
    await Application.findByIdAndUpdate(req.body.application, {
      status: APPLICATION_STATUS.INSPECTION_SCHEDULED,
      inspectionDate: req.body.scheduledDate,
    });

    await auditService.log({
      action: AUDIT_ACTIONS.CREATE,
      performedBy: req.user._id,
      resourceType: 'Inspection',
      resourceId: inspection._id,
      details: { application: req.body.application },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

const getInspections = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'inspector') filter.inspector = req.user._id;
    if (status) filter.status = status;

    const inspections = await Inspection.find(filter)
      .populate('application', 'applicationNumber propertyName')
      .populate('inspector', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1 });

    const total = await Inspection.countDocuments(filter);
    res.json({
      success: true,
      inspections,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('application')
      .populate('inspector', 'name email phone');

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    res.json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

const updateInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    if (req.body.status === 'completed') {
      await Application.findByIdAndUpdate(inspection.application, {
        status:
          req.body.overallResult === 'pass'
            ? APPLICATION_STATUS.APPROVED
            : APPLICATION_STATUS.REJECTED,
      });
    }

    await auditService.log({
      action: AUDIT_ACTIONS.UPDATE,
      performedBy: req.user._id,
      resourceType: 'Inspection',
      resourceId: inspection._id,
      details: req.body,
      ipAddress: req.ip,
    });

    res.json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      {
        gpsCheckIn: { lat, lng, timestamp: new Date() },
        status: 'in_progress',
        startedAt: new Date(),
      },
      { new: true }
    );

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    await Application.findByIdAndUpdate(inspection.application, {
      status: APPLICATION_STATUS.INSPECTION_IN_PROGRESS,
    });

    res.json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

const submitChecklist = async (req, res, next) => {
  try {
    const { checklist, photos, overallResult, summary, recommendations, score } = req.body;
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      {
        checklist,
        photos,
        overallResult,
        summary,
        recommendations,
        score,
        status: 'completed',
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    res.json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInspection,
  getInspections,
  getInspection,
  updateInspection,
  checkIn,
  submitChecklist,
};
