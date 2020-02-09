const path = require('path')
const express = require('express')
const xss = require('xss')
const ArtService = require('./art-service')
const { requireAuth } = require('../middleware/jwt-auth')

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
    .delete((req, res, next) => {
        ArtService.deleteById(
            req.app.get('db'),
            req.params.object_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

artRouter
    .route('/id/:id')
    .all((req, res, next) => {
        ArtService.getId(req.app.get('db'), req.params.id)
        // console.log(req.params.id)
            .then(art => {
                console.log(art)
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

artRouter
    .route('/gallery/:user_id')
    .all(requireAuth)
    .all((req, res, next) => {
        const { user_id } = req.params;
        ArtService.getUserGallery(req.app.get('db'), user_id)
            .then(gallery => {
                if (!gallery) {
                    return res
                        .status(404).json({ error: { message: `No gallery exists.` } })
                }
                res.gallery = gallery
                next()
            })
            // .then()
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.gallery)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { art_id } = req.body
        const newGalleryItem = { art_id }

        for (const [key, value] of Object.entries(newGalleryItem))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        newGalleryItem.user_id = req.user.id

        ArtService.insertGalleryItem(
            req.app.get('db'),
            newGalleryItem
        )
            .then(gallery => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${gallery.id}`))
                    .json()
            })
            .catch(next)
    })
    // .delete((req, res, next) => {
    //     ArtService.deleteUserGallery(
    //         req.app.get('db'),
    //         req.params.art_id
    //     )
    //         .then(() => {
    //             res.status(204).end()
    //         })
    //         .catch(next)
    // })


artRouter
    .route('/gallery/:user_id/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        const { user_id } = req.params;
        ArtService.getUserGallery(req.app.get('db'), user_id)
            .then(gallery => {
                if (!gallery) {
                    return res
                        .status(404).json({ error: { message: `No gallery exists.` } })
                }
                res.gallery = gallery
                next()
            })
            .then()
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.gallery)
    })
    .delete((req, res, next) => {
        ArtService.deleteRecord(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = artRouter