const express = require('express');
const router = express.Router();
const File = require('../models/File'); 
const User = require('../models/User');


router.get('/storage-breakdown', async (req, res) => {
    try {
        const userId = req.user.userId;

        const breakdown = await File.aggregate([
            { $match: { userId, deleted: false } },
            {
                $group: {
                    _id: '$type',
                    totalSize: { $sum: '$size' }
                }
            }
        ]);

        const result = breakdown.map(item => ({
            type: item._id,
            size: item.totalSize
        }))

        const user = await User.findById(userId)
        const total = user?.storageUsed || 0;

        const withPercentages = result.map(item => ({
            type: item.type,
            size: item.size,
            percentage: total > 0 ? Math.round((item.size / total) * 100) : 0
        }));

        res.json({breakdown: withPercentages});
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve storage breakdown', details: err.message });

    }
});

module.exports = router;
       
    