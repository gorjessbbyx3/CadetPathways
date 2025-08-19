
const express = require('express');
const { signup, login, verifyLogin, googleLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-login', verifyLogin);
router.post('/google-login', googleLogin);

module.exports = router;
