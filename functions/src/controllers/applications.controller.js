const Application = require('../models/Application');
const { AUDIT_ACTIONS, APPLICATION_STATUS, ROLES } = require('../config/constants');
const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');

const createApplication = async (req, res, next) => {
  try {
    const applicationData = { ...req.body, applicant: req.user._id };
    const application = await Application.create(applicationData);

    await auditService.log({
      action: AUDIT_ACTIONS.CREATE,
      performedBy: req.user._id,
      resourceType: 'Application',
      resourceId: application._id,
      details: { applicationNumber: application.applicationNumber },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === ROLES.APPLICANT) {
      filter.applicant = req.user._id;
    } else if (req.user.role === ROLES.INSPECTOR) {
      filter.assignedInspector = req.user._id;
    }

    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('applicant', 'name email')
      .populate('assignedInspector', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);
    res.json({
      success: true,
      applications,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone')
      .populate('assignedInspector', 'name email phone');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (
      req.user.role === ROLES.APPLICANT &&
      application.applicant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (
      req.user.role === ROLES.APPLICANT &&
      application.applicant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await auditService.log({
      action: AUDIT_ACTIONS.UPDATE,
      performedBy: req.user._id,
      resourceType: 'Application',
      resourceId: application._id,
      details: req.body,
      ipAddress: req.ip,
    });

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    next(error);
  }
};

const submitApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    application.status = APPLICATION_STATUS.SUBMITTED;
    application.submittedAt = new Date();
    await application.save();

    await notificationService.sendApplicationStatusUpdate(application);

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

const reviewApplication = async (req, res, next) => {
  try {
    const { status, reviewNotes, rejectionReason, assignedInspector, inspectionDate } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, reviewNotes, rejectionReason, assignedInspector, inspectionDate },
      { new: true }
    ).populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await auditService.log({
      action: status === APPLICATION_STATUS.APPROVED ? AUDIT_ACTIONS.APPROVE : AUDIT_ACTIONS.UPDATE,
      performedBy: req.user._id,
      resourceType: 'Application',
      resourceId: application._id,
      details: { status, reviewNotes },
      ipAddress: req.ip,
    });

    await notificationService.sendApplicationStatusUpdate(application);

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const result = stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    res.json({ success: true, stats: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  submitApplication,
  reviewApplication,
  getApplicationStats,
};
