const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [String],
    medications: [String],
    medicalHistory: [String],
    currentConditions: [String]
  },
  roomInfo: {
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    bedNumber: String,
    admissionDate: {
      type: Date,
      default: Date.now
    },
    dischargeDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Discharged', 'Transferred', 'Critical'],
      default: 'Active'
    }
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  vitalSigns: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  alerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  notes: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['General', 'Medical', 'Nursing', 'Doctor'],
      default: 'General'
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
patientSchema.index({ patientId: 1 });
patientSchema.index({ 'roomInfo.roomNumber': 1 });
patientSchema.index({ 'roomInfo.status': 1 });
patientSchema.index({ 'assignedStaff': 1 });

module.exports = mongoose.model('Patient', patientSchema);
