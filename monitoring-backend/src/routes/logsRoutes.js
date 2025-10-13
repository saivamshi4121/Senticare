const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// GET /api/logs?limit=100
router.get('/', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs', error: e.message });
  }
});

module.exports = router;


