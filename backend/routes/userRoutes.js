const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/info', async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('username email createdAt updateAt');

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
   

module.exports = router;
