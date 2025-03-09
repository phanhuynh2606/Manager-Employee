const mongoose = require('mongoose');
const Employee = require('../models/employee');
const User = require('../models/user');
const Department = require('../models/department');
const { generatePassword, generateUsername } = require('../utils/generate');
const { sendEmail } = require('../utils/email');
const { logActivity } = require('../utils/logger');
const createEmployee = async (req, res) => {
    try {
        const {
            email,
            fullName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            departmentId,
            position,
            baseSalary,
            hireDate
        } = req.body;
        if (!email || !fullName || !departmentId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đủ thông tin !",
            });
        }
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'Email đã tồn tại trong hệ thống !' });
        const passwordRandom = generatePassword();
        const userName = await generateUsername(fullName);
        const newUser = await User.create({
            username: userName,
            password: passwordRandom,
            email: email,
            role: 'EMPLOYEE',
        });
        const newEmployee = await Employee.create({
            userId: newUser._id,
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            address,
            phoneNumber,
            departmentId,
            position,
            baseSalary: parseFloat(baseSalary),
            hireDate: new Date(hireDate),
            isActive: true,
        });
        await User.findByIdAndUpdate(newUser._id, { employeeId: newEmployee._id });
        const emailContent = `Hi ${newEmployee.fullName}, Tài khoản của bạn vừa được đăng ký thành công ! Vui lòng sử dụng thông tin bên dưới để truy cập vào Hệ thống\nTài khoản đăng nhập: ${newUser.email}\nMật khẩu đăng nhập: ${passwordRandom}\nVui lòng đổi mật khẩu sau khi đăng nhập lần đầu !`;
        await sendEmail(newUser.email, 'Cấp Tài Khoản Đăng Nhập Hệ Thống', emailContent);
        await logActivity(req,"CREATE", "Create new employee", 'employees', newEmployee._id, null, newEmployee);
        return res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản nhân viên thành công, thông tin truy cập đã được gửi đến email của nhân viên !',
            data: newEmployee
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi tạo tài khoản: ' + error.message
        });
    }
}
const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Nhân viên không tồn tại !'
            })
        }
        const {
            fullName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            departmentId,
            position,
            baseSalary,
            hireDate,
            isActive
        } = req.body;
        const employeeData = {};
        if (fullName) employeeData.fullName = fullName;
        if (dateOfBirth) employeeData.dateOfBirth = new Date(dateOfBirth);
        if (gender) employeeData.gender = gender;
        if (address) employeeData.address = address;
        if (phoneNumber) employeeData.phoneNumber = phoneNumber;
        if (departmentId) employeeData.departmentId = departmentId;
        if (position) employeeData.position = position;
        if (baseSalary) employeeData.baseSalary = parseFloat(baseSalary);
        if (hireDate) employeeData.hireDate = new Date(hireDate);
        if (isActive !== undefined) employeeData.isActive = isActive;
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: employeeData },
            { new: true }
        );
        await logActivity(req, "Update employee", 'employees', employee._id, employee, updatedEmployee);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin nhân viên thành công',
            data: updatedEmployee
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getEmployee = async (req, res) => {
    try {
        const employees = await Employee.find().populate('departmentId').populate('userId');
        if (!employees) return res.status(404).json({ success: false, message: 'Danh sách nhân viên trống' });
        return res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
const filterEmployee = async (req, res) => {
    try {
        const {
            name,
            department,
            position,
            gender,
            salaryMin,
            salaryMax,
            hireDateFrom,
            hireDateTo,
            page,
            limit
        } = req.query;
        const filter = { isActive: true };
        if (name) {
            filter.fullName = { $regex: name, $options: 'i' };
        }
        if (department) {
            filter.departmentId = department;
        }
        if (position) {
            filter.position = { $regex: position, $options: 'i' };
        }
        if (gender) {
            filter.gender = gender;
        }
        if (salaryMin || salaryMax) {
            filter.baseSalary = {};
            if (salaryMin) filter.baseSalary.$gte = parseInt(salaryMin);
            if (salaryMax) filter.baseSalary.$lte = parseInt(salaryMax);
        }
        if (hireDateFrom || hireDateTo) {
            filter.hireDate = {};
            if (hireDateFrom) filter.hireDate.$gte = new Date(hireDateFrom);
            if (hireDateTo) filter.hireDate.$lte = new Date(hireDateTo);
        }
        const totalEmployees = await Employee.countDocuments(filter);
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const employees = await Employee.find(filter)
            .populate('departmentId', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ fullName: 1 });
        res.json({
            success: true,
            data: employees,
            pagination: {
                total: totalEmployees,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalEmployees / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error searching employees:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching employees',
            error: error.message
        });
    }
}
const getEmployeeDetail = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const employee = await Employee.findById(employeeId).populate('departmentId').populate('userId');
        if (!employee) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });
        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
const getEmployeePosition = async (req, res) => {
    try {
        const positions = await Employee.distinct('position');
        res.status(200).json({
            success: true,
            data: positions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const removeEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params; 
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        if (employee.userId) {
            await User.findByIdAndUpdate(employee.userId._id, { isActive: 3 });
        }
        console.log(employee)
        return res.status(200).json({
            success: true,
            message: `Xóa nhân viên ${employee.fullName} thành công !`, 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployee,
    filterEmployee,
    getEmployeeDetail,
    getEmployeePosition,
    removeEmployee
};