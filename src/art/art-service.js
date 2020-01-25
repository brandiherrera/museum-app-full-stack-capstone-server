const ArtService = {
    getArtGallery(knex) {
        return knex.select('*').from('museum_art_data')
    }
}

module.exports = ArtService