const Employee = require('../models/employee');
const User = require('../models/user');
const Department = require('../models/department');
const Attendance = require('../models/attendance');
const os = require('os');

const configTimeWork = {
    workStartTime : { hour: 8, minute: 30 },
     morningStartTime : { hour: 8, minute: 30 },
     morningEndTime : { hour: 12, minute: 0 },
     afternoonStartTime : { hour: 13, minute: 30 },
     afternoonEndTime : { hour: 18, minute: 0 },
     minWorkingHours : 8
}


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
    try {
        const user = req.body.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "Must be login!" });
        }
        const role = user.role;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;;
        const normalizedIp = ip.replace('::ffff:', '');
        console.log(ip)
        console.log(normalizedIp);
        let formatData;
        switch (role) {
            case 'ADMIN':
                const admin = await User.find({ role: 'EMPLOYEE' }, '-password' );
                const employeeIds = admin.map(user => user.employeeId);
                const departmentId = employeeIds.map(employee => employee.departmentId);
                const department = await Department.find({ _id: { $in: departmentId } });
                const employees = await Employee.find({ _id: { $in: employeeIds } });
                formatData = employees.map(employee => {
                    return {
                        fullName: employee.fullName,
                        dateOfBirth: employee.dateOfBirth,
                        gender: employee.gender,
                        address: employee.address,
                        phoneNumber: employee.phoneNumber,
                        department: department.name,
                        position: employee.position,
                        baseSalary: employee.baseSalary,
                        avatarUrl: employee.avatarUrl,
                    }
                });
                return res.status(200).json({ success: true, data: formatData });
            case 'EMPLOYEE':
                const employee = await User.findById({ _id: user._id }, '-password');
                const employeeDetail = await Employee.findById({ _id: employee.employeeId }).populate('departmentId', 'name');
                 formatData = {
                    fullName: employeeDetail.fullName,
                    dateOfBirth: employeeDetail.dateOfBirth,
                    gender: employeeDetail.gender,
                    address: employeeDetail.address,
                    phoneNumber: employeeDetail.phoneNumber,
                    department: employeeDetail.departmentId.name,
                    position: employeeDetail.position,
                    baseSalary: employeeDetail.baseSalary,
                    avatarUrl: employeeDetail.avatarUrl,
                }
                return res.status(200).json({ success: true, data: formatData });
            default:
                return res.status(404).json({ success: false, message: "Role not register!" });
        }
    }catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

const checkin = async (req, res) => {
    try {
        const user = req.body.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Must be logged in!" });
        }

        // Lấy thông tin nhân viên
        const employee = await User.findById({ _id: user._id }, '-password');
        if (!employee || !employee.employeeId) {
            return res.status(404).json({ success: false, message: "Employee not found!" });
        }

        const employeeDetail = await Employee.findById({ _id: employee.employeeId });
        if (!employeeDetail) {
            return res.status(404).json({ success: false, message: "Employee details not found!" });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            employeeId: employeeDetail._id,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        if (attendance) {
            return res.status(400).json({ success: false, message: "You have already checked in today!" });
        }
        // Lấy giờ hiện tại cho checkin
        const now = new Date();

        const expectedCheckInTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            configTimeWork.workStartTime.hour,
            configTimeWork.workStartTime.minute
        );

        // Tính số phút đi muộn
        const lateMinutes = now > expectedCheckInTime ?
            Math.floor((now - expectedCheckInTime) / (1000 * 60)) : 0;

        // Xác định trạng thái
        const status = lateMinutes > 0 ? 'LATE' : 'PRESENT';

        // Tạo bản ghi chấm công mới
        const newAttendance = new Attendance({
            employeeId: employeeDetail._id,
            date: todayStart,
            checkIn: now,
            status: status,
            lateMinutes: lateMinutes,
            note: req.body.note || ''
        });

        await newAttendance.save();
        return res.status(200).json({
            success: true,
            message: 'Check-in successful!',
            data: {
                checkInTime: now,
                status: status,
                lateMinutes: lateMinutes
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

const checkout = async (req, res) => {
    try {
        const user = req.body.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Must be logged in!" });
        }

        const employee = await User.findById(user._id, '-password');
        if (!employee || !employee.employeeId) {
            return res.status(404).json({ success: false, message: "Employee not found!" });
        }

        const employeeDetail = await Employee.findById(employee.employeeId);
        if (!employeeDetail) {
            return res.status(404).json({ success: false, message: "Employee details not found!" });
        }

        // Lấy ngày hiện tại
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Tìm bản ghi chấm công ngày hôm nay
        const attendance = await Attendance.findOne({
            employeeId: employeeDetail._id,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        if (!attendance) {
            return res.status(400).json({ success: false, message: "You have not checked in today!" });
        }

        if (attendance?.checkOut) {
            return res.status(400).json({ success: false, message: "You have already checked out today!" });
        }
        // Lấy thời gian hiện tại để checkout
        const now = new Date();
        attendance.checkOut = now;

        // Tạo các mốc thời gian quan trọng trong ngày
        const morningStart = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            configTimeWork.morningStartTime.hour, configTimeWork.morningStartTime.minute
        );
        const morningEnd = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            configTimeWork.morningEndTime.hour, configTimeWork.morningEndTime.minute
        );
        const afternoonStart = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            configTimeWork.afternoonStartTime.hour, configTimeWork.afternoonStartTime.minute
        );
        const afternoonEnd = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            configTimeWork.afternoonEndTime.hour, configTimeWork.afternoonEndTime.minute
        );

        // Tính giờ làm buổi sáng
        let morningHours = 0;
        if (attendance?.checkIn <= morningEnd &&
            (attendance?.checkIn >= morningStart || attendance?.status === 'LATE')) {
            const morningCheckOutTime = attendance.checkOut <= morningEnd ?
                attendance.checkOut : morningEnd;
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
        console.log("totalWorkingHours", totalWorkingHours);
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
        let message = "Check-out successful!";

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
                performanceScore: workingRatio
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getAttendanceHistory = async (req, res) => {
    try {
        const user = req.body.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Must be logged in!" });
        }

        const { startDate, endDate, employeeId } = req.body.data;

        // Xác định employeeId để truy vấn
        let targetEmployeeId;

        // Nếu là admin hoặc HR và có truyền employeeId, sử dụng employeeId đó
        if ((user.role === 'ADMIN') && employeeId) {
            targetEmployeeId = employeeId;
        } else {
            // Ngược lại, chỉ xem dữ liệu của bản thân
            const employee = await User.findById(user._id, '-password');
            if (!employee || !employee.employeeId) {
                return res.status(404).json({ success: false, message: "Employee not found!" });
            }
            targetEmployeeId = employee.employeeId;
        }

        // Tạo điều kiện truy vấn
        const query = { employeeId: targetEmployeeId };

        // Thêm điều kiện ngày nếu có
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            query.date = { $gte: start, $lte: end };
        }

        // Truy vấn dữ liệu
        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 })
            .populate('employeeId', 'name departmentId position');
        if (!attendanceRecords){
            return res.status(404).json({ success: false, message: "No attendance records found!" });
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
            data: {
                records: attendanceRecords,
                summary
            }
        });
    } catch (err) {
        console.error('Get attendance history error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

const requestLeave = {}

const toDoLeave = {}



module.exports = {
    getInformation,
    checkin,
    checkout,
    getAttendanceHistory,
    requestLeave,
    toDoLeave
}
