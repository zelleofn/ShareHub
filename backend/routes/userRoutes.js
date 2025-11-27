const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/info', async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('username email createdAt updatedAt');


        if (!user) {   
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            name: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user info', details: error.message });
    }
});

router.put('/edit', async (req, res) => {
    try{
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
            updatedAt: user.updatedAt
            } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

rouer.put('/change-password', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password', details: error.message });
    }
});

router.get('/settings', async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-language theme notificationsEnabled');
        return res.status(404).json({ error: 'User not found' });

        res.json({
            language: user.language,
            theme: user.theme,
            notificationsEnabled: user.notificationsEnabled
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user settings', details: error.message });
    }
        });

     router.put('/settings', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { language, theme, notificationsEnabled } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (language) user.language = language;
    if (theme) user.theme = theme;
    if (typeof notificationsEnabled === 'boolean') {
      user.notificationsEnabled = notificationsEnabled;
    }

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        language: user.language,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

       

module.exports = router;
