const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const File = require('../models/File');       
const FileVersion = require('../models/FileVersion'); 


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

    const warning = percentage >= 80;

    res.json({ used, total, percentage, warning });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch storage usage', details: err.message });
  }
});


router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

   
    const files = await File.find({ userId, deleted: false });
    const versions = await FileVersion.find({ userId });

    const totalFiles = files.length;
    const totalVersions = versions.length;

   
    const sizes = files.map(f => f.fileSize || 0);
    const totalSize = sizes.reduce((a, b) => a + b, 0);
    const averageSize = sizes.length ? Math.round(totalSize / sizes.length) : 0;
    const largestSize = sizes.length ? Math.max(...sizes) : 0;
    const smallestSize = sizes.length ? Math.min(...sizes) : 0;

    
    const lastUpload = files.length
      ? files.reduce((latest, f) => f.createdAt > latest ? f.createdAt : latest, files[0].createdAt)
      : null;

   
    const percentage = user.storageLimit > 0
      ? Math.round((user.storageUsed / user.storageLimit) * 100)
      : 0;

    res.json({
      totalFiles,
      totalVersions,
      averageSize,
      largestSize,
      smallestSize,
      lastUpload,
      used: user.storageUsed,
      total: user.storageLimit,
      percentage
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch storage statistics', details: err.message });
  }
});

router.get('/largest', async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 5;
    const largestFiles = await File.find({ userId, deleted: false })
      .sort({ fileSize: -1 })
      .limit(limit)
      .select('fileName fileSize mimetype createdAt');
      es.json({ largestFiles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch largest files', details: err.message });
  }
});

router.get('/breakdown', async (req, res) => {
  try {
    const userId = req.user.userId;
    const breakdown = await File.aggregate([
      { $match: { userId, deleted: false } },
       {
        $group: {
          _id: "$mimetype",
          totalSize: { $sum: "$fileSize" }
        }
      }
    ]);
     const user = await User.findById(userId);
    const total = user?.storageLimit || 0;
     const result = breakdown.map(item => ({
      type: item._id,
      size: item.totalSize,
      percentage: total > 0 ? Math.round((item.totalSize / total) * 100) : 0
    }));
     res.json({ breakdown: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file type breakdown', details: err.message });
  }
});

module.exports = router;
