const Post = require('../models/Post');
const auth = require('../auth')
const User = require('../models/User');


module.exports.createPost = async (req, res, next) => {

	try {

		const user = await User.findById(req.user?.id)

		if (!user) {
			return res.status(401).send({ message: "Unauthorized request" })
		}

		const { title, content } = req.body
		const author = user._id

		if (!title || !content) {
			return res.status(400).send({ message: "All fields must not be empty" })
		}

		const post = new Post({
			title: title,
			content: content,
			author: author
		})

		const savedPost = await post.save();

		await savedPost.populate({ path: 'author', select: 'username -_id' });

		return res.status(201).send({
			_id: savedPost._id,
			title: savedPost.title,
			content: savedPost.content,
			author: savedPost.author.username,
			comments: savedPost.comments

		})


	} catch (err) {
		next(err)
	}

}

module.exports.getPosts = async (req, res, next) => {

	try {

		const posts = await Post.find({})
			.populate({ path: 'author', select: 'username -_id' })
			.populate({
				path: 'comments',
				populate: { path: 'author', select: 'username -_id' }
			})

		return res.status(200).send(posts.map(post => ({
			_id: post._id,
			title: post.title,
			content: post.content,
			author: post.author.username,
			dateCreated: post.dateAdded,
			comments: post.comments.map(comment => ({
				_id: comment._id,
				author: comment.author.username,
				comment: comment.comment,
				dateCreated: comment.createdAt
			}))
		})))

	} catch (err) {
		next(err)
	}

}

module.exports.getPostById = async (req, res, next) => {


	try {
		const postId = req.params.id;

		const post = await Post.findById({ _id: postId })
			.populate({ path: "author", select: 'username -_id' })
			.populate({ path: "comments", populate: { path: "author", select: "username -_id" } })
		if (!post) {
			return res.status(404).send({
				message: "Post does not exist"
			})
		}

		return res.status(200).send(
			{
				_id: post._id,
				title: post.title,
				content: post.content,
				author: post.author.username,
				comments: post.comments.map(comment => ({
					_id: comment._id,
					author: comment.author.username,
					comment: comment.comment
				}))
			})

	} catch (err) {
		next(err)
	}
}


module.exports.updatePost = async (req, res, next) => {

	try {

		const post = await Post.findById(req.params.id)

		if (!post) {
			return res.status(404).send({ message: "Post does not exist" })
		}

		if (post.author.toString() !== req.user.id) {
			return res.status(403).send({ message: "You can only edit your own posts" })
		}

		const { title, content } = req.body

		if (!title || !content) {
			return res.status(400).send({ message: "All fields must not be empty" });
		}

		post.title = title;
		post.content = content;

		const updatedPost = await post.save();
		return res.status(200).send(updatedPost);


	} catch (err) {
		next(err)
	}

}

module.exports.deletePost = async (req, res, next) => {

	try {

		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).send({
				message: "Post does not exist"
			})
		}


		if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
			return res.status(401).send({
				message: "Unauthorized request"
			})
		}

		const deletedPost = await Post.findByIdAndDelete(req.params.id);

		return res.status(200).send({ message: "Post Successfully Deleted" })

	} catch (err) {
		next(err)
	}

}

module.exports.getOwnPosts = async (req, res, next) => {

	try {
		const posts = await Post.find({ author: req.user.id })
			.populate({ path: 'author', select: 'username -_id' })
			.populate({
				path: 'comments',
				populate: { path: 'author', select: 'username -_id' }
			})

		return res.status(200).send(posts.map(post => ({
			_id: post._id,
			title: post.title,
			content: post.content,
			author: post.author.username,
			dateCreated: post.dateAdded,
			comments: post.comments.map(comment => ({
				_id: comment._id,
				author: comment.author.username,
				comment: comment.comment,
				dateCreated: comment.createdAt
			}))
		})))

	} catch (err) {
		next(err)
	}

}