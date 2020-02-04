const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Users Endpoints', function () {
    let db

    const { testUsers } = helpers.makeDataFixtures()
    const testUser = testUsers[0]

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

    describe(`POST /api/users`, () => {
        context(`User Validation`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            const requiredFields = ['email', 'password', 'first_name', 'last_name', 'user_name']

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    email: 'testemail',
                    password: 'test password',
                    first_name: 'testfirst_name',
                    last_name: 'testlast_name',
                    user_name: 'testuser_name',
                }
                it(`responds 400 'User name already taken' when email isn't unique`, () => {
                    const duplicateUser = {
                        email: testUser.email,
                        password: '11AAaa!!',
                        first_name: 'test first_name',
                        last_name: 'testlast_name',
                        user_name: 'testuser_name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(duplicateUser)
                        .expect(400, { error: `Username already taken` })
                })


                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field]

                    return supertest(app)
                        .post('/api/users')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        })
                })

                it(`responds 400 'Password must be longer than 6 characters' when empty password`, () => {
                    const userShortPassword = {
                        email: 'testemail',
                        password: '12345',
                        first_name: 'testfirst_name',
                        last_name: 'testlast_name',
                        user_name: 'testuser_name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userShortPassword)
                        .expect(400, { error: `Password must be longer than 6 characters` })
                })
                it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                    const userLongPassword = {
                        email: 'testemail',
                        password: '*'.repeat(73),
                        first_name: 'testfirst_name',
                        last_name: 'testlast_name',
                        user_name: 'testuser_name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userLongPassword)
                        .expect(400, { error: `Password must be less than 72 characters` })
                })

                it(`responds 400 error when password starts with spaces`, () => {
                    const userPasswordStartsSpaces = {
                        email: 'test email',
                        password: ' 1Aa!2Bb@',
                        first_name: 'testfirst_name',
                        last_name: 'testlast_name',
                        user_name: 'testuser_name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordStartsSpaces)
                        .expect(400, { error: `Password must not start or end with empty spaces` })
                })
                it(`responds 400 error when password ends with spaces`, () => {
                    const userPasswordEndsSpaces = {
                        email: 'test email',
                        password: '1Aa!2Bb@ ',
                        first_name: 'test first_name',
                        last_name: 'testlast_name',
                        user_name: 'testuser_name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordEndsSpaces)
                        .expect(400, { error: `Password must not start or end with empty spaces` })
                })
            })
        })
        context(`Happy path`, () => {
            it(`responds 201, serialized user, storing bcrypted password`, () => {
                const newUser = {
                    email: 'testemail',
                    password: '11AAaa!!',
                    first_name: 'testfirst_name',
                    last_name: 'testlast_name',
                    user_name: 'testuser_name',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.email).to.eql(newUser.email)
                        expect(res.body.first_name).to.eql(newUser.first_name)
                        expect(res.body.last_name).to.eql(newUser.last_name)
                        expect(res.body.user_name).to.eql(newUser.user_name)
                        expect(res.body).to.not.have.property('password')
                        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                        const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                        const actualDate = new Date(res.body.date_created).toLocaleString()
                        expect(actualDate).to.eql(expectedDate)
                    })
                    .expect(res =>
                        db
                            .from('museum_users')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.email).to.eql(newUser.email)
                                expect(row.first_name).to.eql(newUser.first_name)
                                expect(row.last_name).to.eql(newUser.last_name)
                                expect(res.body.user_name).to.eql(newUser.user_name)
                                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                                const actualDate = new Date(row.date_created).toLocaleString()
                                expect(actualDate).to.eql(expectedDate)

                                return bcrypt.compare(newUser.password, row.password)
                            })
                            .then(compareMatch => {
                                expect(compareMatch).to.be.true
                            })
                    )
            })
        })
    })
})