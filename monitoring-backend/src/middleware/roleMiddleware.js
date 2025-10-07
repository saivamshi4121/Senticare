// Check if user has required role(s)
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Check if user has any of the required roles
const checkAnyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const hasRole = allowedRoles.some(role => req.user.role === role);
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Check if user is doctor or admin
const requireDoctorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!['Admin', 'Doctor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Doctor or Admin access required'
    });
  }

  next();
};

// Check if user is medical staff (Doctor, Nurse, or Admin)
const requireMedicalStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!['Admin', 'Doctor', 'Nurse'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Medical staff access required'
    });
  }

  next();
};

// Check if user can access patient data based on role and assignment
const checkPatientDataAccess = async (req, res, next) => {
  try {
    const patientId = req.params.id || req.params.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Admin can access all patient data
    if (req.user.role === 'Admin') {
      return next();
    }

    // Medical staff can access patient data if assigned
    if (['Doctor', 'Nurse'].includes(req.user.role)) {
      const Patient = require('../models/Patient');
      const patient = await Patient.findById(patientId).select('assignedStaff');
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const isAssigned = patient.assignedStaff.some(
        staffId => staffId.toString() === req.user._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not assigned to this patient'
        });
      }

      return next();
    }

    // Other roles cannot access patient data
    return res.status(403).json({
      success: false,
      message: 'Access denied - insufficient permissions for patient data'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking patient data access',
      error: error.message
    });
  }
};

// Check if user can modify patient data
const checkPatientModifyAccess = async (req, res, next) => {
  try {
    const patientId = req.params.id || req.params.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Admin can modify all patient data
    if (req.user.role === 'Admin') {
      return next();
    }

    // Only assigned medical staff can modify patient data
    if (['Doctor', 'Nurse'].includes(req.user.role)) {
      const Patient = require('../models/Patient');
      const patient = await Patient.findById(patientId).select('assignedStaff');
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const isAssigned = patient.assignedStaff.some(
        staffId => staffId.toString() === req.user._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not assigned to this patient'
        });
      }

      return next();
    }

    // Other roles cannot modify patient data
    return res.status(403).json({
      success: false,
      message: 'Access denied - insufficient permissions to modify patient data'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking patient modify access',
      error: error.message
    });
  }
};

// Check if user can access alert data
const checkAlertAccess = async (req, res, next) => {
  try {
    const alertId = req.params.id;
    
    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: 'Alert ID is required'
      });
    }

    // Admin can access all alerts
    if (req.user.role === 'Admin') {
      return next();
    }

    // Medical staff can access alerts if assigned to the patient
    if (['Doctor', 'Nurse'].includes(req.user.role)) {
      const Alert = require('../models/Alert');
      const alert = await Alert.findById(alertId).populate('patient', 'assignedStaff');
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      const isAssignedToPatient = alert.patient.assignedStaff.some(
        staffId => staffId.toString() === req.user._id.toString()
      );

      const isAssignedToAlert = alert.assignedTo.some(
        staffId => staffId.toString() === req.user._id.toString()
      );

      if (!isAssignedToPatient && !isAssignedToAlert) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not assigned to this alert or patient'
        });
      }

      return next();
    }

    // Other roles cannot access alert data
    return res.status(403).json({
      success: false,
      message: 'Access denied - insufficient permissions for alert data'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking alert access',
      error: error.message
    });
  }
};

// Check department access
const checkDepartmentAccess = (allowedDepartments) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access all departments
    if (req.user.role === 'Admin') {
      return next();
    }

    if (!allowedDepartments.includes(req.user.department)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient department permissions',
        required: allowedDepartments,
        current: req.user.department
      });
    }

    next();
  };
};

// Check if user can perform specific action on resource
const checkPermission = (action, resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin has all permissions
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check user permissions
    const userPermissions = req.user.permissions || [];
    const hasPermission = userPermissions.some(permission => 
      permission.module === resource && permission.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied - insufficient permissions for ${action} on ${resource}`,
        required: { action, resource },
        current: req.user.permissions
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
  checkAnyRole,
  requireAdmin,
  requireDoctorOrAdmin,
  requireMedicalStaff,
  checkPatientDataAccess,
  checkPatientModifyAccess,
  checkAlertAccess,
  checkDepartmentAccess,
  checkPermission
};
