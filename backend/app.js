const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
require('dotenv').config();
const fsp = fs.promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { type, version } = require('os');
const {body, validationResult} = require ('express-validator');
const FileVersion = require('./models/models/fileversion');
const File = require('./models/models/File');
const authMiddleware = require('./middleware/auth');
const fileRoutes = require('./routes/file');
const mongoose = require('mongoose');
const { swaggerUi, specs } = require('./utils/swagger');
const users = [];
const User = require('./models/models/User');
const nodemailer = require('nodemailer');
const { sendResetEmail } = require('./utils/emailService');
const storageRoutes = require('./routes/storageRoutes');
const storageBreakdownRoutes = require('./routes/storageBreakdown');
const userRoutes = require('./routes/userRoutes');
const rateLimit = require('express-rate-limit');
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many uploads. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many login attempts. Please try again later.',
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

function sanitizeFilename(filename) {
    if (typeof filename !== 'string') return 'unnamed-upload';
    return filename.replace(/[\/\\]/g, '')
}

const santitizeFilename = (filename) => {
    return filename
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9.-_]/g, '_')
    .substring(0, 100);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const sanitized = santitizeFilename(file.originalname);
        cb(null, `${timestamp}-${file.originalname}`);
    }
});



app.use('/storage', storageBreakdownRoutes);
app.use('/user', userRoutes);

app.get("/files", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const files = await db.files.find().skip(offset).limit(limit);
    const total = await db.files.countDocuments();

    res.json({
      files,
      hasMore: offset + limit < total,
      nextOffset: offset + limit,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
});



const fileFilter =(req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'application/pdf',
         'text/plain',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type ${file.memetype} not allowed'), false);
    }
};

const upload = multer({
     storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024
    }
});

app.use('/storage', authMiddleware, storageRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Cloud Storage API is running!' });
});

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array().map(e => e.msg).join(', ')
    });
  }
  next();
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */


app.post('/register', authLimiter,
   [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),  
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { email, password, name, username } = req.body;
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
  name,
  email,
  username,
  password: hashedPassword,
  storageUsed: 0,
  storageLimit: 5 * 1024 * 1024 * 1024
});
await newUser.save();

