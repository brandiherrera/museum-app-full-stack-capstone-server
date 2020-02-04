const path = require('path')
const express = require('express')
const xss = require('xss')
const CommentsService = require('./comments-service')
const { requireAuth } = require('../middleware/jwt-auth')

const commentsRouter = express.Router()
const jsonParser = express.json()

const serializeComment = comment => ({
    user_name: comment.user_name,
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { user_name, art_id, comment } = req.body
        const newComment = {  user_name, art_id, comment }

        for (const [key, value] of Object.entries(newComment))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        newComment.user_id = req.user.id
        newComment.user_name = req.user.user_name
        console.log('User id L38====>', newComment.user_id)
        console.log('User id L39====>', newComment.user_name)

        CommentsService.insertComment(
            req.app.get('db'),
            newComment
        )
            .then(comment => {
                console.log('COMMENT L44 ====>', comment)
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