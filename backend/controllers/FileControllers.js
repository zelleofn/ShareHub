const File = require('../models/File');
const { uploadToAzure, downloadFromAzure, deleteFromAzure } = require('../utils/azureStorage');
const path = require('path');
const fs = require('fs').promises;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileBuffer = req.file.buffer;
    const originalFilename = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileSize = req.file.size;

    const { blobName, blobUrl } = await uploadToAzure(fileBuffer, originalFilename, mimeType);

    const newFile = new File({
      userId: req.userId,
      originalName: originalFilename,
      blobName: blobName,
      blobUrl: blobUrl,
      size: fileSize,
      mimetype: mimeType,
      uploadDate: new Date(),
      isPublic: false,
      sharedId: null
    });

    const savedFile = await newFile.save();

    res.json({
      success: true,
      file: savedFile,
      message: 'File uploaded successfully to Azure'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.userId }).select('-blobName');
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId.toString() !== req.userId && !file.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileBuffer = await downloadFromAzure(file.blobName);

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await deleteFromAzure(file.blobName);

    await File.findByIdAndDelete(req.params.fileId);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.shareFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sharedId = require('crypto').randomBytes(16).toString('hex');
    file.sharedId = sharedId;
    file.isPublic = true;
    await file.save();

    res.json({
      success: true,
      sharedId,
      sharedLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${sharedId}`,
      message: 'File shared successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSharedFile = async (req, res) => {
  try {
    const file = await File.findOne({ sharedId: req.params.sharedId });

    if (!file || !file.isPublic) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    res.json({
      success: true,
      file: {
        originalName: file.originalName,
        size: file.size,
        mimetype: file.mimetype,
        uploadDate: file.uploadDate,
        blobUrl: file.blobUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadSharedFile = async (req, res) => {
  try {
    const file = await File.findOne({ sharedId: req.params.sharedId });

    if (!file || !file.isPublic) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    const fileBuffer = await downloadFromAzure(file.blobName);

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.unshareFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    file.sharedId = null;
    file.isPublic = false;
    await file.save();

    res.json({ success: true, message: 'File sharing revoked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleFilePrivacy = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    file.isPublic = !file.isPublic;
    if (!file.isPublic) {
      file.sharedId = null;
    }
    await file.save();

    res.json({
      success: true,
      isPublic: file.isPublic,
      message: `File is now ${file.isPublic ? 'public' : 'private'}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};