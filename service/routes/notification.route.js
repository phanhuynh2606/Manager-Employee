const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Tạo thông báo mới
router.post('/', notificationController.createNotification);

// Lấy danh sách thông báo
router.get('/', notificationController.getNotifications);

// Đánh dấu đã đọc thông báo
router.post('/:id/read', notificationController.markAsRead);

module.exports = router;
