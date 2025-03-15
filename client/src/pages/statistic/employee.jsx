import React from "react";
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
import { func } from "prop-types";

const TABLE_HEAD_EMPLOYEE = ["Full Name", "Date Of Birth", "Gender", "Address", "Phone Number", "Department", "Position", "Base Salary", "Hire Date"];
const SEX = ["MALE", "FEMALE", "OTHER"]
const POSITION = ["HR Manager", "Software Engineer", "System Administrator", "Test", "Manager IT", "Marketing Specialist", "Project Manager", "Manager"]
export default function StatisticEmployee() {
    const [total, setTotal] = React.useState(0);
    const [filter, setFilter] = React.useState(0);
    const [list, setList] = React.useState([]);
    const [department, setDepartment] = React.useState([]);
    const [genderCheckBox, setGenderCheckBox] = React.useState([]);
    const [departmentCheckBox, setDepartmentCheckBox] = React.useState([]);
    const [positionCheckBox, setPositionCheckBox] = React.useState([]);
    const [Dname,setDname] =React.useState([]);
    const chartConfig = {
        type: "pie",
        width: 500,
        height: 500,
        series: [...Array.isArray(filter) ? filter : [], total],
        options: {
            chart: { toolbar: { show: true } },
            title: { text: "Biểu đồ thống kê nhân viên" },
            dataLabels: { enabled: true },
            colors: [
                "#020617", "#ff8f00", "#00897b", "#1e88e5", "#d81b60", 
                "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
                "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
                "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff5722"
            ],
            legend: { show: true },
            labels: (positionCheckBox.length > 0 ? positionCheckBox : Dname.length > 0 ? Dname : genderCheckBox.length>0 ? genderCheckBox:[])
        },
    }
    
    const getDataDepartment = async () => {
        try {
            const response = await instance.get("/departments")
            setDepartment(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    const getDataEmployee = async () => {
        try {
            const idDepartment = departmentCheckBox.map((item,index) => item._id)
            const respone = await instance.post("/statistic/employee", {
                "department": idDepartment,
                "sex": genderCheckBox,
                "position": positionCheckBox
            });
            console.log("List is" ,respone)
            setTotal(respone.remain)
            setFilter(respone.data)
            setList(respone.list)
        } catch (error) {
            console.log(error)
        }
    }



    function checkBoxCheckDepartment(department) {
        setDepartmentCheckBox(prev => {
            const exists = prev.some(item => item._id === department._id);
            if (exists) {
                return prev.filter(item => item._id !== department._id);
            } else {
                return [...prev, department];
            }
        });
        console.log(list)
    }
    function checkBoxCheckSex(name) {
        setGenderCheckBox(prev => {
            return prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        })
    }
    function checkBoxCheckPosition(position) {
        setPositionCheckBox(prev => {
            return prev.includes(position) ? prev.filter((item) => item !== position) : [...prev, position]
        })
    }
    function setName(departmentCheckBox) {
        const dNameArr = departmentCheckBox.map((item,index) => item.name)
        console.log(dNameArr)
        setDname(dNameArr)
    }
    React.useEffect(() => {
        getDataDepartment();
        getDataEmployee();
        setName(departmentCheckBox)
    }, [genderCheckBox, departmentCheckBox, positionCheckBox])

    const exportToExcel = () => {
        if (list.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        const data = list.map((item, index) => ({
            "STT": index + 1,
            "Full Name": item.fullName,
            "Date Of Birth": item.dateOfBirth,
            "Gender": item.gender,
            "Address": item.address,
            "Phone Number": item.phoneNumber,
            "Department": item.departmentId?.name || "N/A",
            "Position": item.position,
            "Base Salary": item.baseSalary,
            "Hire Date": item.hireDate,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        saveAs(dataBlob, "Employee_List.xlsx");
    };


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
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <span className="text-md font-semibold text-gray-700">Giới tính</span>
                            <div className="mt-2 flex flex-col gap-2">
                                {SEX.map((item, index) => (
                                    <label key={index} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            value={item}
                                            color="blue"
                                            checked={genderCheckBox.includes(item)}
                                            onChange={() => checkBoxCheckSex(item)}
                                            className="h-4 w-4 border-gray-400 text-blue-500"
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-md font-semibold text-gray-700">Phòng ban</span>
                            <div className="mt-2 flex flex-col gap-2">
                                {department.map((item, index) => (
                                    <label key={index} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            value={item._id}
                                            color="blue"
                                            className="h-4 w-4 border-gray-400 text-blue-500"
                                            checked={departmentCheckBox.some(department => department._id === item._id)}
                                            onChange={() => checkBoxCheckDepartment(item)}
                                        />
                                        {item.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-md font-semibold text-gray-700">Chức vụ</span>
                            <div className="mt-2 flex flex-col gap-2">
                                {POSITION.map((item, index) => (
                                    <label key={index} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            value={item}
                                            color="blue"
                                            className="h-4 w-4 border-gray-400 text-blue-500"
                                            checked={positionCheckBox.includes(item)}
                                            onChange={() => checkBoxCheckPosition(item)}
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
                <CardBody className="mt-4 px-4 flex justify-center">
                    <Chart {...chartConfig} />
                </CardBody>
            </Card>
        </>
    )
}