import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  Avatar,
  Tag,
  Drawer,
  Slider,
  Divider,
  message,
  InputNumber
} from "antd";
import { Link, useNavigate  } from 'react-router-dom';
import axios from '../../configs/axiosCustomize';
import { SearchOutlined, FilterOutlined, UserOutlined, ClearOutlined, UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartments } from "@/apis/departments/departments";
import { getEmployees, getEmployeePosition } from "@/apis/employees/employee";
import { useForm } from "antd/es/form/Form";
import { useSelector } from 'react-redux';
const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  }); 
  const [form] = useForm();
  const user = useSelector((state) => state?.auth?.user);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    name: "",
    department: "",
    position: "",
    gender: "",
    salaryRange: [0, 50000000],
    hireDate: [],
  }); 
  useEffect(() => {
    if (user?.position === "STAFF" && user?.role === "EMPLOYEE") {  
      navigate(`/dashboard/employee/${user.employeeId}`);
      return;
    }
    fetchDepartments();
    fetchPositions();
  }, [user, navigate]);

  useEffect(() => {
    fetchEmployees(filters);
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchEmployees = async (queryFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryFilters.name) params.append("name", queryFilters.name);
      if (queryFilters.department) params.append("department", queryFilters.department);
      if (queryFilters.position) params.append("position", queryFilters.position);
      if (queryFilters.gender) params.append("gender", queryFilters.gender);

      if (queryFilters.salaryRange && queryFilters.salaryRange[0] > 0) {
        params.append("salaryMin", queryFilters.salaryRange[0]);
      }
      if (queryFilters.salaryRange && queryFilters.salaryRange[1] < 100000000) {
        params.append("salaryMax", queryFilters.salaryRange[1]);
      }

      if (queryFilters.hireDate && queryFilters.hireDate[0]) {
        params.append("hireDateFrom", queryFilters.hireDate[0].format("YYYY-MM-DD"));
      }
      if (queryFilters.hireDate && queryFilters.hireDate[1]) {
        params.append("hireDateTo", queryFilters.hireDate[1].format("YYYY-MM-DD"));
      }
      params.append('page', pagination.current);
      params.append('limit', pagination.pageSize); 
      const response = await getEmployees(params.toString());
      if (response.success) {
        setEmployees(response.data);
        setPagination({
          ...pagination,
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        }); 
      } else {
        messageApi.error("Failed to fetch employees");
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      messageApi.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await getEmployeePosition();
      if (response.success) {
        setPositions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    }
  };
  const handleAdd = async () => {
    try {
      setLoading(true);
      const dataForm = await form.validateFields();
      const response = await axios.post(`/employee/create`, dataForm);
      console.log(response)
      if (response.success) {
        setAddModalVisible(false);
        form.resetFields();
        setTimeout(() => {
          messageApi.success(response.message);
        }, 200);
      }
      else {
        messageApi.error(response.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch employee data:", error);
      messageApi.error("Failed to add employee");
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      department: "",
      position: "",
      gender: "",
      salaryRange: [0, 50000000],
      hireDate: [],
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };
  const handlePagination = (config) => {
    setPagination({
      ...pagination,
      current: config.current,
      pageSize: config.pageSize,
    });
  };

  const formatSalary = (value) => {
    return `${value.toLocaleString("vi-VN")} ₫`;
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatarUrl}
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.fullName}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{record.phoneNumber}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentId",
      key: "department",
      render: (dept) => dept?.name || "N/A",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        let color = gender === "MALE" ? "blue" : gender === "FEMALE" ? "pink" : "default";
        let text = gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Base Salary",
      dataIndex: "baseSalary",
      key: "baseSalary",
      render: (salary) => formatSalary(salary),
      sorter: (a, b) => a.baseSalary - b.baseSalary,
    },
    {
      title: "Hire Date",
      dataIndex: "hireDate",
      key: "hireDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.hireDate) - new Date(b.hireDate),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/dashboard/employee/${record._id}`}>
            <Button type="link">View</Button>
          </Link>
        </Space>
      ),
    },
  ]
  if (user?.position === "EMPLOYEE") {
    return null;
  }
  return (
    <div className="p-6">
      {contextHolder}
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Input
            placeholder="Search by name"
            prefix={<SearchOutlined />}
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            style={{ width: 250 }}
            allowClear
          /> 
          <Select
            placeholder="Department"
            value={filters.department}
            onChange={(value) => handleFilterChange("department", value)}
            style={{ width: 180 }}
            allowClear
          >
            {departments.map(dept => (
              <Option key={dept._id} value={dept._id}>{dept.name}</Option>
            ))}
          </Select>

          <Select
            placeholder="Position"
            value={filters.position}
            onChange={(value) => handleFilterChange("position", value)}
            style={{ width: 180 }}
            allowClear
          >
            {positions.map(pos => (
              <Option key={pos} value={pos}>{pos}</Option>
            ))}
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawer(true)}
          >
            More Filters
          </Button>

          {Object.values(filters).some(v =>
            v && (Array.isArray(v) ? v.length > 0 : true)
          ) && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
        </Space>
        {user?.role === "ADMIN" &&
          <Button icon={<UserAddOutlined />} onClick={() => setAddModalVisible(true)}>
            Add Employee
          </Button>
        }
      </div>

      <Table
        dataSource={employees}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handlePagination} 
      />

      <Drawer
        title="Advanced Filters"
        placement="right"
        onClose={() => setDrawer(false)}
        open={drawer}
        width={400}
      >
        <Form layout="vertical">
          <Form.Item label="Gender">
            <Select
              placeholder="Select gender"
              value={filters.gender}
              onChange={(value) => handleFilterChange("gender", value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="MALE">Male</Option>
              <Option value="FEMALE">Female</Option>
              <Option value="OTHER">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Salary Range">
            <Slider
              range
              min={0}
              max={50000000}
              step={1000000}
              value={filters.salaryRange}
              onChange={(value) => handleFilterChange("salaryRange", value)}
              tipFormatter={formatSalary}
            />
            <Row justify="space-between">
              <Col>{formatSalary(filters.salaryRange[0])}</Col>
              <Col>{formatSalary(filters.salaryRange[1])}</Col>
            </Row>
          </Form.Item>

          <Form.Item label="Hire Date Range">
            <RangePicker
              value={filters.hireDate}
              onChange={(dates) => handleFilterChange("hireDate", dates)}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={24}>
              <Button
                block
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </Col>

          </Row>
        </Form>
      </Drawer>
      <Modal
        title="Add Employee"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAdd}
        okText="Add"
        okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
        width={800}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: 'email', message: "Please enter a valid email address" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[
                  { required: true, message: "Please enter full name" },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select placeholder="Select gender">
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^(\+84|84|0)([3|5|7|8|9])([0-9]{8})$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[
                  { required: true, message: "Please select date of birth" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input.TextArea placeholder="Enter address" rows={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="Department"
                rules={[
                  { required: true, message: "Please select department" },
                ]}
              >
                <Select placeholder="Select department">
                  {departments.map((dept) => (
                    <Option key={dept._id} value={dept._id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: "Please enter position" }]}
              >
                <Input placeholder="Enter position"></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="baseSalary"
                label="Base Salary"
                rules={[
                  { required: true, message: "Please enter base salary" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Enter base salary"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hireDate"
                label="Hire Date"
                rules={[
                  { required: true, message: "Please select hire date" },
                ]}
                initialValue={dayjs()}  
                >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;