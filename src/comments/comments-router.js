const path = require('path')
const express = require('express')
const xss = require('xss')
const CommentsService = require('./comments-service')

const commentsRouter = express.Router()
const jsonParser = express.json()

const serializeComment = comment => ({
    // id: comment.id,
    art_id: comment.art_id,
    comment: xss(comment.comment),
})

commentsRouter
    .route('/')
    .get((req, res, next) => {
        CommentsService.getComments(req.app.get('db'))
            .then(comments => {
                res.json(comments)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { art_id, comment } = req.body
        const newComment = { art_id, comment }

        for (const [key, value] of Object.entries(newComment))
        if (value == null)
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })

        // newComment.user_id = req.user.id
        newComment.user_id = 1

        CommentsService.insertComment(
            req.app.get('db'),
            newComment
        )
        .then(comment => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${comment.id}`))
                .json(serializeComment(comment))
        })
        .catch(next)
    })

commentsRouter
    .route('/:object_id')
    .all((req, res, next) => {
        CommentsService.getById(req.app.get('db'), req.params.object_id)
            .then(comments => {
                if (!comments) {
                    return res.status(404).json({
                        error: { message: `No comments exist` }
                    })
                }
                res.comments = comments
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.comments)
    })

module.exports = commentsRouter