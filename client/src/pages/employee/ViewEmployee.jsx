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
import { getEmployeeDetail } from "@/apis/employees/employee";
import { getPositions } from "@/apis/position/position";
import { getDepartments } from "@/apis/departments/departments";
import { RestoreOutlined } from "@mui/icons-material";
import { useSelector } from "react-redux";
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

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
  const user = useSelector((state) => state?.auth?.user);

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
        messageApi.error("Lỗi tải dữ liệu nhân viên");
      }
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
      messageApi.error("Lỗi tải dữ liệu nhân viên");
    } finally {
      setLoading(false);
    }
  };
  const fetchSelectData = async () => {
    try {
      setLoading(true);
      const departmentData = await getDepartments();
      const positionData = await getPositions({});
      console.log(positionData)
      if (departmentData.success && positionData.success) {
        setDepartments(departmentData.data);
        setPosition(positionData.data);
      } else {
        messageApi.error("Lỗi tải dữ liệu phòng ban");
      }
    } catch (error) {
      messageApi.error("Lỗi tải dữ liệu phòng ban");
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
      departmentId: employee.departmentId?._id || null,
      position: employee.position?._id || null

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
      messageApi.error("Lỗi cập nhật dữ liệu nhân viên");
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
      messageApi.error("Lỗi khôi phục mật khẩu");
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
      messageApi.error("Lỗi xóa nhân viên");
    }
  };
  const handleAvatarUpload = async () => {
    if (!fileList.length) {
      return messageApi.error('Vui lòng chọn ảnh để tải lên');
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
        messageApi.error(response.message || 'Lỗi cập nhật ảnh đại diện');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      messageApi.error('Lỗi tải ảnh đại diện');
    } finally {
      setLoading(false);
    }
  };


  const attendanceColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Giờ vào",
      dataIndex: "checkIn",
      key: "checkIn",
    },
    {
      title: "Giờ ra",
      dataIndex: "checkOut",
      key: "checkOut",
    },
    {
      title: "Số giờ làm",
      dataIndex: "workHours",
      key: "workHours",
    },
    {
      title: "Trạng thái",
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

        let text =
          status === "PRESENT"
            ? "Có mặt"
            : status === "LATE"
              ? "Đi muộn"
              : status === "ABSENT"
                ? "Vắng mặt"
                : status;

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Leave history columns
  const leaveColumns = [
    {
      title: "Loại",
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

        let text =
          type === "ANNUAL"
            ? "Nghỉ phép năm"
            : type === "SICK"
              ? "Nghỉ ốm"
              : type === "UNPAID"
                ? "Nghỉ không lương"
                : type;

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Từ ngày",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Đến ngày",
      dataIndex: "toDate",
      key: "toDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Số ngày",
      dataIndex: "days",
      key: "days",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Trạng thái",
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

        let text =
          status === "APPROVED"
            ? "Đã duyệt"
            : status === "PENDING"
              ? "Đang chờ"
              : status === "REJECTED"
                ? "Từ chối"
                : status;

        return <Tag color={color}>{text}</Tag>;
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
      {(user.role === "ADMIN" || user.position === "MANAGER") &&
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dashboard/employee")}
            >
              Quay lại danh sách
            </Button>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Space>
              {(user?.position === "MANAGER" || user.role === "ADMIN") &&
                <Button style={{ backgroundColor: "orange" }} icon={<RestoreOutlined />} onClick={() => setResetModalVisible(true)}>
                  Khôi phục mật khẩu
                </Button>
              }
              {user.role === "ADMIN" &&
                <>
                  <Button icon={<EditOutlined />} onClick={handleEdit}>
                    Chỉnh sửa
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteModalVisible(true)}
                  >
                    Xóa
                  </Button>
                </>
              }
            </Space>
          </Col>
        </Row>
      }

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
              <Text type="secondary">{employee?.position?.name}</Text>
              <div className="mt-2">
                <Tag color="blue">
                  {employee?.departmentId?.name || "Chưa có phòng ban"}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={18}>
            <Descriptions title="Thông tin chi tiết" bordered column={2}>
              <Descriptions.Item label="Họ tên">
                {employee?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                <CalendarOutlined className="mr-1" />{" "}
                {formatDate(employee?.dateOfBirth)}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {employee?.gender === "MALE"
                  ? "Nam"
                  : employee?.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <PhoneOutlined className="mr-1" /> {employee?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined className="mr-1" />{" "}
                {employee?.userId?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <EnvironmentOutlined className="mr-1" /> {employee?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Lương cơ bản">
                <DollarOutlined className="mr-1" />{" "}
                {formatSalary(employee?.baseSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày vào làm">
                <CalendarOutlined className="mr-1" />{" "}
                {formatDate(employee?.hireDate)}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Số ngày nghỉ còn lại</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Nghỉ phép năm"
                    value={employee?.leaveBalance?.annual || 0}
                    suffix="ngày"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Nghỉ ốm"
                    value={employee?.leaveBalance?.sick || 0}
                    suffix="ngày"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Nghỉ không lương"
                    value={employee?.leaveBalance?.unpaid || 0}
                    suffix="ngày"
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Tabs for additional information */}
      {/* <Card>
        <Tabs defaultActiveKey="attendance">
          <TabPane tab="Lịch sử chấm công" key="attendance">
            <Table
              columns={attendanceColumns}
              dataSource={attendanceData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Lịch sử nghỉ phép" key="leave">
            <Table
              columns={leaveColumns}
              dataSource={leaveData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Lịch sử lương" key="payroll">
            <p>Thông tin lịch sử lương sẽ được hiển thị ở đây.</p>
          </TabPane>
        </Tabs>
      </Card> */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa tài khoản {employee?.fullName} không ?</p>
      </Modal>
      <Modal
        title="Xác nhận khôi phục mật khẩu"
        open={resetModalVisible}
        onOk={handleResetPassword}
        onCancel={() => setResetModalVisible(false)}
        okText="Khôi phục"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn khôi phục mật khẩu tài khoản {employee?.fullName} không ?</p>
      </Modal>
      {/* Update Employee Modal */}
      <Modal
        title="Cập nhật nhân viên"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={handleUpdate}
        okText="Cập nhật"
        okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
        confirmLoading={loading}
        width={800}
        destroyOnClose
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Đang tải dữ liệu nhân viên..." />
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
                  label="Họ tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ tên" },
                  ]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
              </Col>
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
                      pattern: /^[0-9+\-\s]+$/,
                      message: "Vui lòng nhập số điện thoại hợp lệ",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
            </Form.Item>

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
                    {position.map((p) => (
                      <Option key={p._id} value={p._id}>
                        {p.name}
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
                  label="Ngày vào làm"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày vào làm" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isActive"
              label="Trạng thái hoạt động"
              valuePropName="checked"
            >
              <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        title="Thay đổi ảnh đại diện"
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
            Hủy
          </Button>,
          <Button
            key="upload"
            okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
            onClick={() => handleAvatarUpload()}
            disabled={fileList.length === 0}
          >
            Tải lên
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
                messageApi.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
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
                <div style={{ marginTop: 8 }}>Tải lên</div>
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
              Xóa
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <span>Vui lòng chọn ảnh bạn muốn thay đổi và chọn Tải lên</span>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDetail;