const express = require('express')
const xss = require('xss')
const ArtService = require('./art-service')
// const { requireAuth } = require('../middleware/jwt-auth ')

const artRouter = express.Router()
const jsonParser = express.json()

// const serializeArt = art => ({
//     id: art.id,
//     object_id: art.object_id,
//     primary_image: art.primary_image,
//     art_title: art.art_title,
//     art_artist: art.art_artist,
//     art_date: art.art_date,
// })

artRouter
    .route('/')
    .get((req, res, next) => {
        ArtService.getArtGallery(req.app.get('db'))
            .then(art => {
                res.json(art)
            })
            .catch(next)
    })

artRouter
    .route('/:object_id')
    .all((req, res, next) => {
        ArtService.getById(req.app.get('db'), req.params.object_id)
            .then(art => {
                if (!art) {
                    return res.status(404).json({
                        error: { message: `Art information doesn't exist` }
                    })
                }
                res.art = art
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.art)
    })

module.exports = artRouter