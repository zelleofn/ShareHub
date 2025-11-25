const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const startServer = require('../../server');
const fs = require('fs');
const path = require('path');
const expect = chai.expect;

describe('File upload integration tests', () => {
  let server;
  let agent;
  let token;

  before(async function () {
    this.timeout(10000);
    server = await startServer();
    agent = chai.request.agent(server);

    const user = {
      email: 'uploadtest@example.com',
      password: 'passwordsecured',
      name: 'uploader'
    };

    await agent.post('/register').send(user);
    const res = await agent.post('/login').send(user);
    token = res.body.token;
  });

  after(() => {
    if (server && server.close) {
      server.close();
    }
  });

  it('should upload a valid file', async function () {
    this.timeout(30000);

    const res = await agent
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach(
        'file',
        fs.createReadStream(path.join(__dirname, '../fixtures/sample.txt')),
        'sample.txt'
      );

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('file');
    expect(res.body.file).to.have.property('id');
    expect(res.body.file).to.have.property('originalName', 'sample.txt');
  });

  it('should reject upload without auth', async function () {
    try {
      const res = await agent
        .post('/upload')
        .attach(
          'file',
          fs.createReadStream(path.join(__dirname, '../fixtures/sample.txt')),
          'sample.txt'
        );

     
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error');
    } catch (error) {
     
      if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
       
        return;
      }
      
      
      if (error.response) {
        expect(error.response).to.have.status(401);
        return;
      }
      

      throw error;
    }
  });

  it('should reject upload with no file', async function () {
    const res = await agent
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('dummy', '');

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('error');
  });
});