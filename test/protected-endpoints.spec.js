const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected endpoints', function () {
    let db

    const {
        testUsers,
        testData,
    } = helpers.makeDataFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert data', () =>
        helpers.seedDataTables(
            db,
            testUsers,
            testData,
        )
    )
    
    const protectedEndpoints = [
        {
            name: 'GET /api/art/gallery/:user_id',
            path: '/api/art/gallery/:user_id',
            method: supertest(app).get,
        },
        {
            name: 'POST /api/art/gallery/:user_id',
            path: '/api/art/gallery/:user_id',
            method: supertest(app).post,
        },
        {
            name: 'POST /api/comments',
            path: '/api/comments',
            method: supertest(app).post,
        },
    ]

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            
            it(`responds 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, { error: `Missing bearer token` })
            })

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0]
                const invalidSecret = 'bad-secret'
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = { email: 'user-not-existy', id: 1 }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, { error: `Unauthorized request` })
            })
        })
    })
})