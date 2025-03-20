const Log = require("../models/log");
const Department = require("../models/department");
const User = require("../models/user");
const Employee = require("../models/employee");
module.exports.getAllLog =async (req,res)=> {
    const role = req.user.role
    const {sort,page,limitItem,startDate,endDate,entityType } = req.body;
    const find={};
    if(startDate) {
        find.createdAt={
            $gt: new Date(startDate)
        }
    }
    // Filter theo entityType
    if (entityType) {
        find.entityType = entityType;
    }
    if (endDate) {
        if (!find.createdAt) {
          find.createdAt = {};
        }
        find.createdAt.$lt = new Date(endDate);
    }
    if(role==="EMPLOYEE") {
        find._id= req.user._id;
    }
    const allLog = await Log.find(find).skip((page-1)*limitItem).limit(limitItem).sort(sort).populate({
        path:"userId",
        populate:{
            path:"employeeId",
            model:"employee"
        },
    });
    
    const length = allLog.length;
    const arr =[];
    for(let i=0; i< length;i++) {
        const obj = allLog[i].toObject();
        if(obj.newValues) {
            obj.newValues.departmentId = await Department.findOne({_id:  obj.newValues.departmentId})
            obj.newValues.userId = await User.findById(obj.newValues.userId).select("email role username");
            obj.newValues.managerId = await Employee.findById(obj.newValues.managerId).select("fullName");
        }else{
            obj.newValues=null
        }
        if(obj.oldValues) {
            obj.oldValues.departmentId = await Department.findOne({_id:  obj.oldValues.departmentId});
            obj.oldValues.userId = await User.findById(obj.oldValues.userId).select("email role username");
            obj.oldValues.managerId = await Employee.findById(obj.oldValues.managerId).select("fullName");
        }else{
            obj.oldValues = null
        }
        arr.push(obj)
    }
    const totalItem = await Log.countDocuments(find);
    res.status(200).json({
        data: arr,
        totalItem: totalItem
    });
}