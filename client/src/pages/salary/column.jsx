import { changeSalaryStatus, deleteSalary, getSalary } from "@/apis/salaries/salaries";
import { DeleteOutlined, EditOutlined, MoreOutlined, SwapOutlined } from "@ant-design/icons";
import { Dropdown, Tag, Tooltip } from "antd";
import { notification } from "antd";

const handleChangeStatus = async (id, status, fetchSalaries) => {
    try {
        const res = await changeSalaryStatus(id, status);
        console.log(res);
        

        if (res.error) {
            return notification.error({
                message: "Error updating status",
                description: res.error || "Có lỗi xảy ra, vui lòng thử lại!",
                placement: "topRight",
            });
        }

            notification.success({
            message: "Success updating status",
            description: res.message || "Updated status successfully!",
            placement: "topRight",
        });
        fetchSalaries();

        return res;
    } catch (error) {
        console.error("Failed to fetch salaries", error);

        notification.error({
            message: "Lỗi hệ thống",
            description:
                error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!",
            placement: "topRight",
        });
    }
};

const handleDelete = async (id, fetchSalaries) => {
    try {
        const res = await deleteSalary(id);        

        if (res.error) {
            return notification.error({
                message: "Error removing salary",
                description: res.error || "Có lỗi xảy ra, vui lòng thử lại!",
                placement: "topRight",
            });
        }

            notification.success({
            message: "Success updating salary",
            description: res.message || "Removed salary successfully!",
            placement: "topRight",
        });
        fetchSalaries();

        return res;
    } catch (error) {
        console.error("Failed to fetch salaries", error);

        notification.error({
            message: "Lỗi hệ thống",
            description:
                error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!",
            placement: "topRight",
        });
    }
}

export const columns = (fetchSalaries, setEditingSalary, setIsModalOpenEdit) => [
    {
        title: "Actions",
        key: "action",
        dataIndex: "_id",
        fixed: "left",
        width: 80,
        render: (id) => (
            <Dropdown
                menu={{
                    items: [
                        {
                            key: "1",
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
                                        Edit
                                    </span>
                                </div>
                            ),
                            
                        },
                        {
                            key: "2",
                            label: (
                                <div className="flex items-center gap-2 text-red-500 w-full" onClick={() => handleDelete(id, fetchSalaries)}>
                                    <DeleteOutlined />
                                    <span className="font-semibold">Delete</span>
                                </div>
                            ),
                        },
                        {
                            key: "3",
                            label: (
                                <div className="flex items-center gap-2">
                                    <SwapOutlined />
                                    <span className="font-semibold">Change Status</span>
                                </div>
                            ),
                            children: ["DRAFT", "APPROVED", "PAID"].map((status, index) => ({
                                key: `${index + 4}`,
                                value: status,
                                label: <span className="font-semibold" onClick={() => handleChangeStatus(id, status, fetchSalaries)}>{status}</span>,
                            })),
                        },
                    ],
                }}
                trigger={["click"]}
            >
                <MoreOutlined className="cursor-pointer text-lg" />
            </Dropdown>
        ),
    },
    {
        title: "Employee",
        dataIndex: "employeeId",
        key: "employeeId",
        render: (value) => (
            <div className="flex items-center gap-3">
                <img
                    src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=76&q=80"
                    className="h-10 w-10 rounded-full object-cover"
                    alt="Employee"
                />
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">{value.fullName}</span>
                    <Tag color="blue">{value.position}</Tag>
                </div>
            </div>
        ),
    },
    {
        title: "Year",
        dataIndex: "year",
        key: "year",
        align: "center",
    },
    {
        title: "Month",
        dataIndex: "month",
        key: "month",
        align: "center",
    },
    {
        title: "Base Salary",
        dataIndex: "baseSalary",
        key: "baseSalary",
        align: "right",
        render: (value) => `${value.toLocaleString()}`,
    },
    {
        title: "Allowances",
        dataIndex: "allowances",
        key: "allowances",
        render: (allowances) =>
            allowances.length > 0 ? (
                <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-md">
                    {allowances.map((a, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="font-medium">{a.name}</span>
                            <span className="text-blue-600">{a.amount}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-gray-500">-</span>
            ),
    },
    {
        title: "Bonuses",
        dataIndex: "bonuses",
        key: "bonuses",
        render: (bonuses) =>
            bonuses.length > 0 ? (
                <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-md">
                    {bonuses.map((b, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="font-medium">{b.name}</span>
                            <span className="text-green-600">{b.amount}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-gray-500">-</span>
            ),
    },
    {
        title: "Deductions",
        dataIndex: "deductions",
        key: "deductions",
        render: (deductions) =>
            deductions.length > 0 ? (
                <div className="flex flex-col gap-1 bg-red-50 p-2 rounded-md">
                    {deductions.map((d, index) => (
                        <div key={index} className="flex justify-between text-red-600">
                            <span className="font-medium">{d.name}</span>
                            <span>- {d.amount}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-gray-500">-</span>
            ),
    },
    {
        title: "Total Salary",
        dataIndex: "totalSalary",
        key: "totalSalary",
        align: "right",
        render: (value) => (
            <span className="font-semibold text-lg text-black">{value.toLocaleString()}</span>
        ),
    },
    {
        title: "Note",
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
    },
    {
        title: "Created By",
        dataIndex: "createdBy",
        key: "createdBy",
        render: (value) => (
            <div className="flex items-center gap-3">
                <img
                    src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=76&q=80"
                    className="h-10 w-10 rounded-full object-cover"
                    alt="Employee"
                />
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">{value.email}</span>
                    <Tag color="blue" className="w-fit">{value.role}</Tag>
                </div>
            </div>
        ),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => {
            const statusColors = {
                PAID: "green",
                APPROVED: "blue",
                DRAFT: "gray",
            };
            return (
                <Tag color={statusColors[status] || "default"} className="text-base font-medium">
                    {status}
                </Tag>
            );
        },
    },
];