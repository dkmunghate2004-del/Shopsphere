const express = require('express');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, validateId } = require('../middleware/auth');
const { publicUser } = require('./auth');

const router = express.Router();
router.use(protect);

router.get('/profile', (req, res) => res.json({ user: publicUser(req.user) }));

router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (address) req.user.address = { ...(req.user.toObject().address || {}), ...address };
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  })
);

router.put(
  '/password',
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400);
      throw new Error('Provide your current password and a new password of at least 6 characters');
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  })
);

// ---- admin ----
router.get(
  '/',
  adminOnly,
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  })
);

router.put(
  '/:id/role',
  adminOnly,
  validateId(),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Role must be "user" or "admin"');
    }
    if (String(req.params.id) === String(req.user._id)) {
      res.status(400);
      throw new Error("You can't change your own role");
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ user: publicUser(user) });
  })
);

router.delete(
  '/:id',
  adminOnly,
  validateId(),
  asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) {
      res.status(400);
      throw new Error("You can't delete your own account");
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ message: 'User deleted' });
  })
);

module.exports = router;
