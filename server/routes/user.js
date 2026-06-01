const express = require('express');
const userController = require('../controllers/user');
const {verify} = require('../auth');

const router = express.Router();

router.post("/register", userController.userRegister);
router.post("/login", userController.userLogin);
router.get("/profile", verify, userController.userDetails)

module.exports = router