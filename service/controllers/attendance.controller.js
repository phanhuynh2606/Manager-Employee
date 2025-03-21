const Employee = require("../models/employee");
const User = require('../models/user');
const Department = require('../models/department');
const Attendance = require('../models/attendance');
const os = require('os');
const moment = require('moment-timezone');
const Leave = require('../models/leave');
const { addSalary } = require("./salary.controller");
const Notification = require("../models/notification");
const sendNotification = require("../utils/sendNotification");
const configTimeWork = {
    workStartTime: { hour: 8, minute: 30 },
    morningStartTime: { hour: 8, minute: 30 },
    morningEndTime: { hour: 12, minute: 0 },
    afternoonStartTime: { hour: 13, minute: 30 },
    afternoonEndTime: { hour: 18, minute: 0 },
    minWorkingHours: 8,
}
const now = new Date();
const offset = now.getTimezoneOffset() * 60000;
const localDate = new Date(now.getTime() - offset);
// Tạo các mốc thời gian quan trọng trong ngày
const morningStart = new Date(moment().tz('Asia/Ho_Chi_Minh').set({
    hour: configTimeWork.morningStartTime.hour,
    minute: configTimeWork.morningStartTime.minute
}).toDate().getTime() - offset);
const morningEnd = new Date(moment().tz('Asia/Ho_Chi_Minh').set({
    hour: configTimeWork.morningEndTime.hour,
    minute: configTimeWork.morningEndTime.minute
}).toDate().getTime() - offset);
const afternoonStart = new Date(moment().tz('Asia/Ho_Chi_Minh').set({
    hour: configTimeWork.afternoonStartTime.hour,
    minute: configTimeWork.afternoonStartTime.minute
}).toDate().getTime() - offset);
const afternoonEnd = new Date(moment().tz('Asia/Ho_Chi_Minh').set({
    hour: configTimeWork.afternoonEndTime.hour,
    minute: configTimeWork.afternoonEndTime.minute
}).toDate().getTime() - offset);

const getLocalNetwork = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const entry of iface) {
            if (entry.family === 'IPv4' && !entry.internal) {
                return entry.address.split('.').slice(0, 3).join('.') + '.'; // Lấy dải IP nội bộ
            }
        }
    }
    return '192.168.1.'; // Mặc định nếu không xác định được
};
const getInformation = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ success: false, message: "Bạn cần phải đăng nhập!" });
    }
    if (user.role !== 'EMPLOYEE') {
        return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập vào dữ liệu này!" });
    }
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;;
    // const normalizedIp = ip.replace('::ffff:', '');
    // console.log(ip)
    // console.log(normalizedIp);
    let formatData;
    const formatDate = `${localDate.getMonth() + 1}/${localDate.getFullYear()}`;
    const employee = await User.findOne({ email: user.email }, '-password');
    const employeeDetail = await Employee.findById({ _id: employee.employeeId }).populate('departmentId', 'name').populate('position', 'name');
    const attendanceEmploy = await Attendance.find({ employeeId: employeeDetail._id });
    if (!attendanceEmploy) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi chấm công!" });
    }
    const count = await Attendance.countDocuments({ employeeId: employeeDetail._id, status: 'LATE' })
    formatData = {
        date: formatDate,
        fullName: employeeDetail.fullName,
        department: employeeDetail.departmentId.name,
        position: employeeDetail.position.name,
        workingDay: 22,
        leaveBalance: 12,
        leaveTaken: count,
        overtime: attendanceEmploy.overtimeHours
    }
    return res.status(200).json({ success: true, data: formatData });
}

