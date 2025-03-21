const Notification = require('../models/notification');
const User = require('../models/user');
const Department = require('../models/department');
const sendNotification = require('../utils/sendNotification');

const createNotification = async (req, res) => {
  try {
    let { title, content, type, departmentId, recipientId } = req.body;
    if (!title || !content || !type) return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ thông tin'
    });
    // if(type === 'DEPARTMENT' && !departmentId){
    //   return res.status(400).json({ 
    //     success: false,
    //     message: 'Vui lòng chọn phòng ban' 
    //   });
    // } 
    if (type === 'PERSONAL' && !recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn người nhận'
      });
    }
    let sendToAll = false;
    if (type === 'DEPARTMENT' && departmentId && departmentId.includes('ALL')) {
      const department = await Department.find().select('_id');
      departmentId = department.map(dep => dep._id);
    }
    let newNotification = new Notification({
      title,
      content,
      type,
      sendToAll,
      departmentId,
      recipientId,
      createdBy: req.user._id
    });

    await newNotification.save();
    const userSend = await User.findById(newNotification.createdBy).populate('employeeId',"fullName avatarUrl" )
    const notificationObj = newNotification.toObject();
    notificationObj.createdBy = {
      fullName: userSend.employeeId.fullName,
      avatarUrl: userSend.employeeId.avatarUrl
    };
    sendNotification(notificationObj);
    res.status(201).json({
      success: true,
      message: 'Tạo thông báo thành công',
      // data: newNotification  
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách thông báo (theo phòng ban hoặc toàn bộ)
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 5;
    const skip = (page - 1) * limit;
    let query = {};
    const user = await User.findById(req.user._id).populate('employeeId', 'departmentId');
    // Tạo query cho việc lọc thông báo
    const departmentIds = Array.isArray(user?.employeeId?.departmentId)
      ? user.employeeId.departmentId
      : user?.employeeId?.departmentId
        ? [user.employeeId.departmentId]
        : [];
    query = {
      $or: [
        { type: 'SYSTEM' },
        { type: 'DEPARTMENT', sendToAll: true },
        { type: 'DEPARTMENT', departmentId: { $in: departmentIds } },
        { recipientId: user.employeeId?._id }
      ]
    };
    const { status, type, startDate, endDate } = req.query;
    // 1. Lọc theo trạng thái (read/unread)
    if (status === 'UNREAD') {
      query.readBy = { $nin: [user.employeeId._id] };
    } else if (status === 'READ') {
      query.readBy = { $in: [user.employeeId._id] };
    }

    // 2. Lọc theo loại thông báo (SYSTEM, DEPARTMENT, PERSONAL)
    if (type && type !== 'ALL') {
      query.type = type.toUpperCase();
    }

    // 3. Lọc theo khoảng thời gian (startDate, endDate)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    // Aggregation pipeline
    const result = await Notification.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          totalCount: [{ $count: 'count' }], // Đếm tổng số thông báo
          readCount: [
            { $match: { readBy: user.employeeId._id } },
            { $count: 'count' }
          ], // Thông báo đã đọc
          unreadCount: [
            { $match: { readBy: { $ne: user.employeeId._id } } },
            { $count: 'count' }
          ], // Thông báo chưa đọc
          notifications: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
              }
            },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'employees',
                localField: 'createdBy.employeeId',
                foreignField: '_id',
                as: 'createdBy.employee'
              }
            },
            { $unwind: { path: '$createdBy.employee', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                title: 1,
                content: 1,
                type: 1,
                readBy: 1,
                createdAt: 1,
                createdBy:{
                  fullName: '$createdBy.employee.fullName',
                  avatarUrl: '$createdBy.employee.avatarUrl'
                }
              }
            }
          ]
        }
      }
    ]);

    const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
    const read = result[0].readCount.length > 0 ? result[0].readCount[0].count : 0;
    const unread = result[0].unreadCount.length > 0 ? result[0].unreadCount[0].count : 0;
    const notifications = result[0].notifications;
    res.status(200).json({
      success: true,
      data: notifications,
      employeeId: user.employeeId,
      totalNotifications: total,
      readNotifications: read,
      unreadNotifications: unread
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//  Đánh dấu thông báo đã đọc
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.employeeId;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    if (!notification.readBy.includes(employeeId)) {
      notification.readBy.push(employeeId);
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Đánh dấu là đã đọc'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const multiMarkAsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    const employeeId = req.user?.employeeId;
    const notifications = await Notification.find({ _id: { $in: ids } });
    if (!notifications) return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    notifications.forEach(async notification => {
      if (!notification.readBy.includes(employeeId)) {
        notification.readBy.push(employeeId);
        await notification.save();
      }
    });

    res.status(200).json({
      success: true,
      message: 'Đánh dấu là đã đọc'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

const deleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    const notifications = await Notification.deleteMany({ _id: { $in: ids } });
    if (!notifications) return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    res.status(200).json({
      success: true,
      message: 'Xóa thông báo thành công'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }

}

module.exports = { createNotification, getNotifications, markAsRead, multiMarkAsRead, deleteNotifications };