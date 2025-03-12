const Employee = require('../models/employee');
const User = require('../models/user');
const Department = require('../models/department');
const Attendance = require('../models/attendance');
const os = require('os');
const moment = require('moment-timezone');
const Leave = require('../models/leave');
const configTimeWork = {
    workStartTime : { hour: 8, minute: 30 },
     morningStartTime : { hour: 8, minute: 30 },
     morningEndTime : { hour: 12, minute: 0 },
     afternoonStartTime : { hour: 13, minute: 30 },
     afternoonEndTime : { hour: 18, minute: 0 },
     minWorkingHours : 8,
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
        const role = user.role;
        // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;;
        // const normalizedIp = ip.replace('::ffff:', '');
        // console.log(ip)
        // console.log(normalizedIp);
        let formatData;
        const formatDate = `${localDate.getMonth() + 1}/${localDate.getFullYear()}`;
        switch (role) {
            case 'ADMIN':
                const admin = await User.find({ role: 'EMPLOYEE' }, '-password' );
                const employeeIds = admin.map(user => user.employeeId);
                const departmentId = employeeIds.map(employee => employee.departmentId);
                const department = await Department.find({ _id: { $in: departmentId } });
                const employees = await Employee.find({ _id: { $in: employeeIds } });

                formatData = await Promise.all(employees.map(async (employee) => {
                    const count = await Attendance.countDocuments({ employeeId: employee._id, status: 'LATE' });
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
                        department: department.name,
                        position: employee.position,
                        workingDay: 22,
                        leaveBalance: 12,
                        leaveTaken: count,
                        overtime: totalOvertimeHours
                    };
                }));
                return res.status(200).json({ success: true, data: formatData });
            case 'EMPLOYEE':
                const employee = await User.findOne({ email: user.email }, '-password');
                const employeeDetail = await Employee.findById({ _id: employee.employeeId }).populate('departmentId', 'name');
                const attendanceEmploy = await Attendance.find({ employeeId: employeeDetail._id });
                if (!attendanceEmploy) {
                    return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi chấm công!" });
                }
                const count = await Attendance.countDocuments({ employeeId: employeeDetail._id, status: 'LATE' })
                formatData = {
                    date: formatDate,
                    fullName: employeeDetail.fullName,
                    department: employeeDetail.departmentId.name,
                    position: employeeDetail.position,
                    workingDay: 22,
                    leaveBalance: 12,
                    leaveTaken: count,
                    overtime: attendanceEmploy.overtimeHours
                }
                return res.status(200).json({ success: true, data: formatData });
            default:
                return res.status(404).json({ success: false, message: "Chức vụ này chưa được đăng kí!" });
        }
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
        let expectedCheckInTime;
        if (localDate > morningEnd) {
            expectedCheckInTime = afternoonStart;
        } else {
            expectedCheckInTime = morningStart;
        }

        // Tính số phút đi muộn
        const lateMinutes = localDate > expectedCheckInTime ?
            Math.floor((localDate - expectedCheckInTime) / (1000 * 60)) : 0;

        // Xác định trạng thái
        const status = lateMinutes > 0 ? 'LATE' : 'PRESENT';

        // Tạo bản ghi chấm công mới
        const newAttendance = new Attendance({
            employeeId: employeeDetail._id,
            date: todayStart,
            checkIn: localDate,
            status: status,
            lateMinutes: lateMinutes,
            note: req.body.note || ''
        });

        await newAttendance.save();
        return res.status(200).json({
            success: true,
            message: 'Điểm danh vào làm thành công !',
            data: {
                checkInTime: localDate,
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
        const timeCheckout = new Date();
        attendance.checkOut = new Date(timeCheckout.getTime() - offset);

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
            console.log(start)
            const end = new Date(moment.tz(endDate, 'Asia/Ho_Chi_Minh').startOf('day').toDate().getTime() - offset);
            console.log(end)
            query.date = { $gte: start, $lte: end };
        }

        // Truy vấn dữ liệu
        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 })
            .populate('employeeId', 'name departmentId position');
        if (!attendanceRecords){
            return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi chấm công!" });
        }
        // Tính toán tổng kết
        const summary = {
            totalDays: attendanceRecords?.length,
            presentDays: attendanceRecords?.filter(r => r.status === 'PRESENT').length,
            lateDays: attendanceRecords?.filter(r => r.status === 'LATE').length,
            earlyLeaveDays: attendanceRecords?.filter(r => r.status === 'EARLY_LEAVE').length,
            absentDays: attendanceRecords?.filter(r => r.status === 'ABSENT').length,
            leaveDays: attendanceRecords?.filter(r => r.status === 'LEAVE').length,
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

        const newLeaveRequest = new Leave({
            employeeId: employee.employeeId,
            startDate: parseStartDate,
            endDate: parseEndDate,
            reason,
            status: 'Chờ duyệt'
        });

        await newLeaveRequest.save();

        const start = new Date(startDate);
        const end = new Date(endDate);
        let currentDate = new Date(start);
        const newAttendanceRecords = [];

        while (currentDate <= end) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const existingAttendance = await Attendance.findOne({
                employeeId: employee.employeeId,
                date: { $gte: new Date(dateStr), $lte: new Date(dateStr + ' 23:59:59') }
            });

            if (!existingAttendance) {
                newAttendanceRecords.push({
                    employeeId: employee.employeeId,
                    date: new Date(dateStr),
                    status: 'Nghỉ phép',
                    note: reason
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (newAttendanceRecords.length > 0) {
            await Attendance.insertMany(newAttendanceRecords);
        }

        return res.status(200).json({
            success: true,
            message: 'Gửi đơn nghỉ phép thành công!',
            data: {
                id: newLeaveRequest._id,
                startDate: format(newLeaveRequest.startDate, 'yyyy-MM-dd'),
                endDate: format(newLeaveRequest.endDate, 'yyyy-MM-dd'),
                reason: newLeaveRequest.reason,
                status: newLeaveRequest.status
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const toDoLeave = {}



module.exports = {
    getInformation,
    checkin,
    checkout,
    getAttendanceHistory,
    requestLeave,
    getAttendanceToday,
    toDoLeave
}
