const xss = require('xss')

const UsersService = {
    serializeUser(user) {
        return {
            user_id: user.id,
            first_name: xss(user.first_name),
            last_name: xss(user.last_name),
            user_name: xss(user.user_name),
            email: xss(user.email),
            password: xss(user.password),
            date_created: new Date(user.date_created),
        }
    },
}

module.exports = UsersService