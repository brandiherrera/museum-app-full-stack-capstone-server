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
    deleteById(knex, object_id) {
        return knex('museum_art_data')
            .where( 'object_id', object_id )
            .delete()
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
            .join(
                'museum_art_data AS art',
                'user.art_id',
                'art.object_id'
                // {'user.art_id':
                // 'art.object_id'}
                )
            .returning('*')
    },
    insertGalleryItem(knex, newGalleryItem) {
        return knex
            .insert(newGalleryItem)
            // .on(newGalleryItem.art_id)
            .into('users_gallery')
            .where('art_id', newGalleryItem.art_id)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteUserGallery(knex, id) {
        return knex('users_gallery')
            .where({ id })
            .delete()
    },
    deleteRecord(knex, id) {
        return knex('users_gallery')
            .where('id', id)
            .delete()
    },
}

module.exports = ArtService