const express = require('express');
const router = express.Router();
const User = require('../models/models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: (req, file, cb) => {
    cb(null, req.user.userId + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/info', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      'username email createdAt updatedAt profilePicture'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user info', details: error.message });
  }
});

router.put('/edit', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        username: user.username,
        email: user.email,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password', details: error.message });
  }
});

router.put('/upload-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Profile picture updated',
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      'language theme notificationsEnabled defaultFilePrivacy fileVersioningEnabled'
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      language: user.language,
      theme: user.theme,
      notificationsEnabled: user.notificationsEnabled,
      defaultFilePrivacy: user.defaultFilePrivacy,
      fileVersioningEnabled: user.fileVersioningEnabled,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.id };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

router.put('/settings', async (req, res) => {
  try {
     
    const userId = req.user.userId;
    const { language, theme, notificationsEnabled, defaultFilePrivacy, fileVersioningEnabled } =
      req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (language) user.language = language;
    if (theme) user.theme = theme;
    if (typeof notificationsEnabled === 'boolean') user.notificationsEnabled = notificationsEnabled;
    if (defaultFilePrivacy) user.defaultFilePrivacy = defaultFilePrivacy;
    if (typeof fileVersioningEnabled === 'boolean')
      user.fileVersioningEnabled = fileVersioningEnabled;

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        language: user.language,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled,
        defaultFilePrivacy: user.defaultFilePrivacy,
        fileVersioningEnabled: user.fileVersioningEnabled,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

router.delete('/settings/delete', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required to delete account' });
    }

    await User.findByIdAndDelete(userId);
    await File.deleteMany({ userId });

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
});

router.get('/settings/export', async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password');
    const files = await File.find({ userId });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user,
      files,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data', details: err.message });
  }
});

module.exports = router;
