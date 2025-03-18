const Salary = require("../models/salary");
const Employee = require("../models/employee");
const User = require("../models/user");
const moment = require('moment-timezone');


//thêm bảng lương
const WORKING_DAYS_PER_MONTH = 22;
const WORKING_HOURS_PER_DAY = 8;
const now = new Date();

const addSalary = async (employeeId, workingHours, overtimeHours, earlyLeaveMinutes, checkout, checkIn) => {
    try {
        const currentDate = moment().tz('Asia/Ho_Chi_Minh').toDate();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const date = currentDate.getDate();
        const lastDayOfMonth = moment().tz('Asia/Ho_Chi_Minh').endOf('month').toDate();
        console.log('11111', checkIn),
            console.log('222', checkout)

        const employee = await Employee.findById(employeeId);
        if (!employee || !employee.baseSalary) {
            console.error(`Không tìm thấy mức lương cơ bản của nhân viên ID: ${employeeId}`);
            return;
        }

        const baseSalary = employee.baseSalary;
        const dailyRate = baseSalary / WORKING_DAYS_PER_MONTH;
        const hourlyRate = dailyRate / WORKING_HOURS_PER_DAY;
        const dailySalary = workingHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.6;

        let earlyLeavePenalty = 0;
        if (earlyLeaveMinutes > 0) {
            earlyLeavePenalty = -50000;
        }

        //tính tổng lương trong 1 ngày
        const totalSalary = dailySalary + overtimePay + earlyLeavePenalty;

        let salary = await Salary.findOne({ employeeId, year, month });

        if (!salary) {
            salary = new Salary({
                employeeId: employeeId,
                year: year,
                month: month,
                baseSalary: baseSalary,
                allowances: [],
                bonuses: [],
                deductions: [],
                totalSalary: totalSalary,
                periodStart: new Date(year, month - 1, 1),
                periodEnd: lastDayOfMonth,
                paymentDate: lastDayOfMonth,
                note: '',
                daySalary: [
                    {
                        day: date,
                        overTimeHours: overtimeHours,
                        workingHours: workingHours,
                        periodStart: currentDate,
                        periodEnd: currentDate,
                        salary: totalSalary
                    }
                ]
            });
        } else {
            salary.daySalary.push({
                day: date,
                overTimeHours: overtimeHours,
                workingHours: workingHours,
                periodStart: checkIn,
                periodEnd: checkout,
                salary: totalSalary
            });
        }

        allowances = salary.allowances.reduce((sum, item) => sum + item.amount, 0);
        bonuses = salary.bonuses.reduce((sum, item) => sum + item.amount, 0);
        deductions = salary.deductions.reduce((sum, item) => sum + item.amount, 0);

        // Cập nhật tổng lương của tháng
        salary.totalSalary = salary.daySalary.reduce((sum, day) => sum + day.salary, 0) + allowances + bonuses - deductions;

        await salary.save();
    } catch (error) {
        console.error("Lỗi khi tạo bảng lương hàng ngày:", error.message);
        throw error;
    }
};



//danh sách bảng lương
const getSalary = async (req, res) => {
    try {
        let salaries;

        const { search, month, year } = req.query;

        let filter = {};
        if (month) {
            filter.month = month;
        }
        if (year) {
            filter.year = year;
        }

        if (req.user.role === 'ADMIN') {
            salaries = await Salary.find(filter).populate('employeeId');
            if (search) {
                let query = search.trim().toLowerCase();
                salaries = salaries.filter(salary =>
                    String(salary.employeeId?.fullName || "").toLowerCase().includes(query)
                );
            }
        } else {
            const employee = await User.findById(req.user._id);
            salaries = await Salary.find({ employeeId: employee.employeeId }, filter).populate('employeeId');
            if (search) {
                let query = search.trim().toLowerCase();
                salaries = salaries.filter(salary =>
                    String(salary.employeeId?.fullName || "").toLowerCase().includes(query)
                );
            }
        }

        return res.status(200).json({ success: true, data: salaries });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//lấy chi tiết bảng lương
const getSalaryById = async (req, res) => {
    try {
        const salaries = await Salary.findById(req.params.id).populate('employeeId');

        if (!salaries) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bảng lương' });
        }
        return res.status(200).json({ success: true, data: salaries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//chỉnh sửa bảng lương
const updateSalary = async (req, res) => {
    try {
        const { allowances, bonuses, deductions, totalSalary, note } = req.body;

        const salary = await Salary.findById(req.params.id);
        if (!salary) return res.status(404).json({ error: 'Không tìm thấy bảng lương' });

        if (allowances !== undefined) salary.allowances = allowances;
        if (bonuses !== undefined) salary.bonuses = bonuses;
        if (deductions !== undefined) salary.deductions = deductions;
        if (note !== undefined) salary.note = note;
        if (totalSalary !== undefined) salary.totalSalary = totalSalary;
        await salary.save();

        res.status(200).json({ success: true, data: salary });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//xóa bảng lương
const deleteSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { salaryId } = req.body;

        // Kiểm tra nếu không có salaryId
        if (!salaryId) {
            return res.status(400).json({ error: "Thiếu salaryId trong request" });
        }

        const salary = await Salary.findById(id);
        if (!salary) return res.status(404).json({ error: 'Không tìm thấy bảng lương' });

        if (!salary.daySalary || !Array.isArray(salary.daySalary)) {
            return res.status(500).json({ error: "Dữ liệu bảng lương không hợp lệ" });
        }

        if (salary.daySalary.length <= 1) return res.status(404).json({ success: false, error: 'Không xóa được bảng lương' });

        // Kiểm tra salaryId có tồn tại không
        const exists = salary.daySalary.some(item => item._id.toString() === salaryId.toString());
        if (!exists) return res.status(404).json({ success: false, error: "Không tìm thấy ngày công để xóa" });

        // Xóa phần tử có salaryId
        const beforeDelete = salary.daySalary.length;
        salary.daySalary = salary.daySalary.filter(item => item._id.toString() !== salaryId.toString());
        const afterDelete = salary.daySalary.length;

        if (beforeDelete === afterDelete) {
            return res.status(400).json({ error: "Xóa thất bại, có thể salaryId không tồn tại" });
        }

        // Cập nhật lại tổng lương
        const allowances = salary.allowances.reduce((sum, item) => sum + item.amount, 0);
        const bonuses = salary.bonuses.reduce((sum, item) => sum + item.amount, 0);
        const deductions = salary.deductions.reduce((sum, item) => sum + item.amount, 0);

        salary.totalSalary = salary.daySalary.reduce((sum, item) => sum + item.salary, 0) + allowances + bonuses - deductions;

        // Lưu lại vào database
        await salary.save();

        res.status(200).json({ success: true, message: 'Xóa ngày công trong bảng lương thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    getSalary,
    addSalary,
    getSalaryById,
    updateSalary,
    deleteSalary,
};