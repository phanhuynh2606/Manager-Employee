const Employee = require("../models/employee");
const Department = require("../models/department")
const position = require("../models/position")
const Salary = require("../models/salary")
const mongoose = require("mongoose")
//[POST] /statistic/employee
module.exports.statisticEmployee = async (req, res) => {
    try {
        const { department, position } = req.body;
        const totalEmployee = await Employee.countDocuments();
        const totalMale = await Employee.countDocuments({gender: "MALE" });
        const totalFeMale = await Employee.countDocuments({ gender: "FEMALE" });
        const listEmployee = await Employee.find().populate("departmentId");
        res.status(200).json({
            total: totalEmployee,
            totalMale: totalMale,
            totalFeMale: totalFeMale,
            listEmployee: listEmployee
        })
    } catch (error) {
        console.log(error)
    }
}

//[POST] /statistic/salary
module.exports.statisticSalary = async (req, res) => {
    try {
        const check = req.body.check === true
        const find ={};
        if(req.body.year) 
            find.year = req.body.year
        if (check) {
            let arr = [];
            const allemployee = []
            for (let i = 1; i <= 12; i++) {
                const salary = await Salary.aggregate([
                    { $match: { month: { $in: [i] } ,...find} },
                    {
                        $lookup: {
                            from: "employees",
                            localField: "employeeId",
                            foreignField: "_id",
                            as: "employeeData"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$totalSalary" },
                            employees: { $push: "$$ROOT" }
                        }
                    }
                ]);
                if (salary.length > 0)
                    allemployee.push({ [`Tháng ${i}`]: salary[0].employees });
                arr.push(salary.length > 0 ? salary[0].totalAmount : 0)
            }
            res.json({
                salary: arr,
                employee: allemployee
            })
        } else {
            let arr = [];
            const allemployee = [];
            let count = 0;

            for (let i = 1; i <= 12; i += 3) {
                count++;

                const salary = await Salary.aggregate([
                    { $match: { month: { $in: [i, i + 1, i + 2] },...find }},
                    {
                        $lookup: {
                            from: "employees",
                            localField: "employeeId",
                            foreignField: "_id",
                            as: "employeeData"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$totalSalary" },
                            employees: { $push: "$$ROOT" }
                        }
                    }
                ]);

                if (salary.length > 0) {
                    allemployee.push({ [`Quý ${count}`]: salary[0].employees });
                }

                arr.push(salary[0]?.totalAmount || 0);
            }

            res.json({ salary: arr, employee: allemployee });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};