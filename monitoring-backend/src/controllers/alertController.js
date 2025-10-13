const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendEmail } = require('../utils/emailService');

// Get all alerts with pagination and filtering
const getAllAlerts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      type,
      patientId,
      assignedTo,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (patientId) query.patient = patientId;
    if (assignedTo) query.assignedTo = { $in: assignedTo.split(',') };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const alerts = await Alert.find(query)
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
      .populate('triggeredBy', 'firstName lastName role')
      .populate('acknowledgedBy.user', 'firstName lastName role')
      .populate('resolvedBy', 'firstName lastName role')
      .populate('assignedTo', 'firstName lastName role department')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

// Get active alerts only
const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'Active' })
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
      .populate('assignedTo', 'firstName lastName role department')
      .sort({ priority: 1, createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active alerts',
      error: error.message
    });
  }
};

// Get alert by ID
const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber contactInfo')
      .populate('triggeredBy', 'firstName lastName role department')
      .populate('acknowledgedBy.user', 'firstName lastName role department')
      .populate('resolvedBy', 'firstName lastName role department')
      .populate('assignedTo', 'firstName lastName role department email phone')
      .populate('comments.author', 'firstName lastName role');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message
    });
  }
};

// Create new alert
const createAlert = async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      triggeredBy: req.user.id
    };

    const alert = new Alert(alertData);
    await alert.save();

    const populatedAlert = await Alert.findById(alert._id)
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
      .populate('triggeredBy', 'firstName lastName role')
      .populate('assignedTo', 'firstName lastName role department');

    // Emit real-time alert to connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('newAlert', populatedAlert);
    }

    // Log activity
    try { await ActivityLog.create({ user: req.user.id, action: 'ALERT_CREATED', targetType: 'Alert', targetId: alert._id.toString(), metadata: { priority: alert.priority, type: alert.type } }); } catch {}

    // Send email for critical alerts (best-effort)
    try {
      if (alert.priority === 'Critical') {
        await sendEmail({
          to: process.env.ALERT_EMAIL_TO || process.env.EMAIL_USER,
          subject: `[Critical] ${alert.title}`,
          text: `Critical alert for patient ${alert.patient}: ${alert.description}`,
          html: `<p><strong>Critical alert</strong></p><p>${alert.description}</p>`
        });
      }
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: populatedAlert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
};

// Update alert
const updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('triggeredBy', 'firstName lastName role')
    .populate('assignedTo', 'firstName lastName role department');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Emit real-time update to connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('alertUpdated', alert);
    }
    try { await ActivityLog.create({ user: req.user.id, action: 'ALERT_UPDATED', targetType: 'Alert', targetId: alert._id.toString() }); } catch {}

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating alert',
      error: error.message
    });
  }
};

// Delete alert
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
};

// Acknowledge alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          acknowledgedBy: {
            user: req.user.id,
            notes: notes || ''
          }
        },
        $set: { status: 'Acknowledged' }
      },
      { new: true }
    )
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('acknowledgedBy.user', 'firstName lastName role')
    .populate('assignedTo', 'firstName lastName role department');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('alertAcknowledged', alert);
    }
    try { await ActivityLog.create({ user: req.user.id, action: 'ALERT_ACK', targetType: 'Alert', targetId: alert._id.toString() }); } catch {}

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
};

// Resolve alert
const resolveAlert = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'Resolved',
          resolvedBy: req.user.id,
          resolvedAt: new Date()
        },
        $push: {
          comments: {
            author: req.user.id,
            content: resolutionNotes || 'Alert resolved',
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('resolvedBy', 'firstName lastName role')
    .populate('assignedTo', 'firstName lastName role department');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('alertResolved', alert);
    }
    try { await ActivityLog.create({ user: req.user.id, action: 'ALERT_RESOLVED', targetType: 'Alert', targetId: alert._id.toString() }); } catch {}

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
};

// Escalate alert
const escalateAlert = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const newEscalationLevel = Math.min(alert.escalationLevel + 1, 3);
    
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $set: { escalationLevel: newEscalationLevel },
        $push: {
          escalationHistory: {
            level: newEscalationLevel,
            escalatedBy: req.user.id,
            reason: reason || 'Manual escalation'
          }
        }
      },
      { new: true }
    )
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('escalationHistory.escalatedBy', 'firstName lastName role')
    .populate('assignedTo', 'firstName lastName role department');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('alertEscalated', updatedAlert);
    }
    try { await ActivityLog.create({ user: req.user.id, action: 'ALERT_ESCALATED', targetType: 'Alert', targetId: updatedAlert._id.toString(), metadata: { level: updatedAlert.escalationLevel } }); } catch {}

    res.json({
      success: true,
      message: 'Alert escalated successfully',
      data: updatedAlert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error escalating alert',
      error: error.message
    });
  }
};

// Assign alert to staff
const assignAlertToStaff = async (req, res) => {
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

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: staffIds } } },
      { new: true }
    )
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('assignedTo', 'firstName lastName role department');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('alertAssigned', alert);
    }

    res.json({
      success: true,
      message: 'Alert assigned successfully',
      data: alert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error assigning alert',
      error: error.message
    });
  }
};

// Add comment to alert
const addAlertComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            author: req.user.id,
            content,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )
    .populate('comments.author', 'firstName lastName role');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const newComment = alert.comments[alert.comments.length - 1];

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Get alert comments
const getAlertComments = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('comments.author', 'firstName lastName role')
      .select('comments');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const comments = alert.comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert comments',
      error: error.message
    });
  }
};

// Get alerts by patient
const getAlertsByPatient = async (req, res) => {
  try {
    const alerts = await Alert.find({ patient: req.params.patientId })
      .populate('triggeredBy', 'firstName lastName role')
      .populate('acknowledgedBy.user', 'firstName lastName role')
      .populate('resolvedBy', 'firstName lastName role')
      .populate('assignedTo', 'firstName lastName role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient alerts',
      error: error.message
    });
  }
};

// Get alerts by priority
const getAlertsByPriority = async (req, res) => {
  try {
    const alerts = await Alert.find({ priority: req.params.priority })
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
      .populate('assignedTo', 'firstName lastName role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts by priority',
      error: error.message
    });
  }
};

// Get alerts by status
const getAlertsByStatus = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: req.params.status })
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
      .populate('assignedTo', 'firstName lastName role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts by status',
      error: error.message
    });
  }
};

// Get alerts by type
const getAlertsByType = async (req, res) => {
  try {
    const alerts = await Alert.find({ type: req.params.type })
      .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
      .populate('assignedTo', 'firstName lastName role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts by type',
      error: error.message
    });
  }
};

// Get alerts by date range
const getAlertsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const alerts = await Alert.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('assignedTo', 'firstName lastName role department')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts by date range',
      error: error.message
    });
  }
};

// Search alerts
const searchAlerts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const alerts = await Alert.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .populate('patient', 'patientId firstName lastName roomInfo.roomNumber')
    .populate('assignedTo', 'firstName lastName role department')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching alerts',
      error: error.message
    });
  }
};

module.exports = {
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
};
