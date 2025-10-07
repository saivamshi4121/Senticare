const Patient = require('../models/Patient');
const User = require('../models/User');
const Alert = require('../models/Alert');

// Get all patients with pagination and filtering
const getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      roomNumber,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) query['roomInfo.status'] = status;
    if (roomNumber) query['roomInfo.roomNumber'] = roomNumber;
    if (department) query['assignedStaff.department'] = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const patients = await Patient.find(query)
      .populate('assignedStaff', 'firstName lastName role department')
      .populate('alerts', 'title priority status type')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: patients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedStaff', 'firstName lastName role department email phone')
      .populate('alerts', 'title priority status type createdAt')
      .populate('vitalSigns.recordedBy', 'firstName lastName role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Generate unique patient ID
    const count = await Patient.countDocuments();
    patientData.patientId = `PAT-${String(count + 1).padStart(6, '0')}`;

    const patient = new Patient(patientData);
    await patient.save();

    const populatedPatient = await Patient.findById(patient._id)
      .populate('assignedStaff', 'firstName lastName role department');

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: populatedPatient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedStaff', 'firstName lastName role department');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Also delete associated alerts
    await Alert.deleteMany({ patient: req.params.id });

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
};

// Get patients by room
const getPatientsByRoom = async (req, res) => {
  try {
    const patients = await Patient.find({ 'roomInfo.roomNumber': req.params.roomNumber })
      .populate('assignedStaff', 'firstName lastName role department')
      .populate('alerts', 'title priority status type');

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients by room',
      error: error.message
    });
  }
};

// Get patients by status
const getPatientsByStatus = async (req, res) => {
  try {
    const patients = await Patient.find({ 'roomInfo.status': req.params.status })
      .populate('assignedStaff', 'firstName lastName role department')
      .populate('alerts', 'title priority status type');

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients by status',
      error: error.message
    });
  }
};

// Add vital signs
const addVitalSigns = async (req, res) => {
  try {
    const { vitalSigns } = req.body;
    vitalSigns.recordedBy = req.user.id;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $push: { vitalSigns } },
      { new: true }
    ).populate('vitalSigns.recordedBy', 'firstName lastName role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check for critical vital signs and create alerts if needed
    await checkCriticalVitalSigns(req.params.id, vitalSigns);

    res.json({
      success: true,
      message: 'Vital signs added successfully',
      data: patient.vitalSigns[patient.vitalSigns.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding vital signs',
      error: error.message
    });
  }
};

// Get vital signs history
const getVitalSignsHistory = async (req, res) => {
  try {
    const { limit = 50, startDate, endDate } = req.query;
    
    const query = { _id: req.params.id };
    if (startDate || endDate) {
      query['vitalSigns.timestamp'] = {};
      if (startDate) query['vitalSigns.timestamp'].$gte = new Date(startDate);
      if (endDate) query['vitalSigns.timestamp'].$lte = new Date(endDate);
    }

    const patient = await Patient.findOne(query)
      .populate('vitalSigns.recordedBy', 'firstName lastName role')
      .select('vitalSigns');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const vitalSigns = patient.vitalSigns
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: vitalSigns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vital signs history',
      error: error.message
    });
  }
};

// Add patient note
const addPatientNote = async (req, res) => {
  try {
    const { content, type = 'General' } = req.body;
    const note = {
      content,
      type,
      author: req.user.id
    };

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: note } },
      { new: true }
    ).populate('notes.author', 'firstName lastName role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: patient.notes[patient.notes.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
};

// Get patient notes
const getPatientNotes = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('notes.author', 'firstName lastName role')
      .select('notes');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const notes = patient.notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient notes',
      error: error.message
    });
  }
};

// Assign staff to patient
const assignStaffToPatient = async (req, res) => {
  try {
    const { staffIds } = req.body;

    // Verify staff members exist
    const staff = await User.find({ _id: { $in: staffIds } });
    if (staff.length !== staffIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more staff members not found'
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedStaff: { $each: staffIds } } },
      { new: true }
    ).populate('assignedStaff', 'firstName lastName role department');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff assigned successfully',
      data: patient.assignedStaff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error assigning staff',
      error: error.message
    });
  }
};

// Remove staff from patient
const removeStaffFromPatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedStaff: req.params.staffId } },
      { new: true }
    ).populate('assignedStaff', 'firstName lastName role department');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff removed successfully',
      data: patient.assignedStaff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error removing staff',
      error: error.message
    });
  }
};

// Search patients
const searchPatients = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const patients = await Patient.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } },
        { 'contactInfo.phone': { $regex: q, $options: 'i' } },
        { 'roomInfo.roomNumber': { $regex: q, $options: 'i' } }
      ]
    })
    .populate('assignedStaff', 'firstName lastName role department')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching patients',
      error: error.message
    });
  }
};

// Helper function to check for critical vital signs
const checkCriticalVitalSigns = async (patientId, vitalSigns) => {
  const criticalAlerts = [];

  // Temperature checks
  if (vitalSigns.temperature) {
    if (vitalSigns.temperature > 39.5 || vitalSigns.temperature < 35) {
      criticalAlerts.push({
        type: 'Vital Signs',
        priority: 'Critical',
        title: 'Critical Temperature Alert',
        description: `Patient temperature is ${vitalSigns.temperature}°C`
      });
    }
  }

  // Blood pressure checks
  if (vitalSigns.bloodPressure) {
    const { systolic, diastolic } = vitalSigns.bloodPressure;
    if (systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 60) {
      criticalAlerts.push({
        type: 'Vital Signs',
        priority: 'High',
        title: 'Abnormal Blood Pressure',
        description: `Blood pressure: ${systolic}/${diastolic} mmHg`
      });
    }
  }

  // Heart rate checks
  if (vitalSigns.heartRate) {
    if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50) {
      criticalAlerts.push({
        type: 'Vital Signs',
        priority: 'High',
        title: 'Abnormal Heart Rate',
        description: `Heart rate: ${vitalSigns.heartRate} bpm`
      });
    }
  }

  // Oxygen saturation checks
  if (vitalSigns.oxygenSaturation) {
    if (vitalSigns.oxygenSaturation < 90) {
      criticalAlerts.push({
        type: 'Vital Signs',
        priority: 'Critical',
        title: 'Low Oxygen Saturation',
        description: `Oxygen saturation: ${vitalSigns.oxygenSaturation}%`
      });
    }
  }

  // Create alerts for critical vital signs
  for (const alertData of criticalAlerts) {
    const alert = new Alert({
      ...alertData,
      patient: patientId,
      source: 'System',
      metadata: {
        vitalSigns
      }
    });
    await alert.save();
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientsByRoom,
  getPatientsByStatus,
  addVitalSigns,
  getVitalSignsHistory,
  addPatientNote,
  getPatientNotes,
  assignStaffToPatient,
  removeStaffFromPatient,
  searchPatients
};
