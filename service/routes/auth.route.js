const router = require('express').Router();
const {authLogin, refreshAccessToken, firstTimeChangePassword} = require('../controllers/auth.controller');

router.post('/login', authLogin);

router.get('/get-access-token', refreshAccessToken);

router.post('/first-time-change-password', firstTimeChangePassword);

module.exports = router;