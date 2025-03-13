const Notification = require('../models/notification');

// 📌 Tạo thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const { title, content, type, departmentIds, recipientId } = req.body;
    const newNotification = new Notification({
      title,
      content,
      type,
      departmentIds: departmentIds || [],
      recipientId,
      createdBy : req.user._id
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Lấy danh sách thông báo (theo phòng ban hoặc toàn bộ)
exports.getNotifications = async (req, res) => {
  try {
    const { employeeId, departmentId } = req.query;
    let query = {};

    // Lấy thông báo cá nhân
    query.$or = [
      { type: 'SYSTEM' },  // Thông báo toàn công ty
      { departmentIds: departmentId },  // Thông báo theo phòng ban
      { recipientId: employeeId }  // Thông báo cá nhân
    ];

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    if (!notification.readBy.includes(employeeId)) {
      notification.readBy.push(employeeId);
      await notification.save();
    }

    res.status(200).json({ message: 'Đã đánh dấu là đã đọc' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
