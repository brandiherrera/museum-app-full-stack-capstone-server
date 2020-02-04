const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers.js')
const xss = require('xss')


const serializeData = data => {
    return {
        id: data.id,
        object_id: data.object_id,
        primary_image: data.primary_image,
        art_title: data.art_title,
        art_artist: data.art_artist,
        art_date: data.art_date,
    }
}
describe('Art Endpoints', () => {
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

    describe('GET /api/art/gallery/:user_id', () => {
        context(`Given no data`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )
            it(`responds with 200 and an empty list`, () => {
                const validUser = testUsers[0]
                return supertest(app)
                    .get(`/api/art/gallery/3`)
                    .set('Authorization', helpers.makeAuthHeader(validUser))
                    .expect(200, [])
            })
        })

        context('Given there is data in the database', () => {
            beforeEach('insert data', () =>
                helpers.seedDataTables(
                    db,
                    testUsers,
                    testData
                )
            )
        })
    })
})