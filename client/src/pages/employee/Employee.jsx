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
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../configs/axiosCustomize';
import { SearchOutlined, FilterOutlined, UserOutlined, ClearOutlined, UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartments } from "@/apis/departments/departments";
import { getEmployees, getEmployeePosition } from "@/apis/employees/employee";
import { useForm } from "antd/es/form/Form";
import { useSelector } from 'react-redux';
import useLastPageSession from '@/hooks/useSession';
import { getPositions } from "@/apis/position/position";

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
  const {
    sessionFilters,
    updateFilter,
    clearFilters,
    isLoading
  } = useLastPageSession(filters); 
  useEffect(() => {
    if (!isLoading) {
      setFilters(sessionFilters);
      fetchEmployees(sessionFilters);
    }
  }, [isLoading]);
  useEffect(() => {
    if (user?.position === "STAFF" && user?.role === "EMPLOYEE") {
      navigate(`/dashboard/employee/${user.employeeId}`);
      return;
    }
    fetchDepartments();
    fetchPositions();
  }, [user, navigate]);

  useEffect(() => {
    if (!isLoading) {
      fetchEmployees(filters);
    }
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
        setEmployees(response.data) 
        setPagination({
          ...pagination,
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      } else {
        messageApi.error(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      messageApi.error("Lỗi lấy danh sách nhân viên");
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
      const response = await getPositions({});
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
      if (error.response && error.response.data) {
        messageApi.error(error.response.data.message || "Lỗi thêm nhân viên");
      } else {
        messageApi.error("Lỗi thêm nhân viên");
      }
    }
  }

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
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
    clearFilters();
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
      title: "Nhân Viên",
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
      title: "Phòng Ban",
      dataIndex: "departmentId",
      key: "department",
      render: (dept) => dept?.name || "N/A",
    },
    {
      title: "Vị Trí",
      dataIndex: "position",
      key: "position",
      render: (pos) => pos?.name || "N/A",
    },
    {
      title: "Giới Tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        let color = gender === "MALE" ? "blue" : gender === "FEMALE" ? "pink" : "default";
        let text = gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Lương Cơ Bản",
      dataIndex: "baseSalary",
      key: "baseSalary",
      render: (salary) => formatSalary(salary),
      sorter: (a, b) => a.baseSalary - b.baseSalary,
    },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "hireDate",
      key: "hireDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.hireDate) - new Date(b.hireDate),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/dashboard/employee/${record._id}`}>
            <Button type="link">Xem</Button>
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
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined />}
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Phòng ban"
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
            placeholder="Vị trí"
            value={filters.position}
            onChange={(value) => handleFilterChange("position", value)}
            style={{ width: 180 }}
            allowClear
          >
            {positions.map(pos => (
              <Option key={pos._id} value={pos._id}>{pos.name}</Option>
            ))}
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawer(true)}
          >
            Thêm bộ lọc
          </Button>

          {Object.values(filters).some(v =>
            v && (Array.isArray(v) ? v.length > 0 : true)
          ) && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
        </Space>
        {user?.role === "ADMIN" &&
          <Button icon={<UserAddOutlined />} onClick={() => setAddModalVisible(true)}>
            Thêm nhân viên
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
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mục`,
        }}
        onChange={handlePagination}
      />

      <Drawer
        title="Lọc"
        placement="right"
        onClose={() => setDrawer(false)}
        open={drawer}
        width={400}
      >
        <Form layout="vertical">
          <Form.Item label="Giới tính">
            <Select
              placeholder="Chọn giới tính"
              value={filters.gender}
              onChange={(value) => handleFilterChange("gender", value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Lương cơ bản">
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

          <Form.Item label="Ngày bắt đầu">
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
                Xóa tất cả
              </Button>
            </Col>

          </Row>
        </Form>
      </Drawer>
      <Modal
        title="Thêm Nhân Viên"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAdd}
        okText="Thêm"
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
                  { required: true, message: "Vui lòng nhập email" },
                  { type: 'email', message: "Vui lòng nhập email hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên" },
                ]}
              >
                <Input placeholder="Nhập họ tên" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^(\+84|84|0)([3|5|7|8|9])([0-9]{8})$/,
                    message: "Vui lòng nhập số điện thoại hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea placeholder="Nhập địa chỉ" rows={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="Phòng ban"
                rules={[
                  { required: true, message: "Vui lòng chọn phòng ban" },
                ]}
              >
                <Select placeholder="Chọn phòng ban">
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
                label="Vị trí"
                rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
              >
                <Select placeholder="Chọn vị trí">
                  {positions.map((pos) => (
                    <Option key={pos._id} value={pos._id}>
                      {pos.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="baseSalary"
                label="Lương cơ bản"
                rules={[
                  { required: true, message: "Vui lòng nhập lương cơ bản" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập lương cơ bản"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hireDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
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