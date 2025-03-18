import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { updateSalary } from "@/apis/salaries/salaries";


const SalaryModalEdit = ({ editingSalary, isModalOpenEdit, setIsModalOpenEdit, fetchSalaries }) => {
    const [form] = Form.useForm();

    const calculateTotalSalary = (formValues) => {
        const values = formValues || form.getFieldsValue();

        const totalDaySalary = editingSalary.daySalary.reduce((sum, item) => sum + Number(item?.salary || 0), 0);        
        const allowances = values.allowances || [];
        const bonuses = values.bonuses || [];
        const deductions = values.deductions || [];        

        const totalAllowances = allowances.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
        const totalBonuses = bonuses.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
        const totalDeductions = deductions.reduce((sum, item) => sum + Number(item?.amount || 0), 0);

        const total = totalDaySalary + totalAllowances + totalBonuses - totalDeductions;        

        return total.toFixed(2);
    };

    useEffect(() => {
        if (editingSalary) {
            const formData = {
                ...editingSalary,
                periodStart: editingSalary.periodStart ? dayjs(editingSalary.periodStart) : null,
                periodEnd: editingSalary.periodEnd ? dayjs(editingSalary.periodEnd) : null,
                paymentDate: editingSalary.paymentDate ? dayjs(editingSalary.paymentDate) : null,
            };

            form.setFieldsValue(formData);

                setTimeout(() => {
                    const totalSalary = calculateTotalSalary(formData);
                    form.setFieldsValue({ totalSalary });
                }, 0);
        }
    }, [editingSalary, form]);

    const handleOk = () => {
        fetchSalaries();
        setIsModalOpenEdit(false);
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpenEdit(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const updatedData = {
                allowances: values.allowances,
                baseSalary: values.baseSalary,
                bonuses: values.bonuses,
                deductions: values.deductions,
                totalSalary: values.totalSalary,
                note: values.note
            };

            const id = editingSalary?._id;


            const response = await updateSalary(id, updatedData);

            if (response.success === true) {
                message.success({ content: "Update successfully", key: "salaryUpdate", duration: 2 });

                fetchSalaries();
                setIsModalOpenEdit(false);
            } else {
                throw new Error("Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            message.error({ content: "Update failed, please try again!", key: "salaryUpdate", duration: 2 });
        }
    };
    const handleValuesChange = (changedValues) => {
        const totalSalary= editingSalary.daySalary.reduce((sum, item) => sum + Number(item?.salary || 0), 0);
        const newFormValues = { ...form.getFieldsValue(), ...changedValues, totalSalary };
        if ('allowances' in changedValues || 'bonuses' in changedValues || 'deductions' in changedValues) {
            const totalSalary = calculateTotalSalary(newFormValues);
            form.setFieldsValue({ totalSalary });
        }
    };

    useEffect(() => {
        if (isModalOpenEdit && editingSalary) {
            form.setFieldsValue({
                allowances: editingSalary.allowances,
                baseSalary: editingSalary.baseSalary,
                bonuses: editingSalary.bonuses,
                deductions: editingSalary.deductions,
                note: editingSalary.note,
                totalSalary: editingSalary.totalSalary
            });
        }
    }, [isModalOpenEdit, editingSalary, form]);

    return (
        <Modal
            title="Edit Salary"
            open={isModalOpenEdit}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okButtonProps={{ style: { backgroundColor: "black", color: "white" } }}
            okText="Submit"
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
            >
                <Form.Item name="employeeId" label="Employee:" rules={[{ required: true, message: "Please select an employee" }]}>
                    <a className="text-black font-medium text-2xl">{form.getFieldValue("employeeId")?.fullName || "No employee selected"}</a>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="month" label="Month" rules={[{ required: true, message: "Please select a month" }]}>
                            <Input type="number" min={1} max={12} className="w-full" disabled />
                        </Form.Item>
                        <Form.Item name="year" label="Year" rules={[{ required: true, message: "Please select a year" }]}>
                            <Input type="number" className="w-full" disabled />
                        </Form.Item>
                    </div>
                    <Form.Item name="baseSalary" label="Base Salary" rules={[{ required: true, message: "Please enter a base salary" }]}>
                        <Input type="number" className="w-full" disabled />
                    </Form.Item>
                </div>

                <Form.Item name="totalSalary" label="Total Salary">
                    <Input disabled />
                </Form.Item>

                <div className="grid grid-cols-3 gap-4">
                    <Form.Item name="periodStart" label="Period Start" rules={[{ required: true, message: "Please select a period start date" }]} className="w-full">
                        <DatePicker className="w-full" disabled />
                    </Form.Item>
                    <Form.Item name="periodEnd" label="Period End" rules={[{ required: true, message: "Please select a period end date" }]} className="w-full">
                        <DatePicker className="w-full" disabled />
                    </Form.Item>
                    <Form.Item name="paymentDate" label="Payment Date" className="w-full" rules={[{ required: true, message: "Please select a payment date" }]}>
                        <DatePicker className="w-full" disabled />
                    </Form.Item>
                </div>

                {/* Rest of the form remains the same */}
                <Form.List name="allowances" >
                    {(fields, { add, remove }) => (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Allowances</h3>
                                <Button
                                    type="default"
                                    variant="solid"
                                    color="default"
                                    icon={<PlusOutlined />}
                                    onClick={() => add()}
                                    className="flex items-center"
                                >
                                    Add Allowance
                                </Button>
                            </div>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="grid grid-cols-3 gap-4 items-center mb-4 p-4 border border-gray-200 rounded bg-gray-50">
                                    <Form.Item
                                        {...restField}
                                        name={[name, "name"]}
                                        label="Allowance Name"
                                        rules={[{ required: true, message: 'Please enter allowance name' }]}
                                        className="mb-0"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "amount"]}
                                        label="Amount"
                                        rules={[{ required: true, message: 'Please enter amount' }]}
                                        className="mb-0"
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                    <div className="flex justify-end">
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(name)}
                                            className="flex items-center"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center p-6 border border-dashed border-gray-300 rounded bg-gray-50">
                                    <p className="text-gray-500">No allowances yet. Click "Add Allowance" to start</p>
                                </div>
                            )}
                        </div>
                    )}
                </Form.List>

                <Form.List name="bonuses">
                    {(fields, { add, remove }) => (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Bonuses</h3>
                                <Button
                                    type="default"
                                    variant="solid"
                                    color="default"
                                    icon={<PlusOutlined />}
                                    onClick={() => add()}
                                    className="flex items-center"
                                >
                                    Add Bonus
                                </Button>
                            </div>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="grid grid-cols-4 gap-4 items-center mb-4 p-4 border border-gray-200 rounded bg-gray-50">
                                    <Form.Item
                                        {...restField}
                                        name={[name, "name"]}
                                        label="Bonus Name"
                                        rules={[{ required: true, message: 'Please enter bonus name' }]}
                                        className="mb-0"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "amount"]}
                                        label="Amount"
                                        rules={[{ required: true, message: 'Please enter amount' }]}
                                        className="mb-0"
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "reason"]}
                                        label="Reason"
                                        className="mb-0"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <div className="flex justify-end">
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(name)}
                                            className="flex items-center"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center p-6 border border-dashed border-gray-300 rounded bg-gray-50">
                                    <p className="text-gray-500">No bonuses yet. Click "Add Bonus" to start</p>
                                </div>
                            )}
                        </div>
                    )}
                </Form.List>

                <Form.List name="deductions">
                    {(fields, { add, remove }) => (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Deductions</h3>
                                <Button
                                    type="default"
                                    variant="solid"
                                    color="default"
                                    icon={<PlusOutlined />}
                                    onClick={() => add()}
                                    className="flex items-center"
                                >
                                    Add Deduction
                                </Button>
                            </div>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="grid grid-cols-4 gap-4 items-center mb-4 p-4 border border-gray-200 rounded bg-gray-50">
                                    <Form.Item
                                        {...restField}
                                        name={[name, "name"]}
                                        label="Deduction Name"
                                        rules={[{ required: true, message: 'Please enter deduction name' }]}
                                        className="mb-0"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "amount"]}
                                        label="Amount"
                                        rules={[{ required: true, message: 'Please enter amount' }]}
                                        className="mb-0"
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "reason"]}
                                        label="Reason"
                                        className="mb-0"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <div className="flex justify-end">
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(name)}
                                            className="flex items-center"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center p-6 border border-dashed border-gray-300 rounded bg-gray-50">
                                    <p className="text-gray-500">No deductions yet. Click "Add Deduction" to start</p>
                                </div>
                            )}
                        </div>
                    )}
                </Form.List>
                <Form.Item name="note" label="Notes">
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SalaryModalEdit;