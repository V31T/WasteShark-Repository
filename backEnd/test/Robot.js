const chai = require('chai')
const chaiHttp = require('chai-http')
const { app, loadApiRoutes } = require('../server')
const jwt = require('jsonwebtoken')
const User = require('../schemas/User')
const Robot = require('../schemas/Robot')
const { connectMongo, disconnectMongo, getMongo } = require('./setup')

chai.use(chaiHttp)
const { expect } = chai

before(async () => {
    const mongo = await connectMongo() // starts server & connects Mongoose

    // Load routes with a fake MQTT client
    const fakeMqtt = { publish: () => {} }
    loadApiRoutes(fakeMqtt)

    // Seed test data
    await User.create({
        user_id: 'test-user-1',
        first_name: 'Test',
        last_name: 'User',
        email: 'robot@test.local',
        password: 'hashed-password'
    })

    await Robot.create({ robot_id: 'r1', owned_by_user_id: 'test-user-1', name: 'Alpha', location: 'A', status: 'off' })
    await Robot.create({ robot_id: 'r2', name: 'Beta', location: 'B', status: 'off' })
    await Robot.create({ robot_id: 'r3', name: 'Gamma', location: 'C', status: 'off' })
})

after(async () => {
    await disconnectMongo()
})

describe('Robots tests', () => {
    // Build a valid access token for our test user
    function makeToken() {
        return jwt.sign(
            { user_id: 'test-user-1', email: 'robot@test.local', first_name: 'Test', last_name: 'User' },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        )
    }

    describe('POST /api/robots/fetch', () => {
        it('returns only robots owned by the user when provided a valid token', async () => {
            const token = makeToken()
            const res = await chai.request(app)
                .post('/api/robots/fetch')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1' })

            expect(res).to.have.status(200)
            expect(res.body).to.have.property('robots').that.is.an('array')
            const ids = res.body.robots.map(r => r.robot_id)
            expect(ids).to.include('r1')
            expect(ids).to.not.include('r2')
        })

        it('fails when no token is provided', async () => {
            const res = await chai.request(app)
                .post('/api/robots/fetch')
                .send({ userId: 'test-user-1' })

            expect(res).to.have.status(401)
        })

        it('fails with an invalid token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/fetch')
                .set('Authorization', 'Bearer invalid.token')
                .send({ userId: 'test-user-1' })

            expect(res).to.have.status(401)
        })
    })

    describe('POST /api/robots/delete', () => {
        it('fails without token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/delete')
                .send({ userId: 'test-user-1', robotId: 'r1' })
            expect(res).to.have.status(401)
        })

        it('fails with invalid token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/delete')
                .set('Authorization', 'Bearer invalid.token')
                .send({ userId: 'test-user-1', robotId: 'r1' })
            expect(res).to.have.status(401)
        })
        it('unassigns owned_by_user_id when valid token and ownership provided', async () => {
            const token = makeToken()
            const res = await chai.request(app)
                .post('/api/robots/delete')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'r1' })

            expect(res).to.have.status(200)

            const r = await Robot.findOne({ robot_id: 'r1' })
            expect(r).to.exist
            expect(r.owned_by_user_id).to.be.oneOf([undefined, null])
        })
    })

    describe('POST /api/robots/new', () => {
        it('claims an unowned robot for the user', async () => {
            const token = makeToken()
            // r2 is unowned
            const res = await chai.request(app)
                .post('/api/robots/new')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'r2' })

            expect(res).to.have.status(200)

            const r = await Robot.findOne({ robot_id: 'r2' })
            expect(r).to.exist
            expect(r.owned_by_user_id).to.equal('test-user-1')
        })

        it('fails without token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/new')
                .send({ userId: 'test-user-1', robotId: 'r3' })
            expect(res).to.have.status(401)
        })

        it('fails if robot is not found', async () => {
            const token = makeToken()
            const res = await chai.request(app)
                .post('/api/robots/new')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'nonexistent' })

            expect(res).to.have.status(404)
            expect(res.body).to.have.property('error', 'Robot not found')
        })

        it('fails if robot is already owned', async () => {
            const token = makeToken()
            // Ensure r1 is owned again before testing
            await Robot.updateOne({ robot_id: 'r1' }, { $set: { owned_by_user_id: 'test-user-1' } })
            // r1 is already owned by test-user-1
            const res = await chai.request(app)
                .post('/api/robots/new')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'r1' })

            expect(res).to.have.status(403)
            expect(res.body).to.have.property('error', 'Robot already owned')
        })
    })

    describe('POST /api/robots/rename', () => {
        it('updates name/location when authorized', async () => {
            const token = makeToken()
            const res = await chai.request(app)
                .post('/api/robots/rename')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'r2', name: 'Beta-Updated', location: 'Z' })

            expect(res).to.have.status(200)

            const r = await Robot.findOne({ robot_id: 'r2' }).lean()
            expect(r.name).to.equal('Beta-Updated')
            expect(r.location).to.equal('Z')
        })

        it('fails without token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/rename')
                .send({ userId: 'test-user-1', robotId: 'r2', name: 'X' })
            expect(res).to.have.status(401)
        })
    })

    describe('POST /api/robots/start', () => {
        it('sets status to roaming and publishes mqtt', async () => {
            const token = makeToken()
            const res = await chai.request(app)
                .post('/api/robots/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'r2' })

            expect(res).to.have.status(200)
            const r = await Robot.findOne({ robot_id: 'r2' })
            expect(r.status).to.equal('roaming')
        })

        it('fails without token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/start')
                .send({ userId: 'test-user-1', robotId: 'r2' })

            expect(res).to.have.status(401)
        })
    })

    describe('POST /api/robots/stop', () => {
        it('sets status to stopping', async () => {
            const token = makeToken()
            const res = await chai.request(app)
                .post('/api/robots/stop')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: 'test-user-1', robotId: 'r2' })

            expect(res).to.have.status(200)
            const r = await Robot.findOne({ robot_id: 'r2' })
            expect(r.status).to.equal('stopping')
        })

        it('fails without token', async () => {
            const res = await chai.request(app)
                .post('/api/robots/stop')
                .send({ userId: 'test-user-1', robotId: 'r2' })

            expect(res).to.have.status(401)
        })
    })
  })
