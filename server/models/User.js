const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: [true, "email should be unique"],
		required: [true, "email is required"]
	},
	username: {
		type: String,
		required: [true, "username is required"]
	},
	password: {
		type: String,
		required: [true, "password is required"]
	},
	isAdmin: {
		type: Boolean,
		default: false
	},

},
	{
		timestamps: true
	})

module.exports = mongoose.model('User', userSchema)