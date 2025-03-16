const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');


router.use(auth.authenticate);
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

router.use(auth.isAdmin)
router.post('/', notificationController.createNotification);

module.exports = router;
