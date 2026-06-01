const express = require('express');
const postController = require('../controllers/post');
const { verify, isAdmin } = require('../auth');


const router = express.Router();

router.post('/createPost', verify, postController.createPost)
router.get('/getPosts', postController.getPosts)
router.get('/getPost/:id', postController.getPostById)
router.get('/getOwnPosts', verify, postController.getOwnPosts)
router.patch('/updatePost/:id', verify, postController.updatePost)
router.delete('/deletePost/:id', verify, postController.deletePost)

module.exports = router