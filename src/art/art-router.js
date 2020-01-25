const express = require('express')
const xss = require('xss')
const ArtService = require('./art-service')
// const { requireAuth } = require('../middleware/jwt-auth ')

const artRouter = express.Router()
const jsonParser = express.json()

artRouter
    .route('/')
    .get((req, res, next) => {
        ArtService.getArtGallery(req.app.get('db'))
            .then(art => {
                res.json(art)
            })
            .catch(next)
    })

module.exports = artRouter