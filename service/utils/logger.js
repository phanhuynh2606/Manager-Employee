const ActivityLog = require('../models/log');


const logActivity = async (req, action, entityType, entityId, oldValues = null, newValues = null) => {
    const activityLog = new ActivityLog({
        userId: req?.user?.id || null,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress: req.ip || req.connection.remoteAddress
    });
    await activityLog.save();
    return activityLog;
};
module.exports = {
    logActivity
};