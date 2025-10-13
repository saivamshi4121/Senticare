const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const {
  getModels,
  predictDistress,
  triage,
  analyzeVitals
} = require('../controllers/aiController');

// Models list (Admin + Doctor)
router.get('/models', authenticateToken, checkRole(['Admin', 'Doctor']), getModels);

// Inference endpoints (Doctor + Nurse + Admin)
router.post('/predict-distress', authenticateToken, checkRole(['Admin', 'Doctor', 'Nurse']), predictDistress);
router.post('/triage', authenticateToken, checkRole(['Admin', 'Doctor', 'Nurse']), triage);
router.post('/analyze-vitals', authenticateToken, checkRole(['Admin', 'Doctor', 'Nurse']), analyzeVitals);

module.exports = router;


