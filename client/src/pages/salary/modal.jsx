import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, DatePicker, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { createSalary, getEmployeeSalary } from "@/apis/salaries/salaries";

const { Option } = Select;

const SalaryModal = ({ isModalOpen, setIsModalOpen, fetchSalaries }) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployeeSalary();
      if (response && response.data) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSalary = () => {
    const baseSalary = Number(form.getFieldValue("baseSalary")) || 0;
    const allowances = form.getFieldValue("allowances") || [];
    const bonuses = form.getFieldValue("bonuses") || [];
    const deductions = form.getFieldValue("deductions") || [];
  
    const totalAllowances = allowances.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
    const totalBonuses = bonuses.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  
    return Number(baseSalary) + totalAllowances + totalBonuses - totalDeductions;
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchEmployees();
      form.resetFields();
      form.setFieldsValue({ totalSalary: calculateTotalSalary() });
    }
  }, [isModalOpen]);  

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.periodStart) {
        values.periodStart = values.periodStart.toDate().toISOString();
      }
      
      if (values.periodEnd) {
        values.periodEnd = values.periodEnd.toDate().toISOString();
      }
      
      if (values.paymentDate) {
        values.paymentDate = values.paymentDate.toDate().toISOString();
      }
      
      const newSalary = {
        employeeId: values.employeeId,
        year: Number(values.year),
        month: Number(values.month),
        baseSalary: Number(values.baseSalary),
        allowances: values.allowances.map(item => ({ ...item, amount: Number(item.amount) })),
        bonuses: values.bonuses.map(item => ({ ...item, amount: Number(item.amount) })),
        deductions: values.deductions.map(item => ({ ...item, amount: Number(item.amount) })),
        note: values.note,
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        paymentDate: values.paymentDate
      };

      console.log(newSalary);
            
      if (createSalary) {        
        const response = await createSalary(newSalary);
        
        if (response.success) {
          message.success({ content: "Tạo thông tin lương thành công", key: "salaryCreate", duration: 2 });
          fetchSalaries();
          setIsModalOpen(false);
        } else {
          throw new Error("Tạo mới thất bại");
        }
      } else {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi khi tạo mới:", error);
      if (error.errorFields && error.errorFields.length > 0) {
        const fieldNames = error.errorFields.map(f => f.name).join(', ');
        message.error(`Vui lòng kiểm tra lại các trường: ${fieldNames}`);
      } else {
        message.error("Vui lòng kiểm tra lại thông tin và thử lại");
      }
    }
  };

  const handleValuesChange = () => {
    const totalSalary = calculateTotalSalary();
    form.setFieldsValue({ totalSalary });
  };

  return (
    <Modal
      title="Add New Salary"
      open={isModalOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okButtonProps={{ style: { backgroundColor: "black", color: "white" } }}
      okText="Submit"
      width={800}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Please select an employee" }]}>
          <Select placeholder="Select employee">
            {employees.map((employee) => (
              <Option key={employee._id} value={employee._id}>
                {employee.fullName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="month" label="Month" rules={[{ required: true, message: "Please select a month" }]}>
              <Input type="number" min={1} max={12} className="w-full" />
            </Form.Item>
            <Form.Item name="year" label="Year" rules={[{ required: true, message: "Please select a year" }]}>
              <Input type="number" className="w-full" max={new Date().getFullYear()} />
            </Form.Item>
          </div>
          <Form.Item name="baseSalary" label="Base Salary" rules={[{ required: true, message: "Please enter a base salary" }]}>
            <Input type="number" className="w-full" />
          </Form.Item>
        </div>

        <Form.Item name="totalSalary" label="Total Salary">
          <Input disabled />
        </Form.Item>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item name="periodStart" label="Period Start" rules={[{ required: true, message: "Please select a period start date" }]} className="w-full">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="periodEnd" label="Period End" rules={[{ required: true, message: "Please select a period end date" }]} className="w-full">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date" className="w-full" rules={[{ required: true, message: "Please select a payment date" }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

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

export default SalaryModal;