const token = jwt.sign({ userId: newUser._id.toString(), email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.status(201).json({ message: 'User registered successfully', token, user: { id: newUser._id, email: newUser.email, name: newUser.name } });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Registration failed: ' + error.message }); 
    }
  }
);

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; 

    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await sendResetEmail(email, resetLink); 

    res.status(200).json({ message: 'Password reset link sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

app.post('/login', authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  }
);

app.post('/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) addToBlacklist(token);
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = app;

app.use('/file', fileRoutes);


app.use("/files", fileRoutes);


/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       401:
 *         description: Unauthorized
 */


app.post('/upload', authenticateToken, uploadLimiter, async (req, res) => {
  try {
    const busboy = Busboy({ headers: req.headers });
    let uploadedBytes = 0;
    const totalBytes = parseInt(req.headers['content-length'], 10);
    let fileMetaData = {};
    let fileReceived = false;


    busboy.on('file', (fieldname, file, info) => {
      fileReceived = true;
      
      
      const { filename, encoding, mimeType } = info;

      const sanitizedName = sanitizeFilename(filename || 'unnamed-upload');
      const savePath = path.join(__dirname, 'uploads', Date.now() + '-' + sanitizedName);
      const writeStream = fs.createWriteStream(savePath);

      fileMetaData = {
        fileName: sanitizedName,
        originalName: sanitizedName,
        path: savePath,
        mimetype: mimeType || 'application/octet-stream', 
        size: 0
      };

      file.on('data', (chunk) => {
        uploadedBytes += chunk.length;
        fileMetaData.size += chunk.length;
        const progress = Math.round((uploadedBytes / totalBytes) * 100);
        console.log(`Upload progress: ${progress}%`);
      });

      file.pipe(writeStream);

      file.on('end', () => {
        console.log(`File [${fieldname}] upload finished`);
      });
    });

  
    busboy.on('finish', async () => {
      if (!fileReceived || !fileMetaData.originalName || fileMetaData.size === 0) {
        return res.status(400).json({ error: 'No file uploaded or file was empty' });
      }

      const existingFiles = await File.findOne({
        originalName: fileMetaData.originalName,
        userId: req.user.userId,
        deleted: false
      });

      if (existingFiles && existingFiles.versioningEnabled) {
        await FileVersion.updateMany(
          { fileId: existingFiles._id, isCurrent: true },
          { isCurrent: false }
        );

        const newVersion = new FileVersion({
        fileId: existingFiles._id,
        versionNumber: existingFiles.latestVersionNumber + 1,
        fileName: fileMetaData.fileName,
        originalName: fileMetaData.originalName,
        size: fileMetaData.size,
        mimetype: fileMetaData.mimetype,
        path: fileMetaData.path,
        userId: req.user.userId,
        isCurrent: true
        });

        await newVersion.save();
        const user = await User.findById(req.user.userId);
        user.storageUsed += fileMetaData.size;
        await user.save();

        existingFiles.latestVersionNumber = newVersion.versionNumber;
        existingFiles.totalVersions += 1;
        existingFiles.fileName = fileMetaData.fileName;
        existingFiles.size = fileMetaData.size;
        existingFiles.path = fileMetaData.path;
        existingFiles.uploadDate = new Date();
        await existingFiles.save();

        return res.status(201).json({
          message: 'New version uploaded successfully!',
          file: {
            id: existingFiles._id,
            originalName: existingFiles.originalName,
            currentVersion: existingFiles.latestVersionNumber,
            totalVersions: existingFiles.totalVersions,
            size: existingFiles.size
          }
        });
      } else {
       const fileMeta = new File({
        fileName: fileMetaData.fileName,
        originalName: fileMetaData.originalName,
        fileSize: fileMetaData.size,
        mimetype: fileMetaData.mimetype,
        path: fileMetaData.path,
        userId: req.user.userId,
        uploadDate: new Date()
        });

        await fileMeta.save();

        const initialVersion = new FileVersion({
        fileId: fileMeta._id,
        versionNumber: 1,
        fileName: fileMetaData.fileName,
        originalName: fileMetaData.originalName,
        size: fileMetaData.size,
        mimetype: fileMetaData.mimetype,
        path: fileMetaData.path,
        userId: req.user.userId,
        isCurrent: true
        });

        await initialVersion.save();

        const user = await User.findById(req.user.userId);
        user.storageUsed += fileMetaData.size;
        await user.save();

        return res.status(201).json({
          message: 'File uploaded successfully!',
          file: {
            id: fileMeta._id,
            filename: fileMeta.fileName,
            originalName: fileMeta.originalName,
            currentVersion: 1,
            totalVersions: 1,
            size: fileMeta.size,
            uploadDate: fileMeta.uploadDate
          }
        });
      }
    });

    busboy.on('error', (err) => {
      console.error('Upload error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File upload failed', details: err.message });
      }
    });

    req.pipe(busboy);
  } catch (error) {
    console.error('Unexpected upload error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'File upload failed', details: error.message });
    }
  }
});

/**
 * @swagger
 * /files:
 *   get:
 *     summary: List all files for the authenticated user
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of files
 *       401:
 *         description: Unauthorized
 */

app.get('/files', authenticateToken, async (req, res) => {
    try {
        files.map(file => ({
            id: file._id,
            filename: file.fileName,
            originalName: file.originalName,
            isPublic: file.isPublic}));

        const directoryFiles = await fsp.readdir(uploadsDir);
        const userFiles = await File.find({ userId: req.user.userId, deleted: false })
            .select('filename originalName size uploadDate mimetype')
            .sort({ uploadDate: -1 });

            const files = rawFiles.map(file => ({
                 id: file._id,
                name: file.name || file.fileName || file.originalName,
                size: file.size || file.fileSize,
                uploadedAt: file.uploadedAt,
                type: file.type || file.mimetype,
                sharingStatus: file.sharingStatus || file.permissions?.view || 'private',
                versionCount: file.versions?.length || 1
            }));

        res.json({ totalFiles: userFiles.length, files: userFiles, directoryFiles });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve files', details: error.message });
    }
});


/**
 * @swagger
 * /download/{fileId}:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       401:
 *         description: Unauthorized
 */

app.get('/download/:fileId', authenticateToken, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.fileId,
            $or:[ { userId: req.user.userId }, { isPublic: true } ]
        });
        const fileId = req.params.fileId;
        const fileMetadata = await File.findOne({ _id: fileId, userId: req.user.userId });
        if (!fileMetadata) return res.status(404).json({ error: 'File not found or access denied' });

        const filePath = path.join(__dirname, 'uploads', fileMetadata.fileName);
        if (fs.existsSync(filePath)) {
            res.download(filePath, fileMetadata.originalName);
        } else {
            res.status(404).json({ error: 'File not found on server' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Download failed', details: error.message });
    }
});

/**
 * @swagger
 * /files/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */

