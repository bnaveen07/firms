const NOCCertificate = require('../models/NOCCertificate');
const Application = require('../models/Application');
const { AUDIT_ACTIONS, APPLICATION_STATUS, NOC_STATUS } = require('../config/constants');
const auditService = require('../services/auditService');
const nocGenerator = require('../services/nocGenerator');

const issueCertificate = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId).populate(
      'applicant',
      'name email'
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== APPLICATION_STATUS.APPROVED) {
      return res
        .status(400)
        .json({ success: false, message: 'Application must be approved before issuing NOC' });
    }

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const certificate = await NOCCertificate.create({
      application: application._id,
      applicant: application.applicant._id,
      issuedBy: req.user._id,
      propertyDetails: {
        name: application.propertyName,
        address: `${application.address.street}, ${application.address.city}`,
        type: application.propertyType,
      },
      validFrom,
      validUntil,
      conditions: req.body.conditions || [],
    });

    const pdfUrl = await nocGenerator.generatePDF(certificate, application);
    certificate.pdfUrl = pdfUrl;
    const qrCode = await nocGenerator.generateQRCode(certificate.verificationToken);
    certificate.qrCode = qrCode;
    await certificate.save();

    await Application.findByIdAndUpdate(application._id, {
      status: APPLICATION_STATUS.CERTIFICATE_ISSUED,
      approvedAt: new Date(),
    });

    await auditService.log({
      action: AUDIT_ACTIONS.ISSUE_CERTIFICATE,
      performedBy: req.user._id,
      resourceType: 'NOCCertificate',
      resourceId: certificate._id,
      details: { certificateNumber: certificate.certificateNumber },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

const getCertificates = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'applicant') {
      filter.applicant = req.user._id;
    }

    const certificates = await NOCCertificate.find(filter)
      .populate('applicant', 'name email')
      .populate('issuedBy', 'name')
      .populate('application', 'applicationNumber propertyName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await NOCCertificate.countDocuments(filter);
    res.json({
      success: true,
      certificates,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getCertificate = async (req, res, next) => {
  try {
    const certificate = await NOCCertificate.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('issuedBy', 'name')
      .populate('application');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    res.json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await NOCCertificate.findOne({
      verificationToken: req.params.token,
    })
      .populate('applicant', 'name')
      .populate('application', 'propertyName address');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    }

    const isValid =
      certificate.status === NOC_STATUS.ISSUED && new Date() <= certificate.validUntil;

    res.json({
      success: true,
      isValid,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        propertyDetails: certificate.propertyDetails,
        validFrom: certificate.validFrom,
        validUntil: certificate.validUntil,
        status: certificate.status,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const revokeCertificate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const certificate = await NOCCertificate.findByIdAndUpdate(
      req.params.id,
      { status: NOC_STATUS.REVOKED, revokedAt: new Date(), revokedReason: reason },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    await auditService.log({
      action: AUDIT_ACTIONS.UPDATE,
      performedBy: req.user._id,
      resourceType: 'NOCCertificate',
      resourceId: certificate._id,
      details: { action: 'revoke', reason },
      ipAddress: req.ip,
    });

    res.json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  getCertificates,
  getCertificate,
  verifyCertificate,
  revokeCertificate,
};
