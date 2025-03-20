
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

import { LockClockOutlined, RestoreOutlined } from "@mui/icons-material";
import { getAdminDetail } from "@/apis/admin/admin.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDetail = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [admin, setAdmin] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [position, setPosition] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [unlockAccount, setUnlockAccount] = useState(false);
  useEffect(() => {
    fetchAdminData();
  }, [adminId,unlockAccount,updateModalVisible]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDetail(adminId);
      if (response.success) {
        setAdmin(response.data);
      } else {
        messageApi.error("Failed to fetch admin data");
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      messageApi.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };


  const handleEdit = () => {
    const formattedEmployee = {
      ...admin,
      dateOfBirth: admin.dateOfBirth ? dayjs(admin.dateOfBirth) : null,
    };
    form.setFieldsValue(formattedEmployee)
    setUpdateModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const dataForm = await form.validateFields();
      const response = await axios.put(`/employee/${admin?.employeeId}`, dataForm);
      if (response.success) {
        setUpdateModalVisible(false);
        setTimeout(() => {
          messageApi.success(response.message);
        }, 200);
      }
      else {
        messageApi.error(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      messageApi.error("Failed to fetch admin data");
    }
  };

  const handleResetPassword = async () => {
    try {
      const employeeId = admin.employeeId;
      const response = await axios.post('/employee/reset-password', { employeeId });
      if (response.success) {
        messageApi.success(response.message);
        setTimeout(() => {
          navigate("/dashboard/admin");
        }, 1000);
      }
      else {
        messageApi.error(response.message);
      }
      setResetModalVisible(false);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      messageApi.error("Failed to fetch admin data");
    }
  };
  const handleLockAccount = async () => {
    try {
      const response = await axios.put(`/admin/lock-account/${adminId}`);
      if (response.success) {
        messageApi.success(response.message);
        setTimeout(() => {
          navigate("/dashboard/admin");
        }, 1000);
      }
      else {
        messageApi.error(response.message);
      }
      setResetModalVisible(false);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      messageApi.error("Failed to fetch admin data");
    }
  }

  const handleUnlockAccount = async () => {
    try {
      const response = await axios.put(`/admin/unlock-account/${adminId}`);
      if (response.success) {
        messageApi.success(response.message);
        setUnlockAccount(true);
      }
      else {
        messageApi.error(response.message);
      }
      setResetModalVisible(false);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      messageApi.error("Failed to fetch admin data");
    }

  }
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/admin/${adminId}`);
      if (response.success) {
        messageApi.success(response.message);
        setTimeout(() => {
          navigate("/dashboard/admin");
        }, 1000);
      } else {
        messageApi.error(response.message);
      }
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Failed to delete admin:", error);
      messageApi.error("Failed to delete admin");
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
      const response = await axios.post(`/employee/change-avatar/${admin.employeeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.success) {
        setAvatarModalVisible(false);
        setFileList([]);
        await fetchAdminData();
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
            onClick={() => navigate("/dashboard/admin")}
          >
            Quay lại
          </Button>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Space>
            {admin?.isActive !== '2' ? (
              <>
                <Button style={{ backgroundColor: "darkturquoise" }} icon={<LockClockOutlined />} onClick={() => setLockModalVisible(true)}>
                  Khóa tài khoản
                </Button>
                <Button style={{ backgroundColor: "orange" }} icon={<RestoreOutlined />} onClick={() => setResetModalVisible(true)}>
                  Khôi phục mật khẩu
                </Button>
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  Sửa
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
            ) : (
              <>
                <Button style={{ backgroundColor: "royalblue" }} icon={<LockClockOutlined />} onClick={handleUnlockAccount}>
                  Mở khóa tài khoản
                </Button>
              </>
            )}

          </Space>
        </Col>
      </Row>

      {/* admin profile card */}
      <Card className="mb-4">
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
                src={admin?.avatarUrl}
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
              <Title level={4}>{admin?.username}</Title>
              <Text type="secondary">ADMIN</Text>
              <div className="mt-2">
                <Tag color="blue">
                  {admin?.departmentId?.name || "No Department"}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={18}>
            <Descriptions title="Thông tin chi tiết" bordered column={2}>
              <Descriptions.Item label="Họ và Tên">
                {admin?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                <CalendarOutlined className="mr-1" />{" "}
                {formatDate(admin?.dateOfBirth)}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {admin?.gender === "MALE"
                  ? "Nam"
                  : admin?.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <PhoneOutlined className="mr-1" /> {admin?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined className="mr-1" />{" "}
                {admin?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <EnvironmentOutlined className="mr-1 mb-1" /> {admin?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tuyển dụng">
                <CalendarOutlined className="mr-1" />{" "}
                {formatDate(admin?.hireDate)}
              </Descriptions.Item>
            </Descriptions>

          </Col>
        </Row>
      </Card>

      {/* Tabs for additional information */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa tài khoản {admin?.fullName} không ?</p>
      </Modal>
      <Modal
        title="Xác nhận khóa tài khoản"
        open={lockModalVisible}
        onOk={handleLockAccount}
        onCancel={() => setLockModalVisible(false)}
        okText="Khóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn khóa tài khoản {admin?.fullName} không ?</p>
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
        <p>Bạn có chắc chắn muốn khôi phục mật khẩu tài khoản {admin?.fullName} không ?</p>
      </Modal>
      {/* Update admin Modal */}
      <Modal
        title="Cập nhật thông tin admin"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={handleUpdate}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
        confirmLoading={loading}
        width={800}
        destroyOnClose
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Loading admin data..." />
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
                  label="Họ và Tên"
                  rules={[
                    { required: true, message: "Nhập Họ và Tên" },
                  ]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Chọn ngày sinh" },
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
                  rules={[{ required: true, message: "Chọn giới tính" }]}
                >
                  <Select placeholder="Select gender">
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
                    { required: true, message: "Nhập số điện thoại" },
                    {
                      pattern: /^[0-9+\-\s]+$/,
                      message: "Hãy nhập đúng định dạng số điện thoại",
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
              rules={[{ required: true, message: "Nhập địa chỉ" }]}
            >
              <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        title="Thay đổi ảnh"
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
            Tải
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
              Xóa
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <span>Vui lòng chọn ảnh bạn muốn thay đổi và chọn Tải</span>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDetail;
