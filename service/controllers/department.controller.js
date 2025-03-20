const Department = require("../models/department");
const employee = require("../models/employee");
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
        const userSend = await User.findById(notification.createdBy).populate('employeeId',"fullName avatarUrl" )
        const notificationObject = notification.toObject();
        notificationObject.createdBy = {
          fullName: userSend.employeeId.fullName,
          avatarUrl: userSend.employeeId.avatarUrl
        };
        if(notification){
          sendNotification(notificationObject);
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
        sendNotification(notificationObject);
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
      .populate("userId", "email role")
      .select("fullName email departmentId avatarUrl position userId");
    if (!employees) return res.status(404).json({ success: false, message: "Employee not found" });

    // Lấy danh sách trưởng phòng
    const departments = await Department.find({
      managerId: { $ne: null },
    }).select("managerId name");
    const managerMap = new Map(departments.map((dep) => [dep.managerId.toString(), dep.name]));
    const filterEmployee = employees.filter((emp) => emp.userId?.role === "EMPLOYEE");
    // Gắn thông tin trưởng phòng nếu có
    const employeesWithRole = filterEmployee.map((emp) => {
      const isManager = managerMap.get(emp._id.toString());
      return {
        ...emp.toObject(),
        roler: isManager ? `Trưởng phòng ${isManager}` : `Nhân viên ${emp?.departmentId?.name}`,
      };
    });
    // Sắp xếp: Trưởng phòng lên trước, sau đó sắp theo tên
    employeesWithRole.sort((a, b) => {
      // Đảm bảo `isManager` là Boolean
      const isManagerA = a.roler.startsWith("Trưởng phòng") ? 1 : 0;
      const isManagerB = b.roler.startsWith("Trưởng phòng") ? 1 : 0;

      // So sánh: Trưởng phòng lên trước
      if (isManagerA !== isManagerB) {
        return isManagerB - isManagerA;
      }

      // Nếu cùng vai trò, sắp xếp theo tên
      return a.fullName.localeCompare(b.fullName, "vi", { sensitivity: "base" });
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

const asignEmployeesToDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const { employeeIds } = req.body;
  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    const employees = await Employee.find({ _id: { $in: employeeIds }});

    if (employees?.length !== employeeIds?.length) {
      return res.status(404).json({ success: false, message: 'Some employees not found' });
    }
    // Gán nhân viên vào phòng ban
    await Employee.updateMany({ _id: { $in: employeeIds } }, { departmentId });
     // Cập nhật các phòng ban khác nếu nhân viên được gán là manager
     for (const emp of employees) {
      await Department.updateMany({ managerId: emp._id }, { managerId: null });
    }
    res.status(200).json({ success: true, message: 'Employees assigned successfully' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
const getEmployeesOtherDepartments = async (req, res) => {
  try {
    const employees = await Employee.find({ departmentId: { $ne: req.params.departmentId }}  
    )
    .populate('userId', 'role');
    const filteredEmployees = employees?.filter(emp => emp.userId.role === 'EMPLOYEE');

    return res.status(200).json({
      success: true,
      data: filteredEmployees,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
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
  getEmployeesOtherDepartments,
  asignEmployeesToDepartment
};
