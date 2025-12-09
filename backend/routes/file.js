const express = require('express');
const router = express.Router();
const  authenticateToken = require('../middleware/auth');
const FileVersion = require('../models/models/fileversion');
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const mime = require("mime")

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

router.get("/:id/preview", authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;

    
    const file = await FilesRepo.getByIdForUser(fileId, req.user.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const mimeType = file.mimeType || mime.getType(file.fileName) || "application/octet-stream";

   
    if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") {
      return res.status(400).json({ error: "Preview not supported for this file type" });
    }

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.fileName)}"`);

    const stream = fs.createReadStream(path.resolve(STORAGE_DIR, file.storageKey));
    stream.on("error", () => res.status(500).end());
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/thumbnail", async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FilesRepo.getByIdForUser(fileId, req.user.id);
    if (!file) return res.status(404).json({ error: "File not found" });

     if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Not an image file" });
    }

    const filePath = path.resolve(STORAGE_DIR, file.storageKey);
    res.setHeader("Content-Type, image/jpeg")

    fs.createdReadStream(filePath)
    .pipe(sharp().resize(300).jpeg({quality:70}))
    .pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;