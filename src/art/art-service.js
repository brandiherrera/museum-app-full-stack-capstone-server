const ArtService = {
    getArtGallery(knex) {
        return knex.select('*').from('museum_art_data')
    },
    getById(knex, object_id) {
        return knex
            .from('museum_art_data')
            .select('*')
            .where('object_id', object_id)
            .first()
    },
}

module.exports = ArtService