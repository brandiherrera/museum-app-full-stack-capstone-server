const express = require('express')
const xss = require('xss')
const path = require('path')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const UsersService = require('./users-service')
const ArtService = require('../art/art-service')
const { requireAuth } = require('../middleware/jwt-auth')

const jsonParser = express.json()

// const serializeUser = user => ({
//     user_id: user.id,
//     first_name: xss(user.first_name),
//     last_name: xss(user.last_name),
//     user_name: xss(user.user_name),
//     email: xss(user.email),
//     password: xss(user.password),
//     date_created: new Date(user.date_created),
// })

// All users
usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
        .then(users => {
            res.json(users.map(serializeUser))
        })
        .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { first_name, last_name, user_name, email, password } = req.body
        for (const field of ['first_name', 'last_name', 'user_name', 'email', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        const passwordError = UsersService.validatePassword(password)

        if (passwordError)
            return res.status(400).json({ error: passwordError })

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            email
        )
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` })

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            first_name,
                            last_name,
                            user_name,
                            email,
                            password: hashedPassword,
                        }
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

// Individual users by id
usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        const { user_id } = req.params;
        UsersService.getById(req.app.get('db'), user_id)
            .then(user => {
                if (!user) {
                    return res
                        .status(404)
                        .send({ error: { message: `User doesn't exist.` } })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(UsersService.serializeUser(res.user))
    })
    .delete((req, res, next) => {
        const { user_id } = req.params;
        UsersService.deleteUser(
            req.app.get('db'),
            user_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = usersRouter