app.delete('/files/:fileId', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const fileMeta = await File.findOne( 
            {
                _id: fileId, 
                userId: req.user.userId, 
                deleted: false
            });

        
        if (!fileMeta) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }
        fileMeta.deleted = true;
        fileMeta.deletedAt = new Date();
        await fileMeta.save();

          const user = await User.findById(req.user.userId);
            if (user) {
                user.storageUsed -= fileMeta.size || fileMeta.fileSize || 0; // depending on your schema field
            if (user.storageUsed < 0) user.storageUsed = 0; // safety check
                await user.save();
            }

        fileMeta.deleted = true;
        fileMeta.deletedAt = new Date();
        await fileMeta.save();

        res.json({ message: 'File moved to trash successfully', filename: fileMeta.originalName, deletedAt: fileMeta.deletedAt, originalName: fileMeta.originalName });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed', details: error.message });
    }
});

const { nanoid } = require('nanoid');

/**
 * @swagger
 * /share/{fileId}:
 *   post:
 *     summary: Share a file
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share link created
 *       404:
 *         description: File not found
 */

app.post('/share/:fileId', authenticateToken, async (req, res) => {
    try {   
        const file = await File.findOne({ _id: req.params.fileId, userId: req.user.userId });
        if (!file) return res.status(404).json({ error: 'File not found or access denied' });

        file.sharedId = file.sharedId || nanoid(12);
        file.isPublic = true;
        await file.save();

        const shareURL = `${req.protocol}://${req.get('host')}/shared/${file.sharedId}`;
        res.json({shareUrl : shareURL});
    } catch (error) {
        res.status(500).json({ error: 'Failed to create shareable link', details: error.message });
    }
});

app.get('/shared/:shareId', async (req, res) => {
    try {
        const file = await File.findOne({ sharedId: req.params.shareId, isPublic: true });
        if (!file) return res.status(404).json({ error: 'Shared file not found or access denied'});

        const filePath = path.join(__dirname, 'uploads', file.fileName);
        res.download(filePath, file.originalName);
    } catch (error) {
        res.status(500).json({ error: 'Download Failed', details: error.message });
    }
});

app.get('/shared/:shareId/info', async (req, res) => {
  try {
    const file = await File.findOne({ sharedId: req.params.shareId, isPublic: true });
    if (!file) return res.status(404).json({ error: 'Shared file not found or access denied' });

    res.json({
      name: file.originalName,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploadedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file info', details: error.message });
  }
});


/**
 * @swagger
 * /unshare/{fileId}:
 *   post:
 *     summary: Unshare a file
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File unshared successfully
 *       404:
 *         description: File not found or access denied
 */


app.post('/unshare/:fileId', authenticateToken, async (req, res) => {

    const file  = await File.findOne({ _id: req.params.fileId, userId: req.user.userId });
    if (!file) return res.status(404).json({ error: 'File not found or access denied' });

    file.sharedId = undefined;
    file.isPublic = false;
    await file.save();

    res.json({ message: 'File sharing disabled' });
});

app.get('/trash', authenticateToken, async (req, res) => {
    try {
        const trashedFiles = await File.find({ userId: req.user.userId, deleted: true })
            .select('filename originalName size deletedAt uploadDate mimetype')
            .sort({ deletedAt: -1 });

        res.json({ totalFiles: trashedFiles.length, files: trashedFiles });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve trashed files', details: error.message });
    }
});

app.post('/restore/:fileId', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.fileId;

        const fileMeta = await File.findOneAndUpdate(
            { _id: fileId, userId: req.user.userId, deleted: true },
            { deleted: false, deletedAt: null },
            { new: true }
        );
        if (!fileMeta) return res.status(404).json({ error: 'File not found in trash or access denied' });
    
    res.json({ message: 'File restored successfully', filename: fileMeta.originalName, originalName: fileMeta.originalName,  });
} catch (error) {
    res.status(500).json({ error: 'Restore failed', details: error.message });
}
});

app.delete('/trash/:fileId', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const fileMeta = await File.findOneAndDelete({
      _id: fileId,
      userId: req.user.userId,
      deleted: true
    });

    if (!fileMeta) {
      return res.status(404).json({ error: 'File not found in trash or access denied' });
    }

  
    const filePath = path.join(__dirname, 'uploads', fileMeta.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

   
    const user = await User.findById(req.user.userId);
    if (user) {
      user.storageUsed -= fileMeta.size || fileMeta.fileSize || 0; 
      if (user.storageUsed < 0) user.storageUsed = 0; 
      await user.save();
    }

    res.json({
      message: 'File permanently deleted',
      filename: fileMeta.originalName
    });
  } catch (error) {
    res.status(500).json({ error: 'Permanent delete failed', details: error.message });
  }
});


