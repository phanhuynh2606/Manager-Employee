const Employee = require("../models/employee");
const Department = require("../models/department")
const Salary = require("../models/salary")
const mongoose = require("mongoose")
//[POST] /statistic/employee
module.exports.statisticEmployee = async (req, res) => {
    try {
        const { department, position } = req.body;

        let find = {};
        if (department && department.length > 0) {
            find.departmentId = { $in: department.map((id, index) => new mongoose.Types.ObjectId(id)) }
        }
        if (position && position.length > 0) {
            find.position = { $in: position }
        }
        const totalEmployee = await Employee.countDocuments(find);
        const totalMale = await Employee.countDocuments({ ...find, gender: "MALE" });
        const totalFeMale = await Employee.countDocuments({ ...find, gender: "FEMALE" });
        const hireDateStats = await Employee.aggregate([
            {
                $match: find
            },
            {
                $addFields: {
                    yearsOfExperience: {
                        $subtract: [{ $year: "$$NOW" }, { $year: "$hireDate" }]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        category: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ["$yearsOfExperience", 1] }, then: "Dưới 1 năm" },
                                    { case: { $lt: ["$yearsOfExperience", 3] }, then: "1 - 3 năm" },
                                    { case: { $lt: ["$yearsOfExperience", 5] }, then: "3 - 5 năm" },

                                ],
                                default: "Trên 5 năm"
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const seniority = hireDateStats.map((item, index) => {
            return { category: item._id.category, number: item.count }
        })
        const listEmployee = await Employee.find(find).populate("departmentId");
        res.status(200).json({
            total: totalEmployee,
            totalMale: totalMale,
            totalFeMale: totalFeMale,
            seniority: seniority,
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
            console.log(123)
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
                            totalAmount: { $sum: "$baseSalary" },
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
                            totalAmount: { $sum: "$baseSalary" },
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