const Department = require("../models/department");
const Employee = require("../models/employee");
const Notification = require("../models/notification");
const { logActivity } = require("../utils/logger");
const sendNotification = require("../utils/sendNotification");

// Tạo phòng ban
const createDepartment = async (req, res) => {
  const { name, description, roomNumber, managerId } = req.body;
  if (!name || !roomNumber) {
    return res.status(400).json({
      success: false,
      message: "Name and room number are required",
    });
  }
  const departmentExist = await Department.findOne
  ({ name: name });
  if (departmentExist) {
    return res.status(400).json({
      success: false,
      message: "Department already exists",
    });
  }
  try {
    const department = await Department.create({
      name,
      description,
      roomNumber,
      managerId,
      createBy: req.user._id,
    });
    const employee = await Employee.findById(managerId);
    if (employee) {
      employee.departmentId = department._id;
      if(managerId){
        const notification = await Notification.create({
          title: "Thông báo",
          content: `Bạn đã được bổ nhiệm làm trưởng phòng ${department.name}`,
          recipientId: managerId,
          createdBy: req.user._id,
          type: "PERSONAL",
        });
        const notificationObject = notification.toObject();
        notificationObject.createdBy = req.user?.employeeId?.fullName;
        if(notification){
          sendNotification(notification);
        }
      }
      await employee.save();
      await logActivity(req, "Create new department", "DEPARTMENT", department._id, null, department);
    }

    return res.status(201).json({ success: true, data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Xem danh sách phòng ban
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ deleted: false }).populate(
      "managerId",
      "fullName avatarUrl"
    );
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xem thông tin phòng ban theo id
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    return res.status(200).json({ success: true, data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Cap nhat phong ban
const updateDepartment = async (req, res) => {
  try {
    const { managerId } = req.body;
    const oldDepartment = await Department.findById(req.params.id);
    if (!oldDepartment) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    if(managerId){
      const departmentManager = await Department.findOne({
        managerId: managerId,
      });
      if(departmentManager){
        departmentManager.managerId = null;
        await departmentManager.save();
      }
    }
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if(managerId){
      const notification = await Notification.create({
        title: "Thông báo",
        content: `Bạn đã được bổ nhiệm làm trưởng phòng ${department.name}`,
        recipientId: managerId,
        createdBy: req.user._id,
        type: "PERSONAL",
      });
      const notificationObject = notification.toObject();
      notificationObject.createdBy = req.user?.employeeId?.fullName;
      if(notification){
        sendNotification(notification);
      }
    }
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    const employee = await Employee.findById(department.managerId);
    if (employee) {
      employee.departmentId = department._id;
      await employee.save();
      await logActivity(req, "Update department", "DEPARTMENT", department._id,oldDepartment , department);
    }
    return res.status(200).json({ success: true, data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa phòng ban
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    return res
      .status(200)
      .json({
        success: true,
        message: "Department deleted successfully",
        data: department,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Gán nhân viên vào phòng ban
const asignEmployeeToDepartment = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    employee.departmentId = department._id;
    await employee.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Employee assigned to department successfully",
        data: employee,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Xem danh sách nhân viên theo phòng ban
const getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.find({ department: req.params.id });
    return res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeEmployeeFromDepartment = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    employee.departmentId = null;
    await employee.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Employee removed from department successfully",
        data: employee,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getEmployeeByManager = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("departmentId", "-createdAt -updatedAt -__v -deleted")
      .populate("userId","email")
      .select("fullName email departmentId avatarUrl position userId");
    if (!employees)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    // Lấy danh sách trưởng phòng
    const departments = await Department.find({
      managerId: { $ne: null },
    }).select("managerId name");
    const managerMap = new Map(
      departments.map((dep) => [dep.managerId.toString(), dep.name])
    );

    // Gắn thông tin trưởng phòng nếu có
    const employeesWithRole = employees.map((emp) => {
      const isManager = managerMap.get(emp._id.toString());
      return {
        ...emp.toObject(),
        roler: isManager ? `Trưởng phòng ${isManager}` : `Nhân viên ${emp?.departmentId?.name}`,
      };
    });
    return res.status(200).json({
      success: true,
      data: employeesWithRole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  asignEmployeeToDepartment,
  getEmployeesByDepartment,
  removeEmployeeFromDepartment,
  getEmployeeByManager,
};
