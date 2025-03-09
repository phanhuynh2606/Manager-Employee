const Employee = require("../models/employee");
const Department = require("../models/department")
const Salary = require("../models/salary")
//[POST] /statistic/employee
module.exports.statisticEmployee = async (req, res) => {
    try {
        const { department, position, sex } = req.body;
        let find = {};
        if (department && department.length > 0) {
            find.departmentId = { $in: department };
        }
        if (position && position.length > 0) {
            find.position = { $in: position };
        }
        if (sex && sex.length > 0) {
            find.gender = { $in: sex };
        }
        const totalEmployee = await Employee.countDocuments();
        const filterEmployee = Object.keys(find).length > 0 ? await Employee.countDocuments(find) : 0;

        const allFilterEmployee = Object.keys(find).length > 0 ? await Employee.find(find).populate("departmentId") : []
        res.json({
            total: totalEmployee,
            filter: filterEmployee,
            list: allFilterEmployee
        })
    } catch (error) {
        console.log(error)
    }
}

//[POST] /statistic/salary
module.exports.statisticSalary = async (req, res) => {
    try {
        const check = req.body.check === true
        if (check) {
            console.log(123)
            let arr = [];
            const allemployee = []
            for (let i = 1; i <= 12; i++) {
                const salary = await Salary.aggregate([
                    { $match: { month: { $in: [i] } } },
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
                    { $match: { month: { $in: [i, i + 1, i + 2] } } },
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
                    allemployee.push({ [`Quý ${count}`]: salary[0].employees  });
                }

                arr.push(salary[0]?.totalAmount || 0);
            }

            res.json({ salary: arr, employee: allemployee });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};