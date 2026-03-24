const mongoose = require('mongoose');
const { INCIDENT_SEVERITY, INCIDENT_STATUS } = require('../config/constants');

const incidentSchema = new mongoose.Schema(
  {
    incidentNumber: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['fire', 'explosion', 'chemical_leak', 'structural', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(INCIDENT_SEVERITY),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUS),
      default: INCIDENT_STATUS.ACTIVE,
    },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    casualties: {
      injuries: { type: Number, default: 0 },
      fatalities: { type: Number, default: 0 },
    },
    propertyDamage: { type: String },
    causeOfFire: { type: String },
    resourcesDeployed: { type: String },
    resolvedAt: { type: Date },
    updates: [
      {
        message: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

incidentSchema.pre('save', async function (next) {
  if (!this.incidentNumber) {
    const count = await mongoose.model('Incident').countDocuments();
    this.incidentNumber = `INC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

incidentSchema.index({ 'location.coordinates': '2dsphere' });
incidentSchema.index({ status: 1, severity: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
