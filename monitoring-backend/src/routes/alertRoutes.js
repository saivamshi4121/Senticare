const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  getAlertsByPatient,
  getAlertsByPriority,
  getAlertsByStatus,
  getAlertsByType,
  assignAlertToStaff,
  addAlertComment,
  getAlertComments,
  getActiveAlerts,
  getAlertsByDateRange,
  searchAlerts
} = require('../controllers/alertController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Get all alerts (with pagination and filtering)
router.get('/', authenticateToken, getAllAlerts);

// Get active alerts only
router.get('/active', authenticateToken, getActiveAlerts);

// Search alerts
router.get('/search', authenticateToken, searchAlerts);

// Get alerts by patient
router.get('/patient/:patientId', authenticateToken, getAlertsByPatient);

// Get alerts by priority
router.get('/priority/:priority', authenticateToken, getAlertsByPriority);

// Get alerts by status
router.get('/status/:status', authenticateToken, getAlertsByStatus);

// Get alerts by type
router.get('/type/:type', authenticateToken, getAlertsByType);

// Get alerts by date range
router.get('/date-range', authenticateToken, getAlertsByDateRange);

// Get alert by ID
router.get('/:id', authenticateToken, getAlertById);

// Create new alert (System, Doctor, Nurse)
router.post('/', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor', 'Nurse']), 
  createAlert
);

// Update alert (Admin, Doctor, Nurse)
router.put('/:id', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor', 'Nurse']), 
  updateAlert
);

// Delete alert (Admin only)
router.delete('/:id', 
  authenticateToken, 
  checkRole(['Admin']), 
  deleteAlert
);

// Acknowledge alert (Doctor, Nurse)
router.patch('/:id/acknowledge', 
  authenticateToken, 
  checkRole(['Doctor', 'Nurse']), 
  acknowledgeAlert
);

// Resolve alert (Doctor, Nurse)
router.patch('/:id/resolve', 
  authenticateToken, 
  checkRole(['Doctor', 'Nurse']), 
  resolveAlert
);

// Escalate alert (Doctor, Nurse, Admin)
router.patch('/:id/escalate', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor', 'Nurse']), 
  escalateAlert
);

// Assign alert to staff (Admin, Doctor)
router.post('/:id/assign', 
  authenticateToken, 
  checkRole(['Admin', 'Doctor']), 
  assignAlertToStaff
);

// Add comment to alert (All authenticated users)
router.post('/:id/comments', 
  authenticateToken, 
  addAlertComment
);

// Get alert comments
router.get('/:id/comments', authenticateToken, getAlertComments);

module.exports = router;
