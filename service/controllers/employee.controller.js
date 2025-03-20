const mongoose = require("mongoose");
const Employee = require("../models/employee");
const User = require("../models/user");
const Department = require("../models/department");
const { generatePassword, getUsernameFromEmail } = require("../utils/generate");
const { sendEmail } = require("../utils/email");
const { logActivity } = require("../utils/logger");

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
      hireDate,
    } = req.body;
    if (!email || !fullName || !departmentId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đủ thông tin !",
      });
    }
    const isValidEmail = await User.findOne({ email });
    if (isValidEmail)
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại trong hệ thống !",
        data: email,
      });
    const isValidPhone = await Employee.findOne({ phoneNumber });
    if (isValidPhone)
      return res.status(400).json({
        success: false,
        message: "Số điện thoại đã tồn tại trong hệ thống !",
        data: phoneNumber
      });
    const passwordRandom = generatePassword();
    const userName = await getUsernameFromEmail(email);
    const newUser = await User.create({
      username: userName,
      password: passwordRandom,
      email: email,
      role: "EMPLOYEE",
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
    await sendEmail(
      newUser.email,
      "Cấp Tài Khoản Đăng Nhập Hệ Thống",
      emailContent
    );
    await logActivity(
      req,
      "Create new employee",
      "EMPLOYEE",
      newEmployee._id,
      null,
      newEmployee
    );
    return res.status(201).json({
      success: true,
      message:
        "Đăng ký tài khoản nhân viên thành công, thông tin truy cập đã được gửi đến email của nhân viên !",
      data: newEmployee,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo tài khoản: " + error.message,
    });
  }
};
const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Nhân viên không tồn tại !",
      });
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
      isActive,
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
    ).populate("userId");
    if (updatedEmployee.userId?.role === "ADMIN") {
      await logActivity(
        req,
        "Update account admin",
        "ADMIN",
        employee._id,
        employee,
        updatedEmployee
      );
    }else{
      await logActivity(
        req,
        "Update employee",
        "EMPLOYEE",
        employee._id,
        employee,
        updatedEmployee
      );
    }
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin nhân viên thành công",
      data: updatedEmployee,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployee = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("departmentId")
      .populate("userId")
      .populate("departmentId");
    if (!employees)
      return res
        .status(404)
        .json({ success: false, message: "Danh sách nhân viên trống" });
    return res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
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
      page = 1,
      limit = 10,
    } = req.query;
    const userRequest = req.user;
    const filter = { isActive: true };
    if (userRequest.role === "EMPLOYEE") {
      const employee = await Employee.findOne({ userId: userRequest._id });
      const managedDepartment = await Department.findOne({
        managerId: employee._id,
      });
      if (!managedDepartment) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem danh sách nhân viên !",
        });
      }
      filter.departmentId = managedDepartment._id;
    }
    if (name) {
      filter.fullName = { $regex: name, $options: "i" };
    }
    if (department && userRequest.role === "ADMIN") {
      filter.departmentId = department;
    } 
    if (position) {
      filter.position = position;
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
      .populate("departmentId", "name")
      .populate("position", "name")
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
        totalPages: Math.ceil(totalEmployees / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi tìm kiếm nhân viên !",
      error: error.message,
    });
  }
};
const getEmployeeDetail = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId)
      .populate("departmentId")
      .populate("userId")
      .populate("position");
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Nhân viên không tồn tại" });
    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getEmployeePosition = async (req, res) => {
  try {
    const positions = await Employee.distinct("position");
    res.status(200).json({
      success: true,
      data: positions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
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
        message: "Nhân viên không tồn tại",
      });
    }
    if (employee.userId) {
      await User.findByIdAndUpdate(employee.userId._id, { isActive: 3 });
    }
    await logActivity(
      req,
      `Delete employee ${employee.fullName}`,
      "EMPLOYEE",
      employee._id,
      employee,
      null
    );
    return res.status(200).json({
      success: true,
      message: `Xóa nhân viên ${employee.fullName} thành công !`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.userId) {
      return res.status(404).json({
        success: false,
        message: "Nhân viên không tồn tại",
      });
    }
    const newPassword = generatePassword();
    const user = await User.findByIdAndUpdate(employee.userId._id, {
      isActive: 0,
    });
    user.password = newPassword;
    await user.save();
    const emailContent = `Hi ${employee.fullName}, Tài khoản của bạn vừa được yêu cầu reset mật khẩu ! Vui lòng sử dụng mật khẩu bên dưới để truy cập vào Hệ thống\nMật khẩu đăng nhập mới: ${newPassword}\nVui lòng đổi mật khẩu sau khi đăng nhập lần đầu !`;
    await sendEmail(user.email, "Reset Mật Khẩu Đăng Nhập", emailContent);
    await logActivity(
      req,
      `Reset password employee ${employee.fullName}`,
      "EMPLOYEE",
      employee._id,
      employee,
      employee
    );
    return res.status(200).json({
      success: true,
      message: `Reset mật khẩu nhân viên ${user.username} thành công !`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const changeAvatar = async (req, res) => {
  try {
    if (!req.cloudinaryUrl) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy file được tải lên !",
      });
    }
    const employeeId = req.params.employeeId;
    const avatarUrl = req.cloudinaryUrl;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { avatarUrl: avatarUrl },
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Nhân viên không tồn tại",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Cập nhật avatar nhân viên thành công !",
      data: { avatarUrl: avatarUrl },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
  getEmployee,
  filterEmployee,
  getEmployeeDetail,
  getEmployeePosition,
  removeEmployee,
  resetPassword,
  changeAvatar,
};
