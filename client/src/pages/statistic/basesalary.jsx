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



const getFullYear = () => {
    const year = new Date().getFullYear();
    const arr = [];
    for (let i = 2020; i <= year; i++) {
        arr.push(i)
    }
    return arr;
}
export default function BaseSalaryStatisyic() {
    const [year, setYear] = React.useState(getFullYear)
    const [selectedYear, setSelectedYear] = React.useState(year.includes(new Date().getFullYear()) ? new Date().getFullYear() : year[0]);
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
                    formatter: function (value) {
                        return value.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0
                        });
                    },
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
                y: {
                    formatter: function (value) {
                        return value.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0
                        });
                    }
                }
            },
        },
    };
    

    const getMonthSalary = async () => {

        try {
            const respone = await instance.post("/statistic/salary", {
                check: check,
                year: selectedYear
            });
            setSalary(respone.salary);
            setEmployee(respone.employee)
        } catch (error) {
            console.log(error)
        }
    }
    React.useEffect(() => {
        getMonthSalary();
    }, [check, selectedYear])

    const exportExcel = () => {
        if (!selected) {
            alert("Chưa chọn tháng hoặc quý")
            return;
        }
        const length = employee.length
        console.log(employee)
        let check = false;
        for (let i = 0; i < length; i++) {
            if (Object.keys(employee[i])[0] === selected) {
                check = true;
                console.log("Employee is ", employee)
                const employees = employee[i][selected]
                console.log(employees)
                const data = employees.map((item, index) => {
                    const currency = item.baseSalary;
                    const currencyFormat = currency.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                    const bonuses = item.bonuses.map((bonus) => bonus.name + " : " + bonus.amount).join("\n")
                    const deduction = item.deductions.map((deduc) => deduc.name + ":" + deduc.amount).join("\n");
                    const allowances = item.allowances.map((allow) => allow.name + ":" + allow.amount).join("\n")
                    const periodStart = new Date(item.periodStart).toLocaleString();
                    const periodEnd = new Date(item.periodEnd).toLocaleString();
                    const totalSalary = item.totalSalary.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                    console.log("Deduction", deduction)
                    return (
                        {
                            "STT": index + 1,
                            "Họ và tên": item.employeeData[0].fullName,
                            "Số điện thoại": item.employeeData[0].phoneNumber,
                            "Chức vụ": item.employeeData[0].position,
                            "Lương cơ bản": currencyFormat,
                            "Thưởng": bonuses,
                            "Phụ cấp": allowances,
                            "Trừ": deduction,
                            "Tổng": totalSalary,
                            "Thời gian bắt đầu": periodStart,
                            "Thời gian kết thúc": periodEnd
                        })
                });
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Salary");

                const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

                saveAs(dataBlob, `Salary ${selected} ${selectedYear} .xlsx`);
            }
        }
        if (!check) {
            alert("Không có dữ liệu để xuất")
        }

    }
    console.log("Selected Year", selectedYear)
    return (
        <>
            <Card className="p-4 shadow-md">
                <CardHeader
                    floated={false}
                    shadow={false}
                    color="transparent"
                    className="flex flex-col md:flex-row justify-between items-center mb-4 pb-2 border-b"
                >
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-500 p-3 text-white">
                            <Square3Stack3DIcon className="h-6 w-6" />
                        </div>
                        <Typography variant="h5" color="blue-gray">
                            Thống kê lương
                        </Typography>
                    </div>

                    <button
                        onClick={exportExcel}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mt-4 md:mt-0"
                    >
                        Xuất Excel
                    </button>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                            Chọn kiểu thống kê
                        </Typography>
                        <div className="flex gap-6">
                            <Radio
                                name="type"
                                onChange={() => setCheck(true)}
                                label="Tháng"
                                defaultChecked
                                color="blue"
                            />
                            <Radio
                                name="type"
                                onChange={() => setCheck(false)}
                                label="Quý"
                                color="blue"
                            />
                        </div>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                            {check ? "Chọn tháng" : "Chọn quý"}
                        </Typography>
                        <Select
                            label={check ? "Tháng" : "Quý"}
                            value={selected}
                            onChange={(value) => setSelected(value)}
                            className="w-full"
                        >
                            {categories.map((item, index) => (
                                <Option key={index} value={item}>{item}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                            Chọn năm
                        </Typography>
                        <Select
                            label="Năm"
                            value={selectedYear}
                            onChange={(value) => setSelectedYear(value)}
                            className="w-full"
                        >
                            {year.map((year) => (
                                <Option key={year} value={year}>{year}</Option>
                            ))}
                        </Select>
                    </div>
                </div>

                <CardBody className="p-0">
                    <div className="border rounded-lg p-2 bg-gray-50">
                        <Chart {...chartConfigSalary} />
                    </div>
                </CardBody>
            </Card>
        </>
    )
}