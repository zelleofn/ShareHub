const express = require('express');
const router = express.Router();
const User = require('../models/User'); 


router.get('/usage', async (req, res) => {
  try {
    const userId = req.user.userId; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const used = user.storageUsed || 0;
    const total = user.storageLimit || 0;
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

    res.json({ used, total, percentage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch storage usage', details: err.message });
  }
});

module.exports = router;
