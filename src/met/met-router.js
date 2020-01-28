const express = require('express')
const xss = require('xss')
const MetService = require('./met-service')

const metRouter = express.Router()
const jsonParser = express.json()

metRouter
    .route('/')
    .get((req, res, next) => {
        MetService.getMetData(req.app.get('db'))
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

        // newRecord.user_id = req.user.id

        MetService.insertObjectData(req.app.get('db'), newData)
            .then(data => {
                res
                    .status(201)
                    // .location(path.posix.join(req.originalUrl, `${record.id}`))
                    // .json(serializeRecord(record))
            })
            .catch(next)
    })

module.exports = metRouter