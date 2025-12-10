const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    maxlength: 30
  },

  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },

  resetToken: {
    type: String,
    default: null
  },

  resetTokenExpiry: {
    type: Date,
    default: null
  },

  storageUsed: {
    type: Number,
    default: 0
  },

  
storageLimit: { 
  type: Number, 
  default: 1024 * 1024 * 1024 * 1024 
},

  profilePicture: {
    type: String,
    default: null
  },

  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },

  language: {
    type: String,
    default: 'en'
  },

  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },

  notificationsEnabled: {
    type: Boolean,
    default: true
  },

  defaultFilePrivacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },

  versioningEnabled: {
    type: Boolean,
    default: true
  },

  fileVersioningEnabled: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
