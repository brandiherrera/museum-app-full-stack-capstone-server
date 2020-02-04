const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'user100',
            email: 'test-user-1',
            password: 'password1',
        },
        {
            id: 2,
            user_name: 'user200',
            email: 'test-user-2',
            password: 'password1',
        },
        {
            id: 3,
            user_name: 'user300',
            email: 'test-user-3',
            password: 'password1',
        },
        {
            id: 4,
            user_name: 'user400',
            email: 'test-user-4',
            password: 'password',
        },
    ]
}

function makeDataArray() {
    return [
        {
            id: 1,
            object_id: 4000,
            primary_image: 'https://images.metmuseum.org/CRDImages/ad/original/112937.jpg',
            art_title: 'Fragment',
            art_artist: '',
            art_date: '1700-1800',
        },
        {
            id: 2,
            object_id: 436535,
            primary_image: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
            art_title: 'Wheat Field with Cypresses',
            art_artist: 'Vincent van Gogh',
            art_date: '1889',
        },
        {
            id: 3,
            object_id: 438012,
            primary_image: 'https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg',
            art_title: 'Bouquet of Chrysanthemums',
            art_artist: 'Auguste Renoir',
            art_date: '1881',
        },
    ]
}

function makeExpectedData(users, data = []) {
    const user = users
        .find(user => user.id == data.user_id)
    return {
        serializeData(data) {
            return {
                id: data.id,
                object_id: data.object_id,
                primary_image: data.primary_image,
                art_title: data.art_title,
                art_artist: data.art_artist,
                art_date: data.art_date,
            }
        }
    }
}

function makeDataFixtures() {
    const testUsers = makeUsersArray()
    const testData = makeDataArray(testUsers)
    return { testUsers, testData }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
          museum_users,
          museum_art_data,
          users_comments,
          users_gallery
        `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE museum_art_data_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE museum_users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('museum_art_data_id_seq', 0)`),
                    trx.raw(`SELECT setval('museum_users_id_seq', 0)`),
                ])
            )
    )
}

function seedDataTables(db, users, data = []) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('museum_art_data').insert(data)
        // update the auto sequence to match the forced id values
        await trx.raw(
            `SELECT setval('museum_art_data_id_seq', ?)`,
            [data[data.length - 1].id],
        )
    })
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('museum_users').insert(preppedUsers)
        .then(() =>
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('museum_users_id_seq', ?)`,
                [users[users.length - 1].id],
            )
        )
}


function seedMaliciousData(db, user, data) {
    return seedUsers(db, [user])
        .then(() =>
            db
                .into('museum_art_data')
                .insert([data])
        )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.email,
        algorithm: 'HS256',
    })
    return `bearer ${token}`
}

module.exports = {
    makeDataArray,
    makeDataFixtures,
    cleanTables,
    seedDataTables,
    seedMaliciousData,
    makeAuthHeader,
    seedUsers,
    makeExpectedData,
}