const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
    serializeUser(user) {
        return {
            id: user.id,
            first_name: xss(user.first_name),
            last_name: xss(user.last_name),
            user_name: xss(user.user_name),
            email: xss(user.email),
            date_created: new Date(user.date_created),
        }
    },
    getAllUsers(knex) {
        return knex.select('*').from('museum_users')
    },
    hasUserWithUserName(db, email) {
        return db('museum_users')
            .where({ email })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('museum_users')
            .returning('*')
            .then(([user]) => user)
    },
    validatePassword(password) {
        if (password.length < 6) {
            return 'Password must be longer than 6 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    deleteUser(knex, id) {
        return knex('museum_users')
            .where({ id })
            .delete()
    },
    getById(knex, id) {
        return knex
            .from('museum_users')
            .select('*')
            .where('id', id)
            .first()
    },
}

module.exports = UsersService