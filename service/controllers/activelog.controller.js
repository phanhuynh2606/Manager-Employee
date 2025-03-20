const Log = require("../models/log");

module.exports.getAllLog =async (req,res)=> {
    const role = req.user.role
    const {sort,page,limitItem,startDate,endDate} = req.body;
    const find={};
    if(startDate) {
        find.createdAt={
            $gt: new Date(startDate)
        }
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
        }
    });
    const totalItem = await Log.countDocuments(find);
    res.status(200).json({
        data: allLog,
        totalItem: totalItem
    });
}