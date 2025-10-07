const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  updateProfile,
  deactivateAccount,
  activateAccount,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRole,
  getUsersByRole,
  getUsersByDepartment
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', authenticateToken, refreshToken);
router.post('/change-password', authenticateToken, changePassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Account management
router.patch('/deactivate', authenticateToken, deactivateAccount);
router.patch('/activate', authenticateToken, activateAccount);

// User management (Admin only)
router.get('/users', 
  authenticateToken, 
  checkRole(['Admin']), 
  getAllUsers
);

router.get('/users/role/:role', 
  authenticateToken, 
  checkRole(['Admin']), 
  getUsersByRole
);

router.get('/users/department/:department', 
  authenticateToken, 
  checkRole(['Admin']), 
  getUsersByDepartment
);

router.get('/users/:id', 
  authenticateToken, 
  checkRole(['Admin']), 
  getUserById
);

router.put('/users/:id', 
  authenticateToken, 
  checkRole(['Admin']), 
  updateUser
);

router.delete('/users/:id', 
  authenticateToken, 
  checkRole(['Admin']), 
  deleteUser
);

router.patch('/users/:id/role', 
  authenticateToken, 
  checkRole(['Admin']), 
  assignRole
);

module.exports = router;
