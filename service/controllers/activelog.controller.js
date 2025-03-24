const Log = require("../models/log");
const Department = require("../models/department");
const User = require("../models/user");
const Employee = require("../models/employee");
const Position = require("../models/position");
const { default: mongoose } = require("mongoose");

module.exports.getAllLog = async (req, res) => {
    try {
        const role = req.user.role;
        const { sort, page, limitItem, startDate, endDate, entityType } = req.body;

        const find = {};
        if (startDate || endDate) {
            find.createdAt = {};
            if (startDate) find.createdAt.$gte = new Date(startDate);
            if (endDate) find.createdAt.$lte = new Date(endDate);
        }
        if (entityType) find.entityType = entityType;
        if (role === "EMPLOYEE") find.userId = req.user._id;

        // Lấy logs với populate để hạn chế truy vấn phụ
        const allLog = await Log.find(find)
            .skip((page - 1) * limitItem)
            .limit(limitItem)
            .sort(sort)
            .populate({
                path: "userId",
                select: "email role username",
                populate: {
                    path: "employeeId",
                    model: "employee",
                    select: "fullName"
                }
            })
            .lean(); // Dùng lean() để tăng hiệu suất khi chỉ đọc dữ liệu

        // Tạo danh sách ID cần truy vấn
        const departmentIds = new Set();
        const positionIds = new Set();
        const employeeIds = new Set();
        const userIds = new Set();

        allLog.forEach(log => {
            ["newValues", "oldValues"].forEach(field => {
                if (log[field]) {
                    if (log[field].departmentId) departmentIds.add(log[field].departmentId);
                    if (log[field].userId) userIds.add(log[field].userId);
                    if (log[field].managerId) employeeIds.add(log[field].managerId);
                    if (log[field].position && mongoose.Types.ObjectId.isValid(log[field].position)) {
                        positionIds.add(log[field].position);
                    }
                }
            });
        });

        // Truy vấn trước để giảm số lần truy vấn
        const [departments, users, employees, positions] = await Promise.all([
            Department.find({ _id: { $in: [...departmentIds] } }).lean(),
            User.find({ _id: { $in: [...userIds] } }).select("email role username").lean(),
            Employee.find({ _id: { $in: [...employeeIds] } }).select("fullName").lean(),
            Position.find({ _id: { $in: [...positionIds] } }).select("name").lean(),
        ]);

        // Tạo map để tra cứu nhanh
        const departmentMap = Object.fromEntries(departments.map(d => [d._id.toString(), d]));
        const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
        const employeeMap = Object.fromEntries(employees.map(e => [e._id.toString(), e]));
        const positionMap = Object.fromEntries(positions.map(p => [p._id.toString(), p]));

        // Gán dữ liệu vào log
        const logs = allLog.map(log => {
            ["newValues", "oldValues"].forEach(field => {
                if (log[field]) {
                    log[field].departmentId = departmentMap[log[field].departmentId] || null;
                    log[field].userId = userMap[log[field].userId] || null;
                    log[field].managerId = employeeMap[log[field].managerId] || null;
                    log[field].position = positionMap[log[field].position] || null;
                }
            });
            return log;
        });

        // Tổng số logs
        const totalItem = await Log.countDocuments(find);

        res.status(200).json({ data: logs, totalItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
