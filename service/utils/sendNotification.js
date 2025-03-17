const { getIO } = require('../config/socket');

const sendNotification = async(notification) => {
  const io = getIO();
  console.log('Sending notification:', notification);
  if (notification.type === 'SYSTEM') {
    console.log('Sending to all');
    io.emit('newNotification', notification);
  } else if (notification.type === 'PERSONAL' && notification.recipientId) {
    const recipients = Array.isArray(notification.recipientId) ? notification.recipientId : [notification.recipientId];
    recipients.forEach((recipientId) => {
      io.to(recipientId.toString()).emit('newNotification', notification);
    });
  } else if (notification.type === 'DEPARTMENT' && notification.departmentId) {
    let departments = Array.isArray(notification.departmentId) ? notification.departmentId : [notification.departmentId];
    departments.forEach((depId) => {
      io.to(depId.toString()).emit('newNotification', notification);
    });
  }
};

module.exports = sendNotification;