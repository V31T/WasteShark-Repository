const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, loadApiRoutes } = require("../server");
const jwt = require('jsonwebtoken');
const User = require('../schemas/User');
const { connectMongo, disconnectMongo, getMongo } = require('./setup');

chai.use(chaiHttp);
const { expect } = chai;

before(async () => {
  await connectMongo(); // Will reuse the same server if already started
  loadApiRoutes(null);
});

after(async () => {
  disconnectMongo();
});

describe("User tests", () => {
  const testUser = {
    first_name: "cool",
    last_name: "person",
    email: "supercoolemail@email.com",
    password: "test123",
  };

  describe('POST /api/users/signup', () => {
    it('creates a new user (success)', async () => {
      const res = await chai
        .request(app)
        .post('/api/users/signup')
        .send(testUser);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });

    it('fails for duplicate email', async () => {
      const res = await chai
        .request(app)
        .post('/api/users/signup')
        .send(testUser);

      expect(res).to.have.status(409);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /api/users/login', () => {
    it('authenticates the user (success)', async function() {
      const res = await chai
        .request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');

      // Save refresh cookie for later
      this.refreshCookie = res.header['set-cookie'] && res.header['set-cookie'].find(c => c.startsWith('jwt='));
      expect(this.refreshCookie).to.exist;
    });

    it('fails with wrong password', async () => {
      const res = await chai
        .request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error');
    });

    it('fails with non-existent email', async () => {
      const res = await chai
        .request(app)
        .post('/api/users/login')
        .send({ email: 'notfound@example.com', password: 'irrelevant' });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /api/users/refresh', () => {
    it('returns new access token with valid cookie', async function() {
      // Login to get refresh cookie
      const loginRes = await chai
        .request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password });

      const refreshCookie = loginRes.header['set-cookie'] && loginRes.header['set-cookie'].find(c => c.startsWith('jwt='));
      expect(refreshCookie).to.exist;

      // Call refresh endpoint with cookie
      const res = await chai
        .request(app)
        .post('/api/users/refresh')
        .set('Cookie', refreshCookie)
        .send();

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });

    it('fails with no cookie', async () => {
      const res = await chai
        .request(app)
        .post('/api/users/refresh')
        .send();

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error');
    });

    it('fails with an expired refresh token', async function() {
      // Find the created user to build a refresh token payload
      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser).to.exist;

      // Create a refresh token that expires immediately
      const expiredToken = jwt.sign(
        { user_id: dbUser.user_id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1ms' }
      );

      // Wait briefly to ensure the token is expired
      await new Promise((r) => setTimeout(r, 20));

      const res = await chai
        .request(app)
        .post('/api/users/refresh')
        .set('Cookie', `jwt=${expiredToken}`)
        .send();

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message').that.includes('expired');
    });

    it('fails with an invalid refresh token', async () => {
      const invalidToken = 'this.is.an.invalid.token';

      const res = await chai
        .request(app)
        .post('/api/users/refresh')
        .set('Cookie', `jwt=${invalidToken}`)
        .send();

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message').that.includes('Invalid');
    });
  });

  describe('POST /api/users/logout', () => {
    it('clears cookie and returns 200 if cookie present', async function() {
      // Login to get refresh cookie
      const loginRes = await chai
        .request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password });

      const refreshCookie = loginRes.header['set-cookie'] && loginRes.header['set-cookie'].find(c => c.startsWith('jwt='));
      expect(refreshCookie).to.exist;

      // Call logout endpoint with cookie
      const res = await chai
        .request(app)
        .post('/api/users/logout')
        .set('Cookie', refreshCookie)
        .send();

      expect(res).to.have.status(200);
    });

    it('returns 204 if no cookie present', async () => {
      const res = await chai
        .request(app)
        .post('/api/users/logout')
        .send();

      expect(res).to.have.status(204);
    });
  });
});
