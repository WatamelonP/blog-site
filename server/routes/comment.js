const express = require('express')
const commentController = require('../controllers/comment')
const {verify, isAdmin} = require('../auth')

const router = express.Router()


router.post('/:postId/comments', verify, commentController.addComment) 
router.get('/:postId/comments/:commentId', verify, commentController.getComment)
router.patch('/:postId/comments/:commentId', verify, commentController.editComment) 
router.delete('/:postId/comments/:commentId', verify, commentController.deleteComment)
module.exports = router