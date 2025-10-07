const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    enum: [
      'Critical',
      'High',
      'Medium',
      'Low',
      'Vital Signs',
      'Medication',
      'Equipment',
      'Emergency',
      'Fall Risk',
      'Infection Control'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'Resolved', 'Escalated'],
    default: 'Active'
  },
  source: {
    type: String,
    enum: ['System', 'Manual', 'Sensor', 'Staff'],
    required: true
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  escalationHistory: [{
    level: Number,
    escalatedAt: {
      type: Date,
      default: Date.now
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  metadata: {
    vitalSigns: {
      temperature: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number
    },
    roomNumber: String,
    equipmentId: String,
    sensorData: mongoose.Schema.Types.Mixed
  },
  notifications: [{
    method: {
      type: String,
      enum: ['Email', 'SMS', 'Push', 'In-App', 'Phone']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Sent', 'Delivered', 'Failed', 'Pending'],
      default: 'Pending'
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
alertSchema.index({ patient: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ 'assignedTo': 1 });

// Auto-generate alertId
alertSchema.pre('save', async function(next) {
  if (this.isNew && !this.alertId) {
    const count = await this.constructor.countDocuments();
    this.alertId = `ALERT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Alert', alertSchema);
