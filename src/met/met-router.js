const express = require('express')
const xss = require('xss')
const MetService = require('./met-service')
const ArtService = require('../art/art-service')

const metRouter = express.Router()
const jsonParser = express.json()

const serializeData = data => ({
    id: data.id,
    object_id: data.object_id,
    primary_image: data.primary_image,
    art_title: data.art_title,
    art_artist: data.art_artist,
    art_date: data.art_date,
})

metRouter
    .route('/')
    .get((req, res, next) => {
        MetService.getMetData(req.app.get('db'))
        // MetService.getMetData()
            .then(met => {
                res.json(met)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { object_id, primary_image, art_title, art_artist, art_date } = req.body
        const newData = { object_id, primary_image, art_title, art_artist, art_date }

        for (const [key, value] of Object.entries(newData))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        MetService.insertObjectData(req.app.get('db'), newData)
            .then(data => {
                res
                    .status(201)
                    // .primary_image(path.posix.join(req.originalUrl, `${data.id}`))
                    .json(serializedata(data))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const { object_id } = req.params;
        MetService.deleteMetItem(
            req.app.get('db'),
            // req.params.id
            object_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

metRouter
    .route('/interval')
    .all((req, res, next) => {
        MetService.getObjectIds(req.app.get('db'))
        .then(met => {
            console.log('MET', met, met.length)
            res.met = met

            MetService.getById(req.app.get('db'), MetService.getRandomId(res.met))
            .then(data => {
                console.log(data)
                if (!data) {
                    return res
                        .status(404)
                        .send({ error: { message: `Data doesn't exist.` } })
                }
                res.data = data
                console.log('RESDATA====>>>>', res.data)
                // next()
            // })
            MetService.insertInterval(req.app.get('db'), res.data)
            console.log('insertInterval working')
            // .then(data => {
                return res
                    .status(201)
                    // .primary_image(path.posix.join(req.originalUrl, `${data.id}`))
                    // .json(serializedata(data))
                    .json(data)
            })
        })
        // })
        .catch(next)
    })
    .get((req, res) => {
        // res.json(MetService.getRandomId(res.met))
        console.log('RES.DATA AGAIN=======>>>>>>>', res.data)
        // res.data
        // res.json(ArtService.getById(req.app.get('db'), randomId))
        console.log('get ran')
        return res.json(res.data)
    })
    
metRouter
    .route('/daily')
    .get((req, res, next) => {
        MetService.getInterval(req.app.get('db'))
        .then(met => {
            res.json(met)
        })
        .catch(next)
    })
    // .get()

metRouter
    .route('/:object_id')
    .all((req, res, next) => {
        const { object_id } = req.params;
        console.log(req.params)
        MetService.getById(req.app.get('db'), object_id)
            .then(data => {
                if (!data) {
                    return res
                        .status(404)
                        .send({ error: { message: `Data doesn't exist.` } })
                }
                res.data = data
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeData(res.data))
    })
    .delete((req, res, next) => {
        const { object_id } = req.params;
        MetService.deleteMetItem(
            req.app.get('db'),
            object_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = metRouter