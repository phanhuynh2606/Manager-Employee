
const User = require('../models/user');
const Employee = require('../models/employee');
const { generatePassword, getUsernameFromEmail } = require('../utils/generate');
const { sendEmail } = require('../utils/email');
const { logActivity } = require('../utils/logger');
const createAdmin = async (req, res) => {
  try {
    const {
      email,
      fullName,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      hireDate
    } = req.body;
    if (!email || !fullName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đủ thông tin !",
      });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'Email đã tồn tại trong hệ thống !' });
    const passwordRandom = generatePassword();
    const userName = await getUsernameFromEmail(email);
    const newUser = await User.create({
      username: userName,
      password: passwordRandom,
      email: email,
      role: 'ADMIN',
    });
    const newEmployee = await Employee.create({
      userId: newUser._id,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address,
      phoneNumber,
      hireDate: new Date(hireDate),
      isActive: true,
    });
    await User.findByIdAndUpdate(newUser._id, { employeeId: newEmployee._id });
    const emailContent = `Hi ${newEmployee.fullName}, Tài khoản của bạn vừa được đăng ký thành công ! Vui lòng sử dụng thông tin bên dưới để truy cập vào Hệ thống\nTài khoản đăng nhập: ${newUser.email}\nMật khẩu đăng nhập: ${passwordRandom}\nVui lòng đổi mật khẩu sau khi đăng nhập lần đầu !`;
    await sendEmail(newUser.email, 'Cấp Tài Khoản Đăng Nhập Hệ Thống', emailContent);
    await logActivity(req, "Create new account admin", 'ADMIN', newEmployee._id, null, newEmployee);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản quản trị thành công, thông tin truy cập đã được gửi đến email!',
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

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "ADMIN" ,isActive: { $nin: '3' }}).populate('employeeId');

    const adminFormatted = admins.map(admin => {
      return {
        id: admin._id,
        fullName: admin.employeeId.fullName,
        email: admin.email,
        phoneNumber: admin.employeeId.phoneNumber,
        avatarUrl: admin.employeeId.avatarUrl,
        isActive: admin.isActive,
        gender: admin.employeeId.gender,
        dateOfBirth: admin.employeeId.dateOfBirth,
        createdAt: admin.createdAt,
        address: admin.employeeId?.address,
        departmentId: admin.employeeId.departmentId,
      }
    });
    return res.status(200).json({
      success: true,
      data: adminFormatted
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách quản trị viên: ' + error.message
    });
  }
}

const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const admin = await User.findById(id).populate('employeeId');
    if (!admin) return res.status(404).json({ success: false, message: 'Không tìm thấy quản trị viên !' });
    const adminFormatted = {
      id: admin.employeeId._id,
      fullName: admin.employeeId.fullName,
      username: admin.username,
      email: admin.email,
      phoneNumber: admin.employeeId.phoneNumber,
      avatarUrl: admin.employeeId.avatarUrl,
      isActive: admin.isActive,
      gender: admin.employeeId.gender,
      dateOfBirth: admin.employeeId.dateOfBirth,
      createdAt: admin.createdAt,
      address: admin.employeeId?.address,
      departmentId: admin.employeeId.departmentId,
      employeeId: admin.employeeId._id,
    }
    return res.status(200).json({
      success: true,
      data: adminFormatted
    });
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy thông tin quản trị viên: ' + error.message
    });
  }
}

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      gender,
      isActive,
      fullName, dateOfBirth
    } = req.body;
    const admin = await User.findById(id).populate('employeeId');
    if (!admin) return res.status(404).json({ success: false, message: 'Không tìm thấy quản trị viên !' });
    const updatedAdmin = await User.findByIdAndUpdate
      (id, { email, fullName, dateOfBirth }, { new: true });
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin quản trị viên thành công !',
      data: updatedAdmin
    });
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật thông tin quản trị viên: ' + error.message
    });
  }
}

const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id).populate('employeeId');
    if (!admin) return res.status(404).json({ success: false, message: 'Không tìm thấy quản trị viên !' });
    await User.findByIdAndUpdate({ _id: admin._id }, { isActive: "3" });
    return res.status(200).json({
      success: true,
      message: 'Xóa quản trị viên thành công !'
    });
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xóa quản trị viên: ' + error.message
    });
  }
}

const lockAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id).populate('employeeId');
    if (!admin) return res.status(404).json({ success: false, message: 'Không tìm thấy quản trị viên !' });
    await User.findByIdAndUpdate({ _id: admin._id }, { isActive: "2" });
    return res.status(200).json({
      success: true,
      message: 'Khóa tài khoản quản trị viên thành công !'
    });
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi khóa tài khoản quản trị viên: ' + error.message
    });
  }
}
const unlockAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id).populate('employeeId');
    if (!admin) return res.status(404).json({ success: false, message: 'Không tìm thấy quản trị viên !' });
    await User.findByIdAndUpdate({ _id: admin._id }, { isActive: "1" });
    return res.status(200).json({
      success: true,
      message: 'Mở khóa tài khoản quản trị viên thành công !'
    });
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi mở khóa tài khoản quản trị viên: ' + error.message
    });
  }
}
module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  removeAdmin,
  lockAccount,
  unlockAccount
};