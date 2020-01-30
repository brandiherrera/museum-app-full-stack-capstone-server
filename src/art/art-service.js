const ArtService = {
    getArtGallery(knex) {
        return knex
            .select('*')
            .from('museum_art_data')
    },
    getById(knex, object_id) {
        return knex
            .from('museum_art_data')
            .select('*')
            .where('object_id', object_id)
            .first()
    },
    // getUserGallery(knex, user_id) {
    //     return knex
    //         .from('users_gallery')
    //         .select('*')
    //         .where('user_id', user_id)
    // },
    getUserGallery(knex, user_id) {
        return knex
            .from('users_gallery AS user'/*, 'museum_users AS user'*/)
            .where('user_id', user_id)
            .select('*')
            // .select(
            //     'user.art_id',
            //     'user.user_id'
            // )
            .join(
                'museum_art_data AS art',
                'user.art_id',
                'art.object_id'
                )
                .returning('*')
                // .then(rows => {
                //     return rows[0]
                // })
            // .using('users_gallery', 'museum_users')
            // .where('users_gallery.user_id', user_id = 'museum_users.id')
    },
    insertGalleryItem(knex, newGalleryItem) {
        return knex
            .insert(newGalleryItem)
            .into('users_gallery')
            .where('art_id', newGalleryItem.art_id)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = ArtService