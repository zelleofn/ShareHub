const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./helpers/testSetup');

describe('File Operations Tests', () => {
  let authToken;
  let userId;

  before(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
    
    
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }
  });

  after(async () => {
    await closeTestDB();
  });

  
  const loginUser = async () => {
    const registerRes = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  };

  describe('POST /upload', () => {
    
    beforeEach(async () => {
      await loginUser();
    });

    it('should upload a file successfully', async () => {
      
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const res = await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('uploaded successfully');
      expect(res.body.file).to.have.property('id');
      expect(res.body.file).to.have.property('originalName');
      expect(res.body.file.originalName).to.equal('test-file.txt');

      
      fs.unlinkSync(testFilePath);
    });

    it('should return error without authentication', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const res = await request(app)
        .post('/upload')
        .attach('file', testFilePath);

      expect(res.status).to.equal(401);
      expect(res.body.error).to.include('Access denied');

      fs.unlinkSync(testFilePath);
    });

    it('should return error if no file provided', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('No file uploaded');
    });

  });

  describe('GET /files', () => {
    
    beforeEach(async () => {
      await loginUser();
    });

    it('should list user files', async () => {
     
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

   
      const res = await request(app)
        .get('/files')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('totalFiles');
      expect(res.body.totalFiles).to.equal(1);
      expect(res.body.files).to.be.an('array');
      expect(res.body.files[0].originalName).to.equal('test-file.txt');

      fs.unlinkSync(testFilePath);
    });

    it('should return empty list for new user', async () => {
      const res = await request(app)
        .get('/files')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.totalFiles).to.equal(0);
      expect(res.body.files).to.be.an('array').that.is.empty;
    });

    it('should return error without authentication', async () => {
      const res = await request(app)
        .get('/files');

      expect(res.status).to.equal(401);
      expect(res.body.error).to.include('Access denied');
    });

  });

  describe('DELETE /files/:fileId', () => {
    
    beforeEach(async () => {
      await loginUser();
    });

    it('should move file to trash', async () => {
      
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const uploadRes = await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      const fileId = uploadRes.body.file.id;


      const res = await request(app)
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('moved to trash');

    
      const filesRes = await request(app)
        .get('/files')
        .set('Authorization', `Bearer ${authToken}`);

      expect(filesRes.body.totalFiles).to.equal(0);

      fs.unlinkSync(testFilePath);
    });

    it('should return error for non-existent file', async () => {
      const res = await request(app)
        .delete('/files/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body.error).to.include('not found');
    });

  });

});