const getAllAttendance = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập !" });
    }
    if (user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập !" });
    }
    const admin = await User.find({ role: 'EMPLOYEE' }, '-password');
    const employeeIds = admin.map(user => user.employeeId);
    const employees = await Employee.find({ _id: { $in: employeeIds } }).populate('departmentId', 'name').populate('position', 'name');
    let formatData;
    const formatDate = `${localDate.getMonth() + 1}/${localDate.getFullYear()}`;
    formatData = await Promise.all(employees.map(async (employee) => {
        const countLate = await Attendance.countDocuments({ employeeId: employee._id, status: 'LATE' });
        const countLeave = await Attendance.countDocuments({ employeeId: employee._id, status: 'LEAVE' });
        const totalWorkingHours = await Attendance.aggregate([
            { $match: { employeeId: employee._id } },
            { $group: { _id: null, totalWorkingHours: { $sum: "$workingHours" } } }
        ]);
        const attendance = await Attendance.find({ employeeId: employee._id });
        if (!attendance) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi chấm công!" });
        }
        const totalWorkingHour = totalWorkingHours?.length > 0 ? totalWorkingHours[0].totalWorkingHours : 0;
        const totalOvertimeHours = attendance.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
        return {
            date: formatDate,
            fullName: employee.fullName,
            department: employee.departmentId.name,
            position: employee.position.name,
            workingDay: 22,
            leaveBalance: 12,
            lateDays: countLate,
            leaveTaken: countLeave,
            overtime: totalOvertimeHours,
            totalWorkingHours: totalWorkingHour
        };
    }));
    return res.status(200).json({ success: true, data: formatData });
}

