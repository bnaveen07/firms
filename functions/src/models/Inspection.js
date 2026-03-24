const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  item: { type: String, required: true },
  status: { type: String, enum: ['pass', 'fail', 'na'], required: true },
  remarks: { type: String },
});

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  uploadedAt: { type: Date, default: Date.now },
});

const inspectionSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    gpsCheckIn: {
      lat: { type: Number },
      lng: { type: Number },
      timestamp: { type: Date },
    },
    checklist: [checklistItemSchema],
    photos: [photoSchema],
    overallResult: { type: String, enum: ['pass', 'fail', 'conditional_pass'] },
    summary: { type: String },
    recommendations: { type: String },
    score: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);
