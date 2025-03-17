const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');


router.use(auth.authenticate);
router.get('/', notificationController.getNotifications);
router.put('/multi-read', notificationController.multiMarkAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/', notificationController.deleteNotifications);

router.use(auth.isAdmin)
router.post('/', notificationController.createNotification);

module.exports = router;
