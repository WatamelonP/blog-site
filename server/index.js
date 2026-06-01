const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')

const postRoutes = require('./routes/post')
const userRoutes = require('./routes/user')
const commentRoutes = require('./routes/comment')
require('dotenv').config()

const app = express();

app.use(express.json());

const corsOptions = {
	origin: "*",
	credentials: true,
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log(`Now connected to mongoDB Atlas`));


app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/posts', commentRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`API is now open on port ${PORT}`);
});

module.exports = { app, mongoose };