const CommentsService = {
    getComments(knex) {
        return knex
            .select('*')
            .from('users_comments')
    },
    getById(knex, object_id) {
        return knex
            .from('users_comments')
            .select('*')
            .where('art_id', object_id)
            // .first()
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