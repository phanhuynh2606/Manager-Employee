import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Avatar,
  Tag,
  Button,
  Tabs,
  Space,
  Table,
  Divider,
  Spin,
  message,
  Modal,
  Statistic,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Select,
  Upload,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  CloseOutlined 
} from "@ant-design/icons";
import axios from '../../configs/axiosCustomize';
import dayjs from "dayjs";
import { getEmployeeDetail, getEmployeePosition } from "@/apis/employees/employee";
import { getDepartments } from "@/apis/departments/departments";
import { RestoreOutlined } from "@mui/icons-material";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [position, setPosition] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchEmployeeData();
    fetchSelectData();
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeDetail(employeeId);
      if (response.success) {
        setEmployee(response.data);
      } else {
        messageApi.error("Failed to fetch employee data");
      }
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
      messageApi.error("Failed to fetch employee data");
    } finally {
      setLoading(false);
    }
  };
  const fetchSelectData = async () => {
    try {
      setLoading(true);
      const departmentData = await getDepartments();
      const positionData = await getEmployeePosition();
      if (departmentData.success && positionData.success) {
        setDepartments(departmentData.data);
        setPosition(positionData.data);
      } else {
        messageApi.error("Failed to fetch department data");
      }
    } catch (error) {
      messageApi.error("Failed to fetch department data");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const formatSalary = (value) => {
    return `${value?.toLocaleString("vi-VN")} ₫`;
  };

  const handleEdit = () => {
    const formattedEmployee = {
      ...employee,
      dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
      hireDate: employee.hireDate ? dayjs(employee.hireDate) : null,
      departmentId: employee.departmentId?._id || null
    };
    form.setFieldsValue(formattedEmployee)
    setUpdateModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const dataForm = await form.validateFields();
      const response = await axios.put(`/employee/${employeeId}`, dataForm);
      if (response.success) {
        setUpdateModalVisible(false);
        await fetchEmployeeData();
        setTimeout(() => {
          messageApi.success(response.message);
        }, 200);
      }
      else {
        messageApi.error(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
      messageApi.error("Failed to fetch employee data");
    }
  };

  const handleResetPassword = async () => { 
    try {
      const response = await axios.post('/employee/reset-password', { employeeId });
      if (response.success) {
        messageApi.success(response.message);
        setTimeout(() => {
          navigate("/dashboard/employee");
        }, 1000);
      }
      else {
        messageApi.error(response.message);
      }  
      setResetModalVisible(false); 
    } catch (error) { 
      console.error("Failed to fetch employee data:", error);
      messageApi.error("Failed to fetch employee data");
    }  
  };
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/employee/${employeeId}`);
      if (response.success) {
        messageApi.success(response.message);
        setTimeout(() => {
          navigate("/dashboard/employee");
        }, 1000);
      } else {
        messageApi.error(response.message);
      }
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Failed to delete employee:", error);
      messageApi.error("Failed to delete employee");
    } 
  };
  const handleAvatarUpload = async () => {
    if (!fileList.length) {
      return messageApi.error('Please select an image to upload');
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', fileList[0].originFileObj);
    try {
      const response = await axios.post(`/employee/change-avatar/${employeeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }); 
      if (response.success) {
        setAvatarModalVisible(false);
        setFileList([]);
        await fetchEmployeeData();
        setTimeout(() => {
          messageApi.success(response.message);
        }, 200);  
      } else {
        messageApi.error(response.message || 'Failed to update avatar');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      messageApi.error('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };


  const attendanceColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
    },
    {
      title: "Work Hours",
      dataIndex: "workHours",
      key: "workHours",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "PRESENT"
            ? "green"
            : status === "LATE"
              ? "orange"
              : status === "ABSENT"
                ? "red"
                : "default";

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  // Leave history columns
  const leaveColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color =
          type === "ANNUAL"
            ? "blue"
            : type === "SICK"
              ? "red"
              : type === "UNPAID"
                ? "orange"
                : "default";

        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "From",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (date) => formatDate(date),
    },
    {
      title: "To",
      dataIndex: "toDate",
      key: "toDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "APPROVED"
            ? "green"
            : status === "PENDING"
              ? "gold"
              : status === "REJECTED"
                ? "red"
                : "default";

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  // Sample attendance data
  const attendanceData = [
    {
      key: "1",
      date: "2025-03-01",
      checkIn: "08:05",
      checkOut: "17:30",
      workHours: "9.25",
      status: "PRESENT",
    },
    {
      key: "2",
      date: "2025-03-04",
      checkIn: "08:45",
      checkOut: "17:15",
      workHours: "8.5",
      status: "LATE",
    },
    {
      key: "3",
      date: "2025-03-05",
      checkIn: "08:00",
      checkOut: "17:00",
      workHours: "9.0",
      status: "PRESENT",
    },
  ];

  // Sample leave data
  const leaveData = [
    {
      key: "1",
      type: "ANNUAL",
      fromDate: "2025-02-10",
      toDate: "2025-02-12",
      days: "3",
      reason: "Family vacation",
      status: "APPROVED",
    },
    {
      key: "2",
      type: "SICK",
      fromDate: "2025-01-05",
      toDate: "2025-01-05",
      days: "1",
      reason: "Fever",
      status: "APPROVED",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "500px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {contextHolder}

      {/* Navigation and actions */}
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard/employee")}
          >
            Back to Employees
          </Button>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Space>
            <Button style={{ backgroundColor: "orange" }} icon={<RestoreOutlined />} onClick={() => setResetModalVisible(true)}>
              Reset Password
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              Delete
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Employee profile card */}
      <Card bordered={false} className="mb-4">
        <Row gutter={24}>
          <Col span={6} style={{ textAlign: "center" }}>
            <div
              className="avatar-container"
              style={{
                position: "relative",
                display: "inline-block",
                borderRadius: "50%",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('.avatar-hover-button').style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector('.avatar-hover-button').style.opacity = 0;
              }} 
            >
              <Avatar
                size={150}
                src={employee?.avatarUrl}
                icon={<UserOutlined />}
              />
              <div
                className="avatar-hover-button"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "50%",
                  opacity: 0,
                  transition: "opacity 0.3s",
                  cursor: "pointer"
                }}
                onClick={() => setAvatarModalVisible(true)}
              >
                <CameraOutlined style={{ fontSize: 36, color: "white" }} />
              </div>
            </div>
            <div className="mt-4">
              <Title level={4}>{employee?.userId?.username}</Title>
              <Text type="secondary">{employee?.position}</Text>
              <div className="mt-2">
                <Tag color="blue">
                  {employee?.departmentId?.name || "No Department"}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={18}>
            <Descriptions title="Information Details" bordered column={2}>
              <Descriptions.Item label="Fullname">
                {employee?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                <CalendarOutlined className="mr-1" />{" "}
                {formatDate(employee?.dateOfBirth)}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {employee?.gender === "MALE"
                  ? "Male"
                  : employee?.gender === "FEMALE"
                    ? "Female"
                    : "Other"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <PhoneOutlined className="mr-1" /> {employee?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined className="mr-1" />{" "}
                {employee?.userId?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <EnvironmentOutlined className="mr-1" /> {employee?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Base Salary">
                <DollarOutlined className="mr-1" />{" "}
                {formatSalary(employee?.baseSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Hire Date">
                <CalendarOutlined className="mr-1" />{" "}
                {formatDate(employee?.hireDate)}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Leave Balance</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Annual Leave"
                    value={employee?.leaveBalance?.annual || 0}
                    suffix="days"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Sick Leave"
                    value={employee?.leaveBalance?.sick || 0}
                    suffix="days"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Unpaid Leave"
                    value={employee?.leaveBalance?.unpaid || 0}
                    suffix="days"
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Tabs for additional information */}
      <Card>
        <Tabs defaultActiveKey="attendance">
          <TabPane tab="Attendance History" key="attendance">
            <Table
              columns={attendanceColumns}
              dataSource={attendanceData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Leave History" key="leave">
            <Table
              columns={leaveColumns}
              dataSource={leaveData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Payroll History" key="payroll">
            <p>Payroll history content will be displayed here.</p>
          </TabPane>
        </Tabs>
      </Card>
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa tài khoản {employee?.fullName} không ?</p>
      </Modal>
      <Modal
        title="Confirm Reset Passowrd"
        open={resetModalVisible}
        onOk={handleResetPassword}
        onCancel={() => setResetModalVisible(false)}
        okText="Reset"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn Reset password tài khoản {employee?.fullName} không ?</p>
      </Modal>
      {/* Update Employee Modal */}
      <Modal
        title="Update Employee"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={handleUpdate}
        okText="Update"
        okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
        confirmLoading={loading}
        width={800}
        destroyOnClose
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Loading employee data..." />
          </div>
        ) : (
          <Form
            layout="vertical"
            form={form}
          >
            <Row gutter={16}>
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
                      pattern: /^[0-9+\-\s]+$/,
                      message: "Please enter a valid phone number",
                    },
                  ]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input.TextArea placeholder="Enter address" rows={2} />
            </Form.Item>

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
                  <Select placeholder="Select position">
                    {position.map((p, index) => (
                      <Option key={index} value={p}>
                        {p}
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
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        title="Change Avatar"
        open={avatarModalVisible}
        onCancel={() => {
          setAvatarModalVisible(false);
          setFileList([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setAvatarModalVisible(false);
            setFileList([]);
          }}>
            Cancel
          </Button>,
          <Button 
            key="upload"   
            okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
            onClick={() => handleAvatarUpload()}
            disabled={fileList.length === 0}
          >
            Upload
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          {fileList.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <img 
                src={fileList[0].url || URL.createObjectURL(fileList[0].originFileObj)} 
                alt="Avatar Preview" 
                style={{ 
                  width: 150, 
                  height: 150, 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '1px solid #d9d9d9' 
                }} 
              />
            </div>
          )}

          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={(file) => { 
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                messageApi.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
              } 
              setFileList([{
                uid: '-1',
                name: file.name,
                status: 'done',
                originFileObj: file,
              }]);
              
              return false;  
            }}
          >
            {fileList.length === 0 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
          
          {fileList.length > 0 && (
            <Button 
              icon={<CloseOutlined />} 
              danger
              onClick={() => setFileList([])}
              style={{ marginTop: 8 }}
            >
              Remove
            </Button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <span>Vui lòng chọn ảnh bạn muốn thay đổi và chọn Upload</span>
        </div>
      </Modal> 
    </div>
  );
};

export default EmployeeDetail;
