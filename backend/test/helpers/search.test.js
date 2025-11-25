const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const app = require('../../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./helpers/testSetup');

describe('File Search Tests', () => {
  let authToken;

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

  beforeEach(async () => {
 
    const registerRes = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    authToken = registerRes.body.token;

  
    const file1Path = path.join(__dirname, 'report.txt');
    const file2Path = path.join(__dirname, 'photo.txt');
    const file3Path = path.join(__dirname, 'document.txt');

    fs.writeFileSync(file1Path, 'Report content');
    fs.writeFileSync(file2Path, 'Photo content');
    fs.writeFileSync(file3Path, 'Document content');

    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', file1Path);

    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', file2Path);

    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', file3Path);

    fs.unlinkSync(file1Path);
    fs.unlinkSync(file2Path);
    fs.unlinkSync(file3Path);
  });

  describe('GET /files/search', () => {
    
    it('should search files by name', async () => {
      const res = await request(app)
        .get('/files/search?q=report')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.totalResults).to.equal(1);
      expect(res.body.files[0].originalName).to.equal('report.txt');
    });

    it('should return all files with empty query', async () => {
      const res = await request(app)
        .get('/files/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.totalResults).to.equal(3);
    });

    it('should return empty results for no match', async () => {
      const res = await request(app)
        .get('/files/search?q=nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.totalResults).to.equal(0);
      expect(res.body.files).to.be.an('array').that.is.empty;
    });

    it('should be case-insensitive', async () => {
      const res = await request(app)
        .get('/files/search?q=REPORT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.totalResults).to.equal(1);
      expect(res.body.files[0].originalName).to.equal('report.txt');
    });

  });

  describe('GET /files/filter/:filterType', () => {
    
    it('should filter recent files', async () => {
      const res = await request(app)
        .get('/files/filter/recent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.totalResults).to.equal(3);
    });

    it('should return error for invalid filter', async () => {
      const res = await request(app)
        .get('/files/filter/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Invalid filter type');
    });

  });

});