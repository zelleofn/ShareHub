const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./testSetup');


describe('Authentication Tests', () => {
  
  before(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  
  after(async () => {
    await closeTestDB();
  });

  describe('POST /register', () => {
    
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user.email).to.equal('test@example.com');
      expect(res.body.user.name).to.equal('Test User');
      expect(res.body.user).to.not.have.property('password');
    });

    it('should return error if email is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          password: 'password123',
          name: 'Test User'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should return error if password is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          name: 'Test User'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should return error if name is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should return error if user already exists', async () => {
     
      await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password456',
          name: 'Another User'
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('already exists');
    });

  });

  describe('POST /login', () => {
    
    it('should login with valid credentials', async () => {
     
      await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.message).to.equal('Login successful');
    });

    it('should return error with invalid email', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.include('Invalid email or password');
    });

    it('should return error with wrong password', async () => {
    
      await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.include('Invalid email or password');
    });

    it('should return error if email is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          password: 'password123'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should return error if password is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

  });

});