const checkin = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập !" });
    }
    // Lấy thông tin nhân viên
    const employee = await User.findById({ _id: user._id }, '-password');
    if (!employee || !employee.employeeId) {
        return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên !" });
    }

    const employeeDetail = await Employee.findById({ _id: employee.employeeId });
    if (!employeeDetail) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin của nhân viên !" });
    }

    const todayStart = new Date(moment().tz('Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
    const todayEnd = new Date(moment().tz('Asia/Ho_Chi_Minh').endOf('day').toDate().getTime() - offset);

    const attendance = await Attendance.findOne({
        employeeId: employeeDetail._id,
        date: { $gte: todayStart, $lte: todayEnd }
    });

    if (attendance) {
        return res.status(400).json({ success: false, message: "Bạn đã điểm danh vào làm ngày hôm nay !" });
    }
    const dateNow = req.body.date;
    const parseDate = new Date(dateNow);
    const formatDate = new Date(parseDate.getTime() - offset);
    let expectedCheckInTime;
    if (formatDate > morningEnd) {
        expectedCheckInTime = afternoonStart;
    } else {
        expectedCheckInTime = morningStart;
    }

    // Tính số phút đi muộn
    const lateMinutes = formatDate > expectedCheckInTime ?
        Math.floor((formatDate - expectedCheckInTime) / (1000 * 60)) : 0;

    // Xác định trạng thái
    const status = lateMinutes > 0 ? 'LATE' : 'PRESENT';

    // Tạo bản ghi chấm công mới
    const newAttendance = new Attendance({
        employeeId: employeeDetail._id,
        date: todayStart,
        checkIn: formatDate,
        status: status,
        lateMinutes: lateMinutes,
        note: req.body.note || ''
    });

    await newAttendance.save();
    return res.status(200).json({
        success: true,
        message: 'Điểm danh vào làm thành công !',
        data: {
            checkInTime: formatDate,
            status: status,
            lateMinutes: lateMinutes
        }
    });
}

const checkout = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập !" });
    }

    const employee = await User.findById(user._id, '-password');
    if (!employee || !employee.employeeId) {
        return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên !" });
    }

    const employeeDetail = await Employee.findById(employee.employeeId);
    if (!employeeDetail) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin của nhân viên !" });
    }

    // Lấy ngày hiện tại
    const todayStart = new Date(moment().tz('Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
    const todayEnd = new Date(moment().tz('Asia/Ho_Chi_Minh').endOf('day').toDate().getTime() - offset);

    // Tìm bản ghi chấm công ngày hôm nay
    const attendance = await Attendance.findOne({
        employeeId: employeeDetail._id,
        date: { $gte: todayStart, $lte: todayEnd }
    });

    if (!attendance) {
        return res.status(400).json({ success: false, message: "Bạn chưa điểm danh vào làm hôm nay!" });
    }

    if (attendance?.checkOut) {
        return res.status(400).json({ success: false, message: "Bạn đã điểm danh ra về hôm nay!" });
    }
    // Lấy thời gian hiện tại để checkout
    const dateNow = req.body.date;
    const parseDate = new Date(dateNow);
    const formatDate = new Date(parseDate.getTime() - offset);
    attendance.checkOut = formatDate;

    // Tính giờ làm buổi sáng
    let morningHours = 0;
    if (attendance?.checkIn <= morningEnd && (attendance?.checkIn >= morningStart || attendance?.status === 'LATE')) {
        const morningCheckOutTime = attendance.checkOut <= morningEnd ? attendance.checkOut : morningEnd;
        morningHours = (morningCheckOutTime - attendance?.checkIn) / (1000 * 60 * 60);
    }

    // Tính giờ làm buổi chiều
    let afternoonHours = 0;
    if (attendance.checkOut >= afternoonStart) {
        const afternoonCheckInTime = attendance?.checkIn >= afternoonStart ?
            attendance?.checkIn : afternoonStart;
        afternoonHours = (attendance.checkOut - afternoonCheckInTime) / (1000 * 60 * 60);
    }

    // Tính tổng số giờ làm việc
    let totalWorkingHours = morningHours + afternoonHours;
    totalWorkingHours = parseFloat(totalWorkingHours.toFixed(2));

    // Tính giờ làm thêm (OT)
    const overtimeHours = attendance.checkOut > afternoonEnd ?
        parseFloat(((attendance.checkOut - afternoonEnd) / (1000 * 60 * 60)).toFixed(2)) : 0;

    // Tính số phút về sớm
    let earlyLeaveMinutes = 0;
    let updatedStatus = attendance?.status;

    if (attendance.checkOut < afternoonEnd && attendance.checkOut > morningEnd) {
        earlyLeaveMinutes = Math.floor((afternoonEnd - attendance.checkOut) / (1000 * 60));
        // Cập nhật trạng thái nếu về sớm
        if (earlyLeaveMinutes > 0) {
            updatedStatus = 'EARLY_LEAVE';
        }
    }

    attendance.status = updatedStatus;
    attendance.morningHours = parseFloat(morningHours.toFixed(2));
    attendance.afternoonHours = parseFloat(afternoonHours.toFixed(2));
    attendance.workingHours = totalWorkingHours;
    attendance.overtimeHours = overtimeHours;
    attendance.earlyLeaveMinutes = earlyLeaveMinutes;
    attendance.breakHours = parseFloat(((afternoonStart - morningEnd) / (1000 * 60 * 60)).toFixed(2));

    // Cập nhật ghi chú
    if (req.body.note) {
        attendance.note += (attendance.note ? ', ' : '') + req.body.note;
    }

    // Tính điểm dựa trên số giờ làm
    const workingRatio = parseFloat((totalWorkingHours / configTimeWork.minWorkingHours).toFixed(2));
    attendance.note += ` Performance score: ${workingRatio}`;

    await addSalary(employeeDetail._id, totalWorkingHours, overtimeHours, earlyLeaveMinutes, attendance.checkOut, attendance.checkIn);

    // Lưu thông tin chấm công
    await attendance.save();

    // Kiểm tra và ghi nhận phạt nếu về sớm
    let message = "Điểm danh ra về thành công!";

    if (overtimeHours > 0) {
        message += ` Overtime recorded: ${overtimeHours.toFixed(2)} hours.`;
    }

    return res.status(200).json({
        success: true,
        message: message,
        data: {
            totalWorkingHours,
            morningHours: parseFloat(morningHours.toFixed(2)),
            afternoonHours: parseFloat(afternoonHours.toFixed(2)),
            overtimeHours,
            earlyLeaveMinutes,
            performanceScore: workingRatio,
            checkOutTime: attendance.checkOut
        }
    });
};

const getAttendanceHistory = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập!" });
    }

    const { startDate, endDate } = req.body;
    // Xác định employeeId để truy vấn
    let targetEmployeeId;

    // Nếu là admin hoặc HR và có truyền employeeId, sử dụng employeeId đó
    if ((user.role === 'ADMIN') && user.employeeId) {
        targetEmployeeId = user.employeeId;
    } else {
        // Ngược lại, chỉ xem dữ liệu của bản thân
        const employee = await User.findById(user._id, '-password');
        if (!employee || !employee.employeeId) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        }
        targetEmployeeId = employee.employeeId;
    }

    // Tạo điều kiện truy vấn
    const query = { employeeId: targetEmployeeId };

    // Thêm điều kiện ngày nếu có
    if (startDate && endDate) {
        const start = new Date(moment.tz(startDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
        const end = new Date(moment.tz(endDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
        query.date = { $gte: start, $lte: end };
    }
    // Truy vấn dữ liệu
    const attendanceRecords = await Attendance.find(query)
        .sort({ date: -1 })
        .populate('employeeId', 'name departmentId position');
    if (!attendanceRecords) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi chấm công!" });
    }
    const leaveDayYear = await Attendance.find({ employeeId: targetEmployeeId, status: 'LEAVE' }).countDocuments();
    // Tính toán tổng kết
    const summary = {
        totalDays: attendanceRecords?.length,
        presentDays: attendanceRecords?.filter(r => r.status === 'PRESENT').length,
        lateDays: attendanceRecords?.filter(r => r.status === 'LATE').length,
        earlyLeaveDays: attendanceRecords?.filter(r => r.status === 'EARLY_LEAVE').length,
        absentDays: attendanceRecords?.filter(r => r.status === 'ABSENT').length,
        leaveDays: leaveDayYear,
        totalWorkingHours: parseFloat(attendanceRecords?.reduce((sum, record) => sum + (record.workingHours || 0), 0).toFixed(2)),
        totalOvertimeHours: parseFloat(attendanceRecords?.reduce((sum, record) => sum + (record.overtimeHours || 0), 0).toFixed(2)),
        averageWorkingHours: attendanceRecords?.length > 0 ? parseFloat((attendanceRecords?.reduce((sum, record) => sum + (record.workingHours || 0), 0) /
            attendanceRecords?.length).toFixed(2)) : 0
    };

    return res.status(200).json({
        success: true,
        data: summary
    });
};

const getAttendanceToday = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập!" });
    }

    const employee = await User.findById(user._id, '-password');
    if (!employee || !employee.employeeId) {
        return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
    }

    const employeeDetail = await Employee.findById(employee.employeeId);
    if (!employeeDetail) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin của nhân viên!" });
    }
    const todayStart = new Date(moment().tz('Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
    const attendance = await Attendance.findOne({
        employeeId: employeeDetail._id,
        date: todayStart
    });

    if (!attendance) {
        return res.status(200).json({
            success: true,
            data: {
                name: '',
                checkIn: "00:00:00",
                checkOut: "00:00:00",
                status: '',
                note: ''
            }
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            name: employeeDetail.fullName || '',
            checkIn: attendance.checkIn || "00:00:00",
            checkOut: attendance.checkOut || "00:00:00",
            status: attendance.status || '',
            note: attendance.note || ''
        }
    });
}

const requestLeave = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập!" });
        }
        const { startDate, endDate, reason } = req.body;
        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, message: "Thiếu trường dữ liệu!" });
        }
        const parseStartDate = new Date(moment.tz(startDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
        const parseEndDate = new Date(moment.tz(endDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
        const employee = await User.findById(user._id, '-password');
        if (!employee || !employee.employeeId) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        }
        const leaveRequest = await Leave.findOne({ startDate: parseStartDate, endDate: parseEndDate, employeeId: employee.employeeId });
        if (leaveRequest) {
            return res.status(400).json({ success: false, message: "Đơn nghỉ phép đã tồn tại!" });
        }
        const newLeaveRequest = new Leave({
            employeeId: employee.employeeId,
            startDate: parseStartDate,
            endDate: parseEndDate,
            reason: reason,
            status: 'Chờ duyệt'
        });

        await newLeaveRequest.save();
        const diffDay = Math.floor((parseEndDate - parseStartDate) / (1000 * 60 * 60 * 24));
        return res.status(200).json({
            success: true,
            message: 'Gửi đơn nghỉ phép thành công!',
            data: {
                diffDay: diffDay
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getAttendanceHistoryByMonth = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập!" });
    }

    const { startDate, endDate } = req.body;

    // Xác định employeeId để truy vấn
    let targetEmployeeId;

    // Nếu là admin hoặc HR và có truyền employeeId, sử dụng employeeId đó
    if ((user.role === 'ADMIN') && user.employeeId) {
        targetEmployeeId = user.employeeId;
    } else {
        // Ngược lại, chỉ xem dữ liệu của bản thân
        const employee = await User.findById(user._id, '-password');
        if (!employee || !employee.employeeId) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        }
        targetEmployeeId = employee.employeeId;
    }

    // Tạo điều kiện truy vấn
    const query = { employeeId: targetEmployeeId };

    // Thêm điều kiện ngày nếu có
    if (startDate && endDate) {
        const start = new Date(moment.tz(startDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
        const end = new Date(moment.tz(endDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
        query.date = { $gte: start, $lte: end };
    }

    // Truy vấn dữ liệu
    const attendanceRecords = await Attendance.find(query)
        .sort({ date: -1 })
        .populate('employeeId', 'name departmentId position');
    if (!attendanceRecords) {
        return res.status(200).json({
            success: true,
            data: {
                date: '0000-00-00',
                checkIn: "00:00:00",
                checkOut: "00:00:00",
                status: '',
                note: ''
            }
        });
    }
    // Format dữ liệu trả về
    const formatData = attendanceRecords.map((record) => {
        return {
            date: record.date,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            status: record.status,
            note: record.note
        };
    });

    return res.status(200).json({
        success: true,
        data: formatData
    });
};

const getListLeave = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập!" });
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [listLeave, totalLeaves] = await Promise.all([
            Leave.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('employeeId', 'fullName'),
            Leave.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            data: listLeave,
            totalPages: Math.ceil(totalLeaves / limit),
            currentPage: page,
            totalRecords: totalLeaves
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


const toDoLeave = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn cần phải đăng nhập!" });
    }
    const { leaveId, action } = req.body;
    if (!leaveId || !action) {
        return res.status(400).json({ success: false, message: "Thiếu trường dữ liệu!" });
    }
    const leave = await Leave.findById(leaveId);
    if (!leave) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn nghỉ phép!" });
    }
    if (leave.status !== 'Chờ duyệt') {
        return res.status(400).json({ success: false, message: "Đơn nghỉ phép đã được xử lý!" });
    }
    const leaveDayYear = await Attendance.find({ employeeId: leave?.employeeId, status: 'LEAVE' }).countDocuments();
    if (leaveDayYear > 12) {
        return res.status(400).json({ success: false, message: "Nhân viên đã nghỉ quá số ngày quy định trong năm!" });
    }
    switch (action) {
        case 'approve':
            if (!leave) {

            }
            leave.status = 'Đã duyệt';
            let currentDate = leave.startDate;
            while (currentDate <= leave.endDate) {
                const newAttendance = new Attendance({
                    employeeId: leave.employeeId,
                    date: currentDate,
                    checkIn: currentDate,
                    status: "LEAVE",
                    workingHours: 0,
                    overtimeHours: 0,
                    morningHours: 0,
                    afternoonHours: 0,
                    breakHours: 1.5,
                    lateMinutes: 0,
                    earlyLeaveMinutes: 0,
                    note: " Performance score: 0" + (leave.reason ? `, Reason: ${leave.reason}` : ''),
                    checkOut: currentDate
                });
                await newAttendance.save();
                currentDate.setDate(currentDate.getDate() + 1);
            }
            break;
        case 'reject':
            leave.status = 'Từ chối';
            break;
        default:
            return res.status(400).json({ success: false, message: "Hành động không hợp lệ!" });
    }
    const checkingLeave = await leave.save();
    if (!checkingLeave) {
        return res.status(500).json({ success: false, message: "Lỗi khi xử lý đơn nghỉ phép!" });
    }
    let content;
    switch (action) {
        case 'reject':
            content = 'Đơn nghỉ phép của bạn đã bị từ chối!';
            break;
        case 'approve':
            content = 'Đơn nghỉ phép của bạn đã được duyệt!';
            const employee = await Employee.findById({ employeeId : leave.employeeId });
            const countLeave = await Attendance.find({ employeeId: leave?.employeeId, status: 'LEAVE' }).countDocuments();
            if (employee && employee?.leaveBalance) {
                employee.leaveBalance.unpaid = 12 - countLeave;
                await employee.save();
            }
            break;
        default:
            break;
    }
    const notification = await Notification.create({
        title: "Thông báo",
        content: content,
        recipientId: leave.employeeId,
        createdBy: user._id,
        type: "PERSONAL",
    });
    const userSend = await User.findById(notification.createdBy).populate('employeeId',"fullName avatarUrl" )
    const notificationObject = notification.toObject();
    notificationObject.createdBy = {
        fullName: userSend.employeeId.fullName,
        avatarUrl: userSend.employeeId.avatarUrl
    };
    await sendNotification(notificationObj);
    return res.status(200).json({
        success: true,
        message: `Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} đơn nghỉ phép!`,
    })
}



module.exports = {
    getInformation,
    checkin,
    checkout,
    getAttendanceHistory,
    requestLeave,
    getAttendanceToday,
    toDoLeave,
    getAttendanceHistoryByMonth,
    getListLeave,
    getAllAttendance
}
