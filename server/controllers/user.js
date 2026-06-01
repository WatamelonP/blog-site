const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth')

const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

module.exports.userRegister = async (req, res, next) => {

	try {

		const { email, username, password } = req.body;

		if (!email || !username || !password) {
			return res.status(400).send({ message: "All fields must not be empty" })
		}

		if (!emailFormat.test(email)) {
			return res.status(400).send({ message: "Invalid Email Format" })
		}

		if (password.length < 8) {
			return res.status(400).send({ message: "Password must be at least 8 characters long" })
		}

		let newUser = new User({
			email: email,
			username: username,
			password: bcrypt.hashSync(password, 10)
		})

		await newUser.save()

		return res.status(201).send({
			message: "Registration Successful",
		})
	} catch (err) {

		if (err.code === 11000) {
			return res.status(409).send({ message: "Email or Username already exists" });
		}
		next(err);
	}

}

module.exports.userLogin = async (req, res, next) => {

	try {

		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).send({ message: "Invalid credentials" })
		}

		const user = await User.findOne({ email })

		if (!user) {
			return res.status(400).send({ message: "Invalid credentials" })
		}

		const isPasswordCorrect = bcrypt.compareSync(password, user.password);

		if (!isPasswordCorrect) {
			return res.status(400).send({ message: "Invalid credentials" })
		}

		const token = auth.createAccessToken(user);

		return res.status(200).send({
			access: token
		})


	} catch (err) {
		next(err)
	}

}

module.exports.userDetails = async (req, res, next) => {

	try {

		const user = await User.findById(req.user.id)

		if (!user) {
			return res.status(404).send({ message: "User Not Found" })
		}

		return res.status(200).send({
			user: {
				_id: user._id,
				email: user.email,
				username: user.username,
				isAdmin: user.isAdmin,
				createdAt: user.createdAt,
				__v: user.__v
			}
		})

	} catch (err) {
		next(err)
	}

}