import { getSalary } from "@/apis/salaries/salaries";
import { EditOutlined, MoreOutlined, ReadOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Tag, Tooltip } from "antd";
import { Link } from "react-router-dom";



export const columns = (setEditingSalary, setIsModalOpenEdit, role) => [
    {
        title: "Hành động",
        key: "action",
        dataIndex: "_id",
        fixed: "left",
        width: 120,
        render: (id) => (
            <Dropdown
                menu={{
                    items: [
                        {
                            key: "1",
                            label: (
                                <Link className="flex items-center gap-2 w-full" to={`/dashboard/salaries/${id}`}>
                                    < ReadOutlined />
                                    <span className="font-semibold">Xem chi tiết</span>
                                </Link>
                            ),
                        },
                        role === "ADMIN" && {
                            key: "2",
                            label: (
                                <div className="flex items-center gap-2 w-full" onClick={async () => {
                                    try {
                                        const salaryData = await getSalary(id);
                                        setEditingSalary(salaryData.data);
                                        setIsModalOpenEdit(true);
                                    } catch (error) {
                                        console.error("Error fetching salary details:", error);
                                    }
                                }
                                }>
                                    <EditOutlined />
                                    <span
                                        className="font-semibold cursor-pointer"

                                    >
                                        Cập nhật
                                    </span>
                                </div>
                            ),

                        }
                    ],
                }}
                trigger={["click"]}
            >
                <MoreOutlined className="cursor-pointer text-lg" />
            </Dropdown>
        ),
    },
    {
        title: "Nhân viên",
        dataIndex: "employeeId",
        key: "employeeId",
        render: (value) => (
            <div className="flex items-center gap-3">
                <Avatar
                    src={`http://localhost:4000/assets/images/${value?.employeeId?.avatarUrl}`}
                    icon={<UserOutlined />}
                    size="large"
                />
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">{value.fullName}</span>
                    <Tag color="blue" className="w-fit">{value.position}</Tag>
                </div>
            </div>
        ),
    },
    {
        title: "Năm",
        dataIndex: "year",
        key: "year",
        align: "center",
    },
    {
        title: "Tháng",
        dataIndex: "month",
        key: "month",
        align: "center",
    },
    {
        title: "Lương cơ bản",
        dataIndex: "baseSalary",
        key: "baseSalary",
        align: "right",
        render: (value) => `${value.toLocaleString()}đ`,
    },
    {
        title: "Phụ cấp",
        dataIndex: "allowances",
        key: "allowances",
        render: (allowances) =>
            allowances.length > 0 ? (
                <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-md">
                    {allowances.map((a, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="font-medium">{a.name}</span>
                            <span className="text-blue-600">{a.amount.toLocaleString()}đ</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-gray-500">-</span>
            ),
    },
    {
        title: "Tiền thưởng",
        dataIndex: "bonuses",
        key: "bonuses",
        render: (bonuses) =>
            bonuses.length > 0 ? (
                <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-md">
                    {bonuses.map((b, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="font-medium">{b.name}</span>
                            <span className="text-green-600">{b.amount.toLocaleString()}đ</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-gray-500">-</span>
            ),
    },
    {
        title: "Khoản khấu trừ",
        dataIndex: "deductions",
        key: "deductions",
        render: (deductions) =>
            deductions.length > 0 ? (
                <div className="flex flex-col gap-1 bg-red-50 p-2 rounded-md">
                    {deductions.map((d, index) => (
                        <div key={index} className="flex justify-between text-red-600">
                            <span className="font-medium">{d.name}</span>
                            <span>- {d.amount.toLocaleString()}đ</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-gray-500">-</span>
            ),
    },
    {
        title: "Tổng lương nhận",
        dataIndex: "totalSalary",
        key: "totalSalary",
        align: "right",
        render: (value) => (
            <span className="font-semibold text-lg text-black">{Math.ceil(value).toLocaleString()}đ</span>
        ),
    },
    {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        render: (note) =>
            note ? (
                <Tooltip title={note}>
                    <span className="truncate block max-w-[200px]">{note}</span>
                </Tooltip>
            ) : (
                "-"
            ),
    }
];