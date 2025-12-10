const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: Number,
  path: String,
  uploadDate: Date,
  size: Number
}, { _id: false });

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required.'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    default: 'application/octet-stream'
  },
  path: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  s3Key: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  sharedId: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  permissions: {
    type: Object,
    default: { view: 'private' }
  },
  sharingStatus: {
    type: String,
    default: 'private'
  },
  versions: [versionSchema],
  currentVersion: {
    type: Number,
    default: 1
  },
  totalVersions: {
    type: Number,
    default: 1
  },
  latestVersionNumber: {
    type: Number,
    default: 1
  },
  versioningEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);