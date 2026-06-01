const mongoose = require('mongoose');
const commentSchema = require('./Comment');
const postSchema = new mongoose.Schema({

	title: {
		type: String,
		required: [true, 'title is required']
	},
	content: {
		type: String,
		required: [true, 'Content is required']
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User ID is required']
	},
	comments: [commentSchema]
},
	{
		timestamps: {
			createdAt: 'dateAdded'
		}
	}
)

module.exports = mongoose.model('Post', postSchema)