app.delete('/trash', authenticateToken, async (req, res) => {
  try {
    const trashedFiles = await File.find({ userId: req.user.userId, deleted: true });

    if (!trashedFiles || trashedFiles.length === 0) {
      return res.json({ message: 'Trash is already empty', deletedFiles: 0 });
    }

    let deletedCount = 0;
    let totalFreed = 0;

    for (const fileMeta of trashedFiles) {
      const filePath = path.join(__dirname, 'uploads', fileMeta.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      
      totalFreed += fileMeta.size || fileMeta.fileSize || 0;

      await File.findByIdAndDelete(fileMeta._id);
      deletedCount++;
    }

    
    const user = await User.findById(req.user.userId);
    if (user) {
      user.storageUsed -= totalFreed;
      if (user.storageUsed < 0) user.storageUsed = 0;
      await user.save();
    }

    res.json({
      message: 'Trash emptied successfully',
      deletedFiles: deletedCount,
      freedSpace: totalFreed
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to empty trash', details: error.message });
  }
});
;

app.post('/permissions/:fileId', authenticateToken, async (req, res) => {
    try {
        const { isPublic } = req.body;
        const file = await File.findOne({ _id: req.params.fileId, userId: req.user.userId });

        if (!file){return res.status(404).json({ error: 'File not found or access denied' });
    }
        file.isPublic = isPublic;
        await file.save();
        res.json({
            message: `File visibility set to ${isPublic ? 'public' : 'private'}`,
            fileId: file._id,
            isPublic: file.isPublic
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update file permissions', details: error.message });
    }
});


/**
 * @swagger
 * /files/{fileId}/versions:
 *   get:
 *     summary: Get all versions of a file
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all versions
 *       404:
 *         description: File not found
 */

app.get('/files/:fileId/versions', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const file = await File.findOne({ _id: fileId, userId: req.user.userId });
        if (!file){
     return res.status(404).json({ error: 'File not found or access denied' });
    }

        const versions = await FileVersion.find({ fileId: fileId })
            .select('versionNumber fileName originalName size mimetype uploadDate isCurrent')
            .sort({ versionNumber: -1 });

            res.json({
                file: {
                    id: file._id,
                    originalName: file.originalName,
                    currentVersion: file.currentVersion,
                    totalVersions: file.totalVersions
                },
                versions:  versions
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve file versions', details: error.message});

    }
    });

    app.get('/versions/:fileId', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const file = await File.findOne({ _id: fileId, userId: req.user.userId });
        if (!file) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }
        const versions = await  FileVersion.find({ fileId}).sort({ versionNumber: -1 });
        res.json({
            fileId,
            versions: versions.map(v => ({
                version: v.versionNumber,
                timestamp: v.createdAt,
                size: v.size,
                originalName: v.originalName,
                isCurrent: v.isCurrent
            }))
        });
    } catch (error) {   
        res.status(500).json({ error: 'Failed to retrieve version history', details: error.message });
    }
});
        

    app.get('/files/:fileId/versions/:versionNumber', authenticateToken, async (req, res) => {
        try {
            const fileId = req.params.fileId;
            const versionNumber = parseInt(req.params.versionNumber);

            const file = await File.findOne({ _id: fileId, userId: req.user.userId });
            if (!file) {
                return res.status(404).json({ error: 'File not found or access denied' });
            }
            const version = await FileVersion.findOne({ fileId: fileId, versionNumber: versionNumber });
            if (!version) {
                return res.status(404).json({ error: 'File version not found' });
            }
            const filePath = path.join(__dirname, 'uploads', version.fileName);
            if (fs.existsSync(filePath)) {
                res.download(filePath, `${file.originalName}(v${versionNumber})`);
            } else {
                res.status(404).json({ error: 'File not found on server' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Download failed', details: error.message });
        }
    });

    /**
 * @swagger
 * /files/{fileId}/versions/{versionNumber}/restore:
 *   post:
 *     summary: Restore a specific version of a file
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: versionNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File version restored successfully
 *       404:
 *         description: File or version not found
 */

    app.post('/files/:fileId/versions/:versionNumber/restore', authenticateToken, async (req, res) => {
        try {
            const fileId = req.params.fileId;
            const versionNumber = parseInt(req.params.versionNumber);   
            const file = await File.findOne({ _id: fileId, userId: req.user.userId });
            if (!file) {
                return res.status(404).json({ error: 'File not found or access denied' });
            }

            const versionToRestore = await FileVersion.findOne({ fileId: fileId, versionNumber: versionNumber });

            if (!versionToRestore) {
                return res.status(404).json({ error: 'File version not found' });
            }

            await FileVersion.updateMany(
                {fileId: fileId},
                { isCurrent: false }
            );

            versionToRestore.isCurrent = true;
            await versionToRestore.save();  

            file.currentVersion = versionToRestore.versionNumber;
            file.fileName = versionToRestore.fileName;
            file.size = versionToRestore.size;
            file.mimetype = versionToRestore.mimetype;
            file.path = versionToRestore.path;
            file.uploadDate = new Date();
            await file.save();

            res.json({ message: `File restored to version ${versionNumber} successfully`,
                file: {
                    id: file._id,
                    originalName: file.originalName,
                    currentVersion: file.currentVersion,
                     restoredForm: versionNumber
                    }
                });
        } catch (error) {
            res.status(500).json({ error: 'Failed to restore file version', details: error.message });
        }
    });

    app.delete('/files/:fileId/versions/:versionNumber', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const versionNumber = parseInt(req.params.versionNumber);

    const file = await File.findOne({ _id: fileId, userId: req.user.userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    if (versionNumber === file.currentVersion) {
      return res.status(400).json({ error: 'Cannot delete the current version of the file' });
    }

    const version = await FileVersion.findOne({
      fileId: fileId,
      versionNumber: versionNumber    
    });

    if (!version) {
      return res.status(404).json({ error: 'File version not found' });
    }

   
    const filePath = path.join(__dirname, 'uploads', version.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    
    await FileVersion.findByIdAndDelete(version._id);


    file.totalVersions -= 1;
    await file.save();

    const user = await User.findById(req.user.userId);
    if (user) {
      user.storageUsed -= version.size || 0; 
      if (user.storageUsed < 0) user.storageUsed = 0; 
      await user.save();
    }

    res.json({
      message: `Version ${versionNumber} deleted successfully`,
      deletedVersion: versionNumber
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file version', details: error.message });
  }
});


    app.patch('/files/:fileId/versioning', authenticateToken, async (req, res) => {
        try {
            const fileId = req.params.fileId;
            const { enabled } = req.body;

            if (typeof enabled !== 'boolean') {
                return res.status(400).json({ error: 'Invalid value for versioning enabled' });
            }

            const file = await File.findOneAndUpdate(
                { _id: fileId, userId: req.user.userId },
                { versioningEnabled: enabled },
                { new: true }
            );

            if (!file) {
                return res.status(404).json({ error: 'File not found or access denied' });
            }

            res.json({
                message: `Versioning ${enabled ? 'enabled' : 'disabled'}`,
                file: {
                    id: file._id,
                    originalName: file.originalName,
                    versioningEnabled: file.versioningEnabled
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update versioning setting', details: error.message });
        }
    });

    app.get('/files/search', authenticateToken, async (req, res) => {
        try {
            const{
                q,
                type,
                mimetype,
                minSize,
                maxSize,
                startDate,
                endDate,
                sort,
                order
            } = req.query;

            const query = { userId: req.user.userId, deleted: false };

            if (q) {
                query.originalName = { $regex: q, $options: 'i' };  
            }

            if (type) {
                const typeMap = {
                    'image': /^image\//,
                    'pdf': /^application\/pdf$/,
                    'document': /^(application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
                    'spreadsheet': /^(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
                    'text': /^text\//,
                    'video': /^video\//,
                    'audio': /^audio\//

                };

                if (typeMap[type]) {
                    query.mimetype = { $regex: typeMap[type] };
                }
            }

            if (mimetype) {
                query.mimetype = mimetype;
            }

            if (minSize || maxSize) {
                query.fileSize = {};
                if (minSize) query.fileSize.$gte = parseInt(minSize);
                if (maxSize) query.fileSize.$lte = parseInt(maxSize);
            }

            if (startDate || endDate) {
                query.uploadDate = {};
                if (startDate) query.uploadDate.$gte = new Date(startDate);
                if (endDate) query.uploadDate.$lte = new Date(endDate);
            }

            let sortOption = {};
            if (sort) {
                const sortField = ({
                      name : 'originalName',
                      size : 'fileSize',
                      date : 'uploadDate'
                })[sort] || 'uploadDate';

                const sortOrder = order === 'asc' ? 1 : -1;
                sortOption[sortField] = sortOrder;
            } else {
                sortOption.uploadDate = -1; 
            }

            const files = await File.find(query)
                .select('filename originalName size uploadDate mimetype currentVersion totalVersions')
                .sort(sortOption);

                res.json({
                    query: req.query,
                    totalResults: files.length,
                    files: files
                });
        } catch (error) {
            res.status(500).json({ error: 'Search failed', details: error.message });
        }

    });


    app.get('/files/search/advanced', authenticateToken, async (req, res) => {
        try {
            const {
                q,
                type,
                mimetype,
                minSize,
                maxSize,
                startDate,
                endDate,
                sort,
                order,
                page = 1,
                limit = 20
            } = req.query;

            const query = { userId: req.user.userId, deleted: false };

            if (q) {
                query.originalName = { $regex: q, $options: 'i' };
            }

            if (type) {
                const typeMap = {
                    'image': /^image\//,
                    'pdf': /^application\/pdf$/,
                    'document': /^(application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
                    'spreadsheet': /^(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
                    'text': /^text\//,
                    'video': /^video\//,
                    'audio': /^audio\//
                };

                if (typeMap[type]) {
                    query.mimetype = { $regex: typeMap[type] };
                }
            }

            if (mimetype) {
                query.mimetype = mimetype;
            }

            if (minSize || maxSize) {
                query.fileSize = {};
                if (minSize) query.fileSize.$gte = parseInt(minSize);
                if (maxSize) query.fileSize.$lte = parseInt(maxSize);
            }
            if (startDate || endDate) {
                query.uploadDate = {};
                if (startDate) query.uploadDate.$gte = new Date(startDate);
                if (endDate) query.uploadDate.$lte = new Date(endDate);
            }

            let sortOption = {};
            if (sort) {
                const sortField = ({
                    name: 'originalName',
                    size: 'fileSize',
                    date: 'uploadDate'
                })[sort] || 'uploadDate';

                const sortOrder = order === 'asc' ? 1 : -1;
                sortOption[sortField] = sortOrder;
            } else {
                sortOption.uploadDate = -1;
            }

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            const totalResults = await File.countDocuments(query);

            const files = await File.find(query)
                .select('filename originalName size uploadDate mimetype currentVersion totalVersions')
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum);

            res.json({
                query: req.query,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalResults / limitNum),
                    totalResults: totalResults,
                    resultsPerPage: limitNum,
                    hasNextPage: pageNum < Math.ceil(totalResults / limitNum),
                    hasPrevPage: pageNum > 1
                },
                files: files
            });
        } catch (error) {
            res.status(500).json({ error: 'Advanced search failed', details: error.message });
        }
    });

    app.get('/files/filter/:filterType', authenticateToken, async (req, res) => {
        try {
            const { filterType } = req.params;
            const query = { userId: req.user.userId, deleted: false };

            switch (filterType) {
                case 'recent':
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    query.uploadDate = { $gte: sevenDaysAgo };
                    break;

                    case 'images':
                    query.mimetype = { $regex: /^image\// };
                    break;

                case 'documents':
                    query.mimetype = { $regex: /^(application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/pdf|text\/plain)$/ };
                    break;

                case 'large':
                    query.fileSize = { $gte: 5 * 1024 * 1024 };
                    break;

                    case 'small':
                    query.fileSize = { $lte: 1024 * 1024 };
                    break;

                    case 'shared':
                        query.shareId = { $exists: true, $ne: null };
                        break;

                        case 'versioned':
                            query.totalVersions = { $gt: 1 };
                            break;

                default:
                    return res.status(400).json({ error: 'Invalid filter type' });
            }

            const files = await File.find(query)
                .select('filename originalName size uploadDate mimetype currentVersion totalVersions')
                .sort({ uploadDate: -1 });

            res.json({
                filter: filterType,
                totalResults: files.length,
                files: files
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to filter files', details: error.message });
        }
    });

    app.get('/files/suggestions', authenticateToken, async (req, res) => {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.status(400).json({ error: 'Query too short for suggestions' });
            }

            const suggestions = await File.find({
                userId: req.user.userId,
                deleted: false,
                originalName: { $regex: q, $options: 'i' }
            })
            .select('originalName')
            .limit(10)
            .lean();

            const uniqueNames = [...new Set(suggestions.map(s => s.originalName))];

            res.json({ query: q, suggestions: uniqueNames });
        } catch (error) {
            res.status(500).json({ error: 'Suggestions Failed', details: error.message });
        }
    });

    
    app.post('/files/bulk/delete', authenticateToken, async (req, res) => {
    try {
        const { fileIds } = req.body;
        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ error: 'No file IDs provided for bulk delete' });
        }

        if (fileIds.length > 100) {
            return res.status(400).json({ error: 'Maximum of 100 files can be deleted at once' });
        }

        const result = await File.updateMany(
            { _id: { $in: fileIds },
                userId: req.user.userId,
                deleted: false 
        },
        { $set:{
        
            deleted: true,
            deletedAt: new Date()
        }
    }
        );

        res.json({
            message: 'Bulk delete successful',
            deletedCount: result.nModified || result.modifiedCount,
            requestedCount: fileIds.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Bulk delete failed', details: error.message });
    }
});
        app.post('/files/bulk/restore', authenticateToken, async (req, res) => {
    try {
        const { fileIds } = req.body;
        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ error: 'No file IDs provided for bulk restore' });
        }

        if (fileIds.length > 100) {
            return res.status(400).json({ error: 'Maximum of 100 files can be restored at once' });
        }

        const result = await File.updateMany(
            { _id: { $in: fileIds },
                userId: req.user.userId,
                deleted: true
            },
            {
                deleted: false,
                deletedAt: null
            }
        );
        res.json({
            message: 'Bulk restore successful',
            restoredCount: result.nModified || result.modifiedCount,
            requestedCount: fileIds.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Bulk restore failed', details: error.message });
    }
});

app.post('/files/bulk/permanent-delete', authenticateToken, async (req, res) => {
    try {
        const { fileIds } = req.body;
        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ error: 'No file IDs provided for bulk permanent delete' });
        }

        if (fileIds.length > 100) {
            return res.status(400).json({ error: 'Maximum of 100 files can be permanently deleted at once' });
        }

        const files = await File.find({
            _id: { $in: fileIds },
            userId: req.user.userId,
            deleted: true
        });

        let deletedCount = 0;
        let errors = [];

        for (const file of files) {
         try{
            const filePath = path.join(__dirname, 'uploads', file.fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            const versions = await FileVersion.find({ fileId: file._id});
            for (const version of versions){
                const versionPath = path.join(__dirname, 'uploads', version.filename);
                if (fs.existsSync(versionPath)){
                    fs.unlinkSync(versionPath);
                }
            

            await FileVersion.findByIdAndDelete(version._id);
        }
        
        await File.findByIdAndDelete(file._id);
            deletedCount++;
        } catch (err) {
            errors.push({ fileId: file._id, error: error.message });
        }
    }

        res.json({
            message: 'Bulk permanent delete completed',
            deletedCount: deletedCount,
            requestedCount: fileIds.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        res.status(500).json({ error: 'Bulk permanent delete failed', details: error.message });
    }
});

const archiver = require ('archiver');

app.post('/files/bulk/download', authenticateToken, async (req, res) =>{
    try {
        const {fileIds} = req.body;

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length ===0){
         return res.status(400).json({ error: 'No file IDs provided for bulk download'});   
        }

        if (fileIds.length > 50){
            return res.status(400).json({ error: 'Too many files requested for bulk download. Maximum is 50.'});
        }

        const files = await File.find ({
            _id: { $in: fileIds },
            userId: req.user.userId,
            deleted: false
        });

        if (files.length === 0){
            return res.status(404).json({ error: 'No files found for bulk download'});
        }

        res.setHeader('Content-Type', 'application/zip')
        res.setHeader('Content-Disposition', `attachment; filename="files-${Date.now()}.zip"`);

    
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(res);

        for (const file of files){
            if (!file.filename){
                console.warn('Missing filename for file ID: ${file._id}');
                continue;
            }
            const filePath = path.join(__dirname, 'uploads', file.filename);
            if (fs.existsSync(filePath)){
                archive.file(filePath, { name: file.originalName });
            }
        }

        await archive.finalize();
    } catch (error) {
        res.status(500).json({ error: 'Bulk download failed', details: error.message });
    }
});

app.post('/files/bulk/share', authenticateToken, async (req, res) => {
    try {
        const {fileIds} = req.body;

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0){
            return res.status(400).json({ error: 'Invalid fileIds' });
        }

        if (fileIds.length > 100){
            return res.status(400).json({ error: 'Maximum 100 files can be shared at once' });
        }

        const files = await File.find({
            _id: {$in: fileIds},
            userId: req.user.userId,
            deleted: false
        });

        const sharedFiles = [];
        const errors = [];

        for (const file of files) {
            try{
                if(!file.shareId){
                    const crypto = require ('crypto');
                    file.shareId = crypto.randomBytes(16).toString('hex');
                    file.isPublic = true;
                    await file.save();
                }
                sharedFiles.push({
                    fileId: file._id,
                    originalName: file.originalName,
                    shareLink: `${req.protocol}://${req.get('host')}/shared/${file.shareId}`
                });
            } catch (error) {
                errors.push({ fileId: file._id, error: error.message});
            }
        }
        
        res.json({
            message: 'Bulk share completed',
            sharedCount: sharedFiles.length,
            requestedCount: fileIds.length,
            sharedFiles: sharedFiles,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({error: 'Bulk share failed', details: error.message});
    }
});

app.post('/files/bulk/unshare', authenticateToken, async (req, res) => {
    try{
        const {fileIds} = req.body;

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({error: 'Invalid fileIds'});
        }     
        
        if (fileIds.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 files can be unshared at once'});
        }

        const result = await File.updateMany(
            {
            _id: { $in: fileIds },
            userId: req.user.userId
    },
    {
        shareId: null
    }
);

res.json({
    message: 'Share links revoked',
    unsharedCount: result.modifiedCount,
    requestCount: fileIds.length
});
    } catch (error){
        res.status(500).json({error: 'Bulk unshare failed', details: error.message});
    }
});

app.patch('/files/bulk/update', authenticateToken, async (req, res) => {
    try {
        const { fileIds, updates } = req.body;

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ error: 'Invalid fileIds' });
        }

        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'Invalid updates'});
        }

        if (fileIds.length > 100){
            return res.status(400).json({ error: 'Maximum 100 files  can be updated at once'});
        }

        const allowedUpdates = {};
        if (updates.description !== undefined) allowedUpdates.description = updates.description;
        if (updates.versioningEnabled !== undefined) allowedUpdates.versioningEnabled = updates.versioningEnabled;

        if (Object.keys(allowedUpdates).length ===0) {
            return res.status(400).json({ error: 'No valid updates provided'});
        }

        const result = await File.updateMany(
            {
                _id: { $in: fileIds },
                userId: req.user.userId,
                deleted: false
            },
            allowedUpdates
        );

        res.json({
            message:'Files updated successfully',
            updatedCount: result.modifiedCount,
            requestedCount: fileIds.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Bulk update failed', details: error.message});
    }
});

app.post('/files/bulk/status', authenticateToken, async (req, res) => {
    try {
        const {fileIds} = req.body;

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0){
            return res.status(400).json({ error: 'Invalid fileIds' });
        }

        if (fileIds.length > 100){
            return res.status(400).json({ error: 'Maximum 100 files can be queried at once' });
        }

        const files = await File.find({
            _id: {$in: fileIds},
            userId: req.user.userId,
        }).select('_id originalName deleted shareId versioningEnabled currentVersion totalVersions size uploadDate');

        const stats = {
            totalFiles: files.length,
            activeFiles: files.filter(f => !f.deleted).length,
            deletedFiles: files.filter(f => f.deleted).length,
            sharedFiles: files.filter(f => f.shareId).length,
            versionedFiles: files.filter(f => f.totalVersions > 1).length,
            totalSize: files.reduce((sum, f) => sum + f.size, 0),
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Bulk status failed', details: error.message});
    }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/files/:id", asyncHandler(async (req, res) => {
  const file = await db.files.findById(req.params.id);
  if (!file) return res.status(404).json({ error: "File not found" });
  res.json(file);
}));

app.get("/storage/cleanup", async (req, res) => {
  try {
    const suggestions = await getCleanupSuggestions();
    res.json(suggestions);
  } catch {
    res.json([]); 
  }
});

app.post("/files/:id/restore", async (req, res) => {
  const { requestId } = req.body;
  const fileId = req.params.id;

  
  const existing = await db.requests.findOne({ requestId });
  if (existing) return res.json({ status: "already processed" });

  await db.files.updateOne({ _id: fileId }, { $set: { deleted: false } });
  await db.requests.insertOne({ requestId, fileId });

  res.json({ status: "restored" });
});

app.get('/storage/usage', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const files = await File.find({ userId: req.user.userId, deleted: false });
    
    const storageLimit = user.storageLimit || 5 * 1024 * 1024 * 1024;
    const storageUsed = user.storageUsed || 0;
    const percentage = (storageUsed / storageLimit) * 100;

    const breakdown = {};
    files.forEach(file => {
      const type = file.mimetype?.split('/')[0] || 'other';
      breakdown[type] = (breakdown[type] || 0) + (file.fileSize || file.size || 0);
    });

    res.json({
      used: storageUsed,
      limit: storageLimit,
      percentage: percentage,
      breakdown: breakdown
    });
  } catch (error) {
    console.error('Storage usage error:', error);
    res.status(500).json({ error: 'Failed to fetch storage usage' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;


