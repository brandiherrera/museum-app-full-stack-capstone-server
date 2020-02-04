const CommentsService = {
    getComments(knex) {
        return knex
            .select('*')
            .from('users_comments')
    },
    getUsername(knex, id) {
        return knex
            // .select('*')
            .select('user_name')
            .from('museum_users')
            .where('id', id)
            .first()
    },
    getById(knex, object_id) {
        return knex
            .from('users_comments')
            .select('*')
            .where('art_id', object_id)
    },
    insertComment(knex, newComment) {
        return knex
            .insert(newComment)
            .into('users_comments')
            .where('art_id', newComment.art_id)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
}

module.exports = CommentsService