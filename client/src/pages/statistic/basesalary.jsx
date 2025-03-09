import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver"
import {
    Select,
    Option,
    Radio,
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


export default function BaseSalaryStatisyic() {
    const [salary, setSalary] = React.useState([]);
    const [check, setCheck] = React.useState(true)
    const [employee, setEmployee] = React.useState([]);
    const [selected, setSelected] = React.useState("")
    const categories = check ? [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ] : ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];
    const chartConfigSalary = {
        type: "bar",
        height: 240,
        series: [
            {
                name: "Salary",
                data: salary,
            },
        ],
        options: {
            chart: {
                toolbar: {
                    show: false,
                },
            },
            title: {
                show: "",
            },
            dataLabels: {
                enabled: false,
            },
            colors: ["#020617"],
            plotOptions: {
                bar: {
                    columnWidth: "40%",
                    borderRadius: 2,
                },
            },
            xaxis: {
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                labels: {
                    style: {
                        colors: "#616161",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
                categories: categories
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#616161",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
            },
            grid: {
                show: true,
                borderColor: "#dddddd",
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 5,
                    right: 20,
                },
            },
            fill: {
                opacity: 0.8,
            },
            tooltip: {
                theme: "dark",
            },
        },
    };
    console.log(selected)

    const getMonthSalary = async () => {
        try {
            const respone = await instance.post("/statistic/salary", {
                check: check
            });
            setSalary(respone.salary);
            setEmployee(respone.employee)
        } catch (error) {
            console.log(error)
        }
    }
    React.useEffect(() => {
        getMonthSalary();
    }, [check])
    const exportExcel = () => {
        const length = employee.length
        for (let i = 0; i < length; i++) {
            if (Object.keys(employee[i])[0] === selected) {
                const employees = employee[i][selected]
                console.log(employees)
                const data = employees.map((item, index) => ({
                    "STT": index + 1,
                    "Mã nhân viên": item._id,
                    "Full Name": item.employeeData[0].fullName,
                    "Phone number": item.employeeData[0].phoneNumber,
                    "Position": item.employeeData[0].position,
                    "Base salary" : item.baseSalary
                }));
                const worksheet = XLSX.utils.json_to_sheet(data);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Salary");
                
                        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                        const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                
                        saveAs(dataBlob, `Employee_List ${selected}.xlsx`);
            }
        }
    }

    return (
        <>

            <Card>
                <div className="flex gap-10">
                    <Radio name="type" onChange={() => setCheck(true)} label="Tháng" defaultChecked />
                    <Radio name="type" onChange={() => setCheck(false)} label="Quý" />
                </div>
                <div className="w-72">
                    <Select label="Select"
                        value={selected}
                        onChange={(value) =>{
                          setSelected(value)} }>
                        {categories.map((item, index) => {
                            return <Option key={index} value={item} >{item}</Option>
                        })}
                    </Select>
                </div>

                <CardHeader
                    floated={false}
                    shadow={false}
                    color="transparent"
                    className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
                >
                    <Typography variant="h6" color="blue-gray">
                        Thống kê lương
                    </Typography>

                    <div className="w-max rounded-lg bg-gray-900 p-5 text-white">
                        <Square3Stack3DIcon className="h-6 w-6" />
                    </div>
                    <button
                        onClick={exportExcel}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Xuất Excel
                    </button>
                </CardHeader>
                <CardBody className="px-2 pb-0">
                    <Chart {...chartConfigSalary} />
                </CardBody>
            </Card>
        </>
    )
}