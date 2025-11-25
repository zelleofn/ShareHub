const express = require('express');
const router = express.Router();
const  authenticateToken = require('../middleware/auth');
const FileVersion = require('../models/models/fileversion');

router.get('/versions/:fileId', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const versions = await FileVersion.find({ fileId, userId: req.user.userId }).sort({ versionNumber: -1 });

        if (!versions || versions.length === 0) {
            return res.status(404).json({ error: 'No versions found for this file.' });
        }

        res.json({
            fileId,
            versions: versions.map(v => ({
                version: v.versionNumber,
                uploadedAt: v.uploadDate,
                size: v.size,
                isCurrent: v.isCurrent
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve version history' });
    }
});

module.exports = router;