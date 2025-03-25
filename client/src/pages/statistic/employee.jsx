import React, { useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
    Tooltip,
    Progress,
    Checkbox
} from "@material-tailwind/react";
import {
    EllipsisVerticalIcon,
    ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
    statisticsCardsData,
    statisticsChartsData,
    projectsTableData,
    ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
import Chart from "react-apexcharts"
import instance from "../../configs/axiosCustomize"


export default function StatisticEmployee() {
    const [total, setTotal] = React.useState(0);
    const [totalFemale, setTotalFemale] = React.useState(0);
    const [totalMale, setTotalMale] = React.useState(0);
    const [seniority, setSeniority] = React.useState([]);
    const [listEmployee, setListEmployee] = React.useState([]);
    const [department, setDepartment] = React.useState([]);
    const [idDepartment, setIdDepartment] = React.useState([]);
    const [departmentCheckbox,setDepartmentCheckBox] = React.useState([]);
    const [postionCheckBox,setPositionCheckbox] = React.useState([]);
    const [position,setPosition] = React.useState([]);
    const [tempList,setTempList] = React.useState([])
    const getDataDepartment = async () => {
        try {
            const position = await instance.get("/positions"); 
            const response = await instance.get("/departments");
            setPosition(position.data)
            setDepartment(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    const getSeniority = (list) =>{
        const seniority = list.map((item)=>{
            const seno = Date.now() - new Date(item.hireDate).getTime();
            const years = seno / (1000 * 60 * 60 * 24 * 365)
            let category = "";
            if(years<1) {
                category = "Dưới 1 năm"
            }else if(years >=1 && seno<3) 
                category= "Từ 1 đến 3 năm"
            else if(years>=3 && seno <5) 
                category = "Từ 3 đến 5 năm"    
            else 
                category = "Trên 5 năm"
            return {
                category:category
            }
        })
        const groupedCategory = seniority.reduce((acc, item) => {
            const existingCategory = acc.find(entry => entry.category === item.category);
            if (existingCategory) {
              existingCategory.number += 1;
            } else {
              acc.push({ category: item.category, number: 1 });
            }
            return acc;
          }, []);
          return groupedCategory
    }
    const getDataEmployee = async () => {
        try {
            const respone = await instance.get("/statistic/employee")
            console.log(respone)
            setListEmployee(respone.listEmployee)
            setTempList(respone.listEmployee)
            setTotal(respone.total)
            setTotalFemale(respone.totalFeMale)
            setTotalMale(respone.totalMale)
           
            const seniority = getSeniority(listEmployee)
            console.log(seniority)
            setSeniority(seniority)

        } catch (error) {
            console.log(error)
        }
    }
    React.useEffect(() => {
        getDataEmployee();
        getDataDepartment();
    }, [])

    const checkBoxCheckDepartment = (item) => {
        setDepartmentCheckBox(prev => {
            if (prev.some(department => department._id === item._id)) {
                return prev.filter(department => department._id !== item._id); 
            } else {
                return [...prev, item];
            }
        });
    };

    const checkBoxCheckPosition = (item) =>{
        setPositionCheckbox(prev => {
            if(prev.some((pos)=>pos._id==item._id)) {
                return prev.filter(pos=>pos._id!==item._id)
            }else{
                return [...prev,item];
            }
        })
    }
    const exportToExcel = () => {
        if (tempList.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        const data = tempList.map((item, index) => {
            const hireDate = new Date(item.hireDate);
            const formattedHireDate = hireDate.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            const dob = new Date(item.dateOfBirth)
            const formateDob = dob.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
            const amount = item.baseSalary;
            const formatAmount = amount.toLocaleString("vi-VN",{style:"currency",currency:"VND"})
            return ({
            "STT": index + 1,
            "Full Name": item.fullName,
            "Date Of Birth": item.dateOfBirth,
            "Gender": item.gender,
            "Address": item.address,
            "Phone Number": item.phoneNumber,
            "Department": item.departmentId?.name || "N/A",
            "Position": item.position,
            "Base Salary (VND)": formatAmount,
            "Hire Date": formattedHireDate,
        })});

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        saveAs(dataBlob, "Employee_List.xlsx");
    };
    useEffect( () =>{
        let list =[]
        if(departmentCheckbox.length>0 || postionCheckBox.length>0) {
            list = listEmployee.filter((item) => {
                const isDepartmentValid = departmentCheckbox.length > 0 
                    ? departmentCheckbox.some((dep) => dep._id == item.departmentId?._id) 
                    : true;
            
                const isPositionValid = postionCheckBox.length > 0 
                    ? postionCheckBox.some((pos) => pos._id == item.position) 
                    : true;
            
                return isDepartmentValid && isPositionValid;
            });
        }else {
            list= listEmployee
        }
        
      setTempList(list)
      setTotal(list.length)
      setTotalFemale(list.filter((item)=> { return item.gender=="FEMALE"}).length)
      setTotalMale(list.filter((item)=> { return item.gender=="MALE"}).length)
      const seno = getSeniority(list)
      setSeniority(seno)
    },[departmentCheckbox,postionCheckBox])
    return (
        <>
        <Card>
            <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
            >
                <h1 style={{ textAlign: "center", fontWeight: "bold" }}> Thống kê nhân viên </h1>
                <div className="w-max rounded-lg bg-gray-900 p-5 text-white">
                    <Square3Stack3DIcon className="h-6 w-6" />
                </div>
            </CardHeader>
            <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
            >
                <button
                    onClick={exportToExcel}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Xuất Excel
                </button>
            </CardHeader>
    
            <CardBody className="mt-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 shadow-sm border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <i className="fas fa-building text-white"></i>
                            </div>
                            <h3 className="text-lg font-bold text-blue-800">Phòng ban</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {department.map((item, index) => (
                                <label key={index} className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            value={item._id}
                                            checked={departmentCheckbox.some(dep => dep._id === item._id)}
                                            onChange={() => checkBoxCheckDepartment(item)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                            departmentCheckbox.some(dep => dep._id === item._id) 
                                                ? 'border-blue-500 bg-blue-500' 
                                                : 'border-gray-300 group-hover:border-blue-300'
                                        }`}>
                                            {departmentCheckbox.some(dep => dep._id === item._id) && (
                                                <i className="fas fa-check text-xs text-white"></i>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-2 text-sm transition-all ${
                                        departmentCheckbox.some(dep => dep._id === item._id) 
                                            ? 'text-blue-600 font-medium' 
                                            : 'text-gray-600 group-hover:text-blue-500'
                                    }`}>
                                        {item.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
    
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-5 shadow-sm border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <i className="fas fa-briefcase text-white"></i>
                            </div>
                            <h3 className="text-lg font-bold text-green-800">Chức vụ</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {position.map((item, index) => (
                                <label key={index} className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            value={item._id}
                                            checked={postionCheckBox.some(dep => dep._id === item._id)}
                                            onChange={() => checkBoxCheckPosition(item)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                            postionCheckBox.some(dep => dep._id === item._id) 
                                                ? 'border-blue-500 bg-blue-500' 
                                                : 'border-gray-300 group-hover:border-blue-300'
                                        }`}>
                                            {postionCheckBox.some(dep => dep._id === item._id) && (
                                                <i className="fas fa-check text-xs text-white"></i>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-2 text-sm transition-all ${
                                        postionCheckBox.some(dep => dep._id === item._id) 
                                            ? 'text-blue-600 font-medium' 
                                            : 'text-gray-600 group-hover:text-blue-500'
                                    }`}>
                                        {item.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </CardBody>
    
            <CardBody className="mt-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-md">
                        <CardBody className="text-center">
                            <div className="h-12 w-12 mx-auto text-blue-500 mb-2 flex items-center justify-center">
                                <i className="fas fa-users text-2xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Tổng số nhân viên</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{total}</p>
                        </CardBody>
                    </Card>
    
                    <Card className="shadow-md">
                        <CardBody className="text-center">
                            <div className="h-12 w-12 mx-auto text-purple-500 mb-2 flex items-center justify-center">
                                <i className="fas fa-venus-mars text-2xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Phân bổ giới tính</h3>
                            <div className="mt-2 flex justify-around">
                                <div>
                                    <p className="text-sm text-gray-600">Nam</p>
                                    <p className="text-2xl font-bold text-blue-600">{totalMale}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Nữ</p>
                                    <p className="text-2xl font-bold text-pink-600">{totalFemale}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
    
                    <Card className="shadow-md">
                        <CardBody className="text-center">
                            <div className="h-12 w-12 mx-auto text-red-500 mb-2 flex items-center justify-center">
                                <i className="fas fa-calendar-alt text-2xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Thâm niên</h3>
                            {seniority.map((item, index) => {
                                return (
                                    <div key={index} className="mt-2">
                                        <div className="flex justify-between border-b py-1">
                                            <span className="text-sm">{item.category}</span>
                                            <span className="text-sm font-bold">{item.number}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardBody>
                    </Card>
                </div>
            </CardBody>
        </Card>
    </>
    )
}