import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Avatar, Tag, Row, Col, DatePicker } from 'antd';
import { DeleteOutlined, EyeFilled, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { createAdmin, getAdmins } from '@/apis/admin/admin.api';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const { Option } = Select;

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Call API to get admins
        const response = await getAdmins();
        if (response.success) {
          setAdmins(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchAdmins();
  }, []);
  const handleAdd = () => {
    setLoading(true);
    form.validateFields().then(async (values) => {
      const res = await createAdmin(values);
      console.log(res);
      if (res.success) {
        const newAdmin = { id: Date.now(), ...values };
        setAdmins((prev) => [...prev, newAdmin]);
        message.success(res.message);
        setIsModalOpen(false);
        form.resetFields();
        setEditingAdmin(null);
        setLoading(false);
      } else {
        message.error('Thêm tài khoản thất bại');
      }
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Bạn chắc chắn muốn xóa tài khoản này chứ?',
      onOk: async () => {
        setAdmins((prev) => prev.filter((admin) => admin.id !== id));
        const response = await axios.delete(`/admin/${id}`);
        if (response.success) {
          message.success('Xóa tài khoản thành công');
        } else {
          message.error(response.message);
        }
      },
    });
  };


  const columns = [
    {
      title: "ADMIN",
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
            <div style={{ fontSize: "13px", color: "#888" }}>{record.phoneNumber}</div>
          </div>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive',
      render: (isActive) => {
        let color, text;
        switch (isActive) {
          case "0":
            color = "yellow";
            text = "Chưa kích hoạt";
            break;
          case "1":
            color = "green";
            text = "Đã kích hoạt";
            break;
          case "2":
            color = "red";
            text = "Đã khóa";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        let color = gender === "MALE" ? "blue" : gender === "FEMALE" ? "pink" : "default";
        let text = gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        return dayjs(date).format("HH:mm:ss DD/MM/YYYY");
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Link to={`/dashboard/admin/${record.id}`}>
            <Button icon={<EyeFilled />} />
          </Link>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </div>
      ),
    },

  ];
  const filteredAdmins = admins?.filter(ad => {
    const matchesSearchText =
      ad?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      ad?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      ad?.phoneNumber?.toLowerCase().includes(searchText.toLowerCase());

    // Điều kiện lọc theo statusFilter
    const matchesStatus =
      statusFilter === "" || String(ad.isActive) === statusFilter;

    // Kết hợp cả hai điều kiện
    return matchesSearchText && matchesStatus;
  }
  );
  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue({ hireDate: dayjs() });
    }
  }, [isModalOpen, form]);
  return (
    <div className="p-4 pt-2">
      <h1 className="text-xl font-bold mb-3">Quản lý Admin</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 160 }}
        >
          <Option value="">Tất cả</Option>
          <Option value="0">Chưa kích hoạt</Option>
          <Option value="1">Đã kích hoạt</Option>
          <Option value="2">Đã khóa</Option>
        </Select>
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm Admin
        </Button>
      </Space>
      <Table dataSource={filteredAdmins} columns={columns} rowKey="id" />

      <Modal
        title="Thêm Admin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: "#1890ff" } }}
        width={800}
        destroyOnClose
        confirmLoading={loading}
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
                  { required: true, message: "Hãy nhập email" },
                  { type: 'email', message: "Nhập đúng định dạng email" },
                ]}
                initialValues={{
                  hireDate: dayjs(), // Đặt giá trị mặc định cho hireDate là ngày hiện tại
                }}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và Tên"
                rules={[
                  { required: true, message: "Hãy nhập họ và tên" },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
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
                  { required: true, message: "Hãy nhập số điện thoại" },
                  {
                    pattern: /^[0-9+\-\s]+$/,
                    message: "Nhập đúng định dạng số điện thoại",
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
                  { required: true, message: "Nhập ngày sinh nhật" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder='Chọn ngày sinh nhật' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Nhập địa chỉ" }]}
              >
                <Input.TextArea placeholder="Nhập địa chỉ" rows={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hireDate"
                label="Ngày tuyển dụng"
                rules={[
                  { required: true, message: "Chọn ngày bắt đầu làm việc" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder='Ngày bắt đầu làm việc' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManagement;
