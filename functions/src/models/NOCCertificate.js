const mongoose = require('mongoose');
const { NOC_STATUS } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

const nocCertificateSchema = new mongoose.Schema(
  {
    certificateNumber: { type: String, unique: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(NOC_STATUS),
      default: NOC_STATUS.ISSUED,
    },
    propertyDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      type: { type: String },
    },
    issuedAt: { type: Date, default: Date.now },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    pdfUrl: { type: String },
    qrCode: { type: String },
    verificationToken: { type: String, unique: true, default: uuidv4 },
    revokedAt: { type: Date },
    revokedReason: { type: String },
    conditions: [{ type: String }],
  },
  { timestamps: true }
);

nocCertificateSchema.pre('save', async function (next) {
  if (!this.certificateNumber) {
    const count = await mongoose.model('NOCCertificate').countDocuments();
    this.certificateNumber = `NOC-CERT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('NOCCertificate', nocCertificateSchema);
