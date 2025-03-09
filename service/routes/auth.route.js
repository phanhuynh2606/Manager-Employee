const router = require('express').Router();
const {authLogin, refreshAccessToken} = require('../controllers/auth.controller');

router.post('/login', authLogin);

router.get('/get-access-token', refreshAccessToken);

module.exports = router;