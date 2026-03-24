const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../config/constants');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, unique: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyName: { type: String, required: true, trim: true },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'educational', 'healthcare', 'other'],
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    floorArea: { type: Number },
    numberOfFloors: { type: Number },
    occupancyType: { type: String },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.DRAFT,
    },
    documents: [documentSchema],
    assignedInspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inspectionDate: { type: Date },
    reviewNotes: { type: String },
    rejectionReason: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.pre('save', async function (next) {
  if (!this.applicationNumber) {
    const count = await mongoose.model('Application').countDocuments();
    this.applicationNumber = `NOC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

applicationSchema.index({ status: 1, applicant: 1 });
applicationSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Application', applicationSchema);
