const Employee = require("../models/employee");
const Department = require("../models/department")
const Salary = require("../models/salary")
//[POST] /statistic/employee
module.exports.statisticEmployee = async (req, res) => {
    try {
        const { department, position, sex } = req.body;
       
        // if (department && department.length > 0) {
        //     find.departmentId = { $in: department };
        // }
        // if (position && position.length > 0) {
        //     find.position = { $in: position };
        // }
        // if (sex && sex.length > 0) {
        //     find.gender = { $in: sex };
        // }
        // const totalEmployee = await Employee.countDocuments();
        // const filterEmployee = Object.keys(find).length > 0 ? await Employee.countDocuments(find) : 0;

        // const allFilterEmployee = Object.keys(find).length > 0 ? await Employee.find(find).populate("departmentId") : []
        // res.json({
        //     total: totalEmployee,
        //     filter: filterEmployee,
        //     list: allFilterEmployee
        // })
        const sum =  await Employee.countDocuments({});
        if (position.length > 0) {
            let find = {};
            if (department && department.length > 0) {
                find.departmentId = { $in: department };
            }
            if (sex && sex.length > 0) {
                find.gender = { $in: sex };
            }
            const arr=[];
            const arrList =[];
            let remain =sum;
            for(let i =0;i< position.length;i++){
                const data = await Employee.countDocuments({...find,position:position[i]})
                console.log("data is ",data)
                remain=remain-data;
                const dataList = await Employee.find({...find,position:position[i]}).populate("departmentId");
                arrList.push(...dataList); 
                arr.push(data);
            }
            return res.json({
                data: arr,
                remain:remain,
                list:arrList
            })
        }
        if(department.length>0) {
            let find = {};
            if (sex && sex.length > 0) {
                find.gender = { $in: sex };
            }
            const arr=[];
            const arrList=[];
            let remain=sum;
            console.log(sum)
            for(let i =0;i< department.length;i++){
                const data = await Employee.countDocuments({...find,departmentId:department[i]})
                const dataList = await Employee.find({...find,departmentId:department[i]}).populate("departmentId");
                remain=remain-data;
                arr.push(data);
                arrList.push(...dataList); 
            }
            console.log("DP is : ",arr)
            return res.json({
                data: arr,
                remain:remain,
                list:arrList
            })
        }
        if (sex && sex.length > 0) {
            let find = {};
            const arr =[];
            const arrList =[];
            let remain =sum;
            for(let i =0;i< sex.length;i++){
                const data = await Employee.countDocuments({...find,gender:sex[i]})
                const dataList = await Employee.find({...find,gender:sex[i]}).populate("departmentId")
                remain = remain-data;
                arrList.push(...dataList); 
                arr.push(data);
            }
            return res.json({
                data: arr,
                remain:remain,
                list: arrList
            })
        }
        res.json({
            data:[0],
            remain:0,
            list:[]
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