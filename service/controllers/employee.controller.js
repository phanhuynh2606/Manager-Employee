const Employee = require('../models/employee');
const User = require('../models/user');
const { generatePassword } = require('../utils/generate');
const { sendEmail } = require('../utils/email');
const { logActivity } = require('../utils/logger');
const createEmployee = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            fullName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            departmentId,
            position,
            baseSalary,
            hireDate,
            leaveBalance
        } = req.body;
        if (!username || !email || !fullName || !departmentId) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp đủ thông tin !",
          });
        }
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại trong hệ thống !' });
        const passwordRandom = generatePassword();
        const newUser = await User.create({
            username,
            passwordRandom,
            email,
            role: 'EMPLOYEE',
            password: req.body.password
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
          leaveBalance: leaveBalance,
        });
        await User.findByIdAndUpdate(newUser._id, { employeeId: newEmployee._id });
        const emailContent = `Hi ${newEmployee.fullname}, Tài khoản của bạn vừa được đăng ký thành công ! Vui lòng sử dụng thông tin bên dưới để truy cập vào Hệ thống\n
                        Tài khoản đăng nhập: ${newUser.username}\nMật khẩu đăng nhập: ${newUser.passwordRandom}\nVui lòng đổi mật khẩu sau khi đăng nhập lần đầu !`;
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
        ).populate('departmentId', 'name');
        await logActivity(req, "Update employee", 'employees', newEmployee._id, employee, updatedEmployee);
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
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
const getEmployeeDetail = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployee,
    getEmployeeDetail
};