const Post = require('../models/Post')
const User = require('../models/User')
const auth = require('../auth')


module.exports.addComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).send({
                message: "Post does not exist"
            });
        }

        const { comment } = req.body;

        if (!comment) {
            return res.status(422).send({
                message: "Comment field is required"
            });
        }
        // just for  race conditions.
        const newComment = post.comments.create({
            author: req.user.id,
            comment
        });

        post.comments.push(newComment);

        await post.save();

        await post.populate({
            path: "comments.author",
            select: "username -_id"
        });

        const savedComment = post.comments.id(newComment._id);

        return res.status(201).send({
            _id: savedComment._id,
            // userId: savedComment.author._id,
            author: savedComment.author.username,
            comment: savedComment.comment
        });

    } catch (err) {
        next(err);
    }
};

module.exports.getComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId)
        if (!post) {
            return res.status(404).send({ message: "Post does not exist" })
        }

        const comment = post.comments.id(req.params.commentId)
        if (!comment) {
            return res.status(404).send({ message: "Comment does not exist" })
        }
        await post.populate({ path: 'comments.author', select: 'username -_id' });
        return res.status(200).send({
            _id: comment._id,
            author: comment.author.username,
            comment: comment.comment,
            date_added: comment.createdAt,
            last_update: comment.updatedAt
        })

    } catch (err) {
        next(err)
    }
}


module.exports.editComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).send({ message: "Unauthorized request" });
        }

        const { comment: newComment } = req.body;
        if (!newComment) {
            return res.status(422).send({ message: "Comment field is required" });
        }

        comment.comment = newComment;
        await post.save();
        await post.populate({ path: 'comments.author', select: 'username -_id' });

        const updatedComment = post.comments.id(req.params.commentId);
        return res.status(200).send({
            _id: updatedComment._id,
            author: updatedComment.author.username,
            comment: updatedComment.comment
        });
    } catch (err) {
        next(err);
    }
}

module.exports.deleteComment = async (req, res, next) => {

    try {

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }


        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).send({ message: "Unauthorized request" });
        }


        post.comments.pull(req.params.commentId)

        await post.save();

        return res.status(200).send({
            message: "Comment deleted successfully",
            comment: {
                _id: comment._id,
                author: comment.author.username,
                comment: comment.comment
            }
        })

    } catch (err) {
        next(err)
    }

}