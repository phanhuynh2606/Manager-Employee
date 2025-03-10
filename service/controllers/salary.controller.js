const Salary = require("../models/salary");
const Employee = require("../models/employee");
const User = require("../models/user");


//thêm bảng lương
const addSalary = async (req, res) => {
    try {
        const { employeeId, year, month, baseSalary, allowances, bonuses, deductions, periodStart, periodEnd, paymentDate, note } = req.body;

        if (!employeeId || !year || !month || !baseSalary) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const createdBy = req.user._id;

        const existingSalary = await Salary.findOne({ employeeId, year, month });
        if (existingSalary) {
            return res.status(400).json({ error: "Salary record already exists for this employee in the selected month and year" });
        }

        const salary = new Salary({
            employeeId,
            year,
            month,
            baseSalary,
            allowances: allowances || [],
            bonuses: bonuses || [],
            deductions: deductions || [],
            periodStart,
            periodEnd,
            paymentDate,
            createdBy: createdBy,
            note: note || "",
            status: 'DRAFT',
        });

        const user = await Employee.findById({ _id: employeeId });
        if (!user) return res.status(400).json({ success: false, message: 'Employee not found !' });

        await salary.save();
        res.status(201).json({ success: true, data: salary });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//danh sách bảng lương
const getSalary = async (req, res) => {
    try {
        const { search, month, year, status } = req.query;

        let filter = {};
        if (month) {
            filter.month = month;
        }
        if (year) {
            filter.year = year;
        }
        if (status) {
            filter.status = status;
        }

        let salaries = await Salary.find(filter).populate('employeeId').populate('createdBy');

        if (search) {
            let query = search.trim().toLowerCase();
            salaries = salaries.filter(salary =>
                String(salary.employeeId?.fullName || "").toLowerCase().includes(query)
            );
        }


        res.status(200).json({ success: true, data: salaries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//lấy chi tiết bảng lương
const getSalaryById = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id).populate('employeeId').populate('createdBy');
        res.status(200).json({ success: true, data: salary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//chỉnh sửa bảng lương
const updateSalary = async (req, res) => {
    try {
        const { baseSalary, allowances, bonuses, deductions, note } = req.body;

        const salary = await Salary.findById(req.params.id);
        if (!salary) return res.status(404).json({ error: 'Salary not found' });

        if (baseSalary !== undefined) salary.baseSalary = baseSalary;
        if (allowances !== undefined) salary.allowances = allowances;
        if (bonuses !== undefined) salary.bonuses = bonuses;
        if (deductions !== undefined) salary.deductions = deductions;
        if (note !== undefined) salary.note = note;
        await salary.save();

        res.status(200).json({ success: true, data: salary });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//xoa bảng lương
const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);
        if (!salary) return res.status(404).json({ error: 'Salary not found' });

        if (salary.status !== 'DRAFT') {
            return res.status(400).json({ error: 'Just draft salary can be deleted' });
        }

        await salary.deleteOne();
        res.status(200).json({ message: 'Salary deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//cập nhật trạng thái bảng lương
const updateSalaryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['DRAFT', 'APPROVED', 'PAID'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const salary = await Salary.findById(req.params.id);
        if (!salary) return res.status(404).json({ error: 'Salary not found' });

        if (salary.status === 'PAID') {
            return res.status(400).json({ error: 'Paid salary cannot be updated' });
        }

        salary.status = status;

        if (status === 'PAID' && salary.paymentDate !== "PAID") {
            salary.paymentDate = new Date();
        }

        await salary.save();
        res.status(200).json({ success: true, data: salary });
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
    updateSalaryStatus,
};