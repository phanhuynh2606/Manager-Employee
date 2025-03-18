const router = require('express').Router();
const {authLogin, refreshAccessToken, firstTimeChangePassword, authLogout, getProfile} = require('../controllers/auth.controller');
const {authenticate} = require("../middlewares/auth.middleware");

router.post('/login', authLogin);

router.get('/get-access-token', refreshAccessToken);

router.post('/first-time-change-password', firstTimeChangePassword);

router.get("/logout", authLogout);

router.get("/get-profile", authenticate, getProfile);

module.exports = router;