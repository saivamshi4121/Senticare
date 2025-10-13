const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Get all patients (with pagination and filtering)
router.get('/', authenticateToken, getAllPatients);

// Search patients
router.get('/search', authenticateToken, searchPatients);

// Get patients by room
router.get('/room/:roomNumber', authenticateToken, getPatientsByRoom);

// Get patients by status
router.get('/status/:status', authenticateToken, getPatientsByStatus);

// Get patient by ID
router.get('/:id', authenticateToken, getPatientById);

// Create new patient (Admin, Doctor, Nurse)
router.post('/', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor', 'Nurse']), 
  createPatient
);

// Update patient (Admin, Doctor, Nurse)
router.put('/:id', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor', 'Nurse']), 
  updatePatient
);

// Delete patient (Admin only)
router.delete('/:id', 
  authenticateToken, 
  checkRole(['Admin']), 
  deletePatient
);

// Add vital signs (Doctor, Nurse)
router.post('/:id/vital-signs', 
  authenticateToken, 
  checkRole(['Doctor', 'Nurse']), 
  addVitalSigns
);

// Get vital signs history
router.get('/:id/vital-signs', authenticateToken, getVitalSignsHistory);

// Add patient note (Doctor, Nurse)
router.post('/:id/notes', 
  authenticateToken, 
  checkRole(['Doctor', 'Nurse']), 
  addPatientNote
);

// Get patient notes
router.get('/:id/notes', authenticateToken, getPatientNotes);

// Assign staff to patient (Admin, Doctor)
router.post('/:id/assign-staff', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor']), 
  assignStaffToPatient
);

// Remove staff from patient (Admin, Doctor)
router.delete('/:id/assign-staff/:staffId', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor']), 
  removeStaffFromPatient
);

// New: PATCH /api/patients/:id/assign (idempotent add)
router.patch('/:id/assign',
  authenticateToken,
  checkRole(['Admin', 'Doctor']),
  assignStaffToPatient
);

module.exports = router;
