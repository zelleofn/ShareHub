const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./helpers/testSetup');

describe('Bulk Operations Tests', () => {
  let authToken;
  let fileIds = [];

  before(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
    fileIds = [];
    

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

  beforeEach(async () => {

    const registerRes = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    authToken = registerRes.body.token;

   
    for (let i = 1; i <= 3; i++) {
      const filePath = path.join(__dirname, `test-file-${i}.txt`);
      fs.writeFileSync(filePath, `Test content ${i}`);

      const uploadRes = await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', filePath);

      fileIds.push(uploadRes.body.file.id);
      fs.unlinkSync(filePath);
    }
  });

  describe('POST /files/bulk/delete', () => {
    
    it('should delete multiple files', async () => {
      const res = await request(app)
        .post('/files/bulk/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds: fileIds });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('moved to trash');
      expect(res.body.deletedCount).to.equal(3);
      expect(res.body.requestedCount).to.equal(3);
    });

    it('should return error with empty array', async () => {
      const res = await request(app)
        .post('/files/bulk/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds: [] });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('non-empty array');
    });

    it('should return error without fileIds', async () => {
      const res = await request(app)
        .post('/files/bulk/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('non-empty array');
    });

    it('should enforce maximum limit', async () => {
      const tooManyIds = new Array(101).fill('507f1f77bcf86cd799439011');
      
      const res = await request(app)
        .post('/files/bulk/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds: tooManyIds });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Maximum 100');
    });

  });

  describe('POST /files/bulk/restore', () => {
    
    it('should restore multiple files', async () => {
      
      await request(app)
        .post('/files/bulk/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds: fileIds });

   
      const res = await request(app)
        .post('/files/bulk/restore')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds: fileIds });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('restored successfully');
      expect(res.body.restoredCount).to.equal(3);
    });

  });

  describe('POST /files/bulk/status', () => {
    
    it('should return status of multiple files', async () => {
      const res = await request(app)
        .post('/files/bulk/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds: fileIds });

      expect(res.status).to.equal(200);
      expect(res.body.totalFiles).to.equal(3);
      expect(res.body.activeFiles).to.equal(3);
      expect(res.body.deletedFiles).to.equal(0);
      expect(res.body).to.have.property('totalSize');
    });

  });

});