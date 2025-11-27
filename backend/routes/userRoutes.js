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

module.exports = router;
