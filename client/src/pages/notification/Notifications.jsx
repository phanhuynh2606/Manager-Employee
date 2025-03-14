import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Radio, Typography, message, Modal, Form, Input, Select, TreeSelect } from 'antd';
import { createNotification, getNotifications } from '@/apis/notifications/notifications.api';
import { useSelector } from 'react-redux';
import { assignManager, getDepartments } from '@/apis/departments/departments';
import buildTreeSelect from '@/utils/buildTreeSelect';
const { Title, Text } = Typography;
const { Option } = Select;
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // Giả định ID nhân viên
  const { role } = useSelector((state) => state.auth.user);
  const [departments, setDepartments] = useState([]);
  const [selectedType, setSelectedType] = useState('SYSTEM');
  const [loadingData, setLoadingData] = useState(false);
  const [treeData, setTreeData] = useState([]);
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`http://localhost:5000/notifications/${id}/read`, { employeeId });
      message.success('Đã đánh dấu là đã đọc');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredNotifications = notifications?.filter((n) => {
    if (filter === 'READ') return n.readBy.includes(employeeId);
    if (filter === 'UNREAD') return !n.readBy.includes(employeeId);
    return true;
  });
  const handleCreateNotification = async () => {
    const res = await getDepartments();
    console.log(res);
    if (res.success) {
      setDepartments(res.data);
    }
    setIsModalVisible(true);
  };
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const res = await createNotification(values);
      if(res.success){
        message.success('Tạo thông báo thành công!');
      }else{
        message.error(res.message);
      }
      form.resetFields();
      setSelectedType('SYSTEM');
      setIsModalVisible(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleCancel = () => {

    setIsModalVisible(false);
  };
  const handleTypeChange = async (value) => {
    setSelectedType(value);
    setLoadingData(true)
    if (value === 'PERSONAL') {
      const res = await assignManager();
      if (res.success) {
        setLoadingData(false);
        const treeSelect = buildTreeSelect(res.data);
        if (treeSelect) {
          setTreeData(buildTreeSelect(res.data));
        }

      }
    }
    if (value !== 'DEPARTMENT') {
      form.setFieldsValue({ departmentId: undefined });
    }
    if (value !== 'PERSONAL') {
      form.setFieldsValue({ recipientId: undefined });
    }
  };

  const handleDepartmentChange = (value) => {
    if (value.includes('ALL')) {
      form.setFieldsValue({ departmentId: ['ALL'] });
    }
  };
  return (
    <div className="mx-auto p-3">
      <Title level={2} className="mb-4">Thông báo</Title>

      <div className='flex justify-between align-center pr-10'>
        <div className="mb-4">
          <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
            <Radio.Button value="ALL">Tất cả</Radio.Button>
            <Radio.Button value="READ">Đã đọc</Radio.Button>
            <Radio.Button value="UNREAD">Chưa đọc</Radio.Button>
          </Radio.Group>
        </div>
        {role === 'ADMIN' && (
          <Button type="primary" onClick={handleCreateNotification} className="bg-blue-500">Tạo thông báo</Button>
        )}
      </div>
      <div className="space-y-4">
        {filteredNotifications?.map((notification) => (
          <Card key={notification._id} className={`shadow-md ${notification.readBy.includes(employeeId) ? 'bg-gray-100' : 'bg-white'}`}>
            <Title level={4}>{notification.title}</Title>
            <Text>{notification.content}</Text>
            {!notification.readBy.includes(employeeId) && (
              <Button type="link" onClick={() => markAsRead(notification._id)} className="mt-2 text-blue-500">
                Đánh dấu là đã đọc
              </Button>
            )}
          </Card>
        ))}
      </div>
      {/* Modal Tạo Thông Báo */}
      <Modal title="Tạo Thông Báo" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Gửi" cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: "#1890ff", borderColor: "#1890ff" } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
            <Input.TextArea rows={2} placeholder="Nhập nội dung" />
          </Form.Item>
          <Form.Item name="type" label="Loại Thông Báo" rules={[{ required: true, message: 'Vui lòng chọn loại thông báo!' }]} initialValue={"SYSTEM"}>
            <Select placeholder="Chọn loại thông báo" onChange={handleTypeChange} >
              <Option value="SYSTEM">Hệ thống</Option>
              <Option value="DEPARTMENT">Phòng ban</Option>
              <Option value="PERSONAL">Cá nhân</Option>
            </Select>
          </Form.Item>
          {selectedType === 'DEPARTMENT' && (
            <Form.Item name="departmentId" label="Phòng Ban">
              <Select
                placeholder="Chọn phòng ban"
                allowClear
                mode="multiple"
                onChange={handleDepartmentChange}
              >
                <Option value={'ALL'}>Tất cả</Option>
                {departments.map((dept) => (
                  <Option key={dept._id} value={dept._id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {selectedType === 'PERSONAL' && (
            <Form.Item name="recipientId" label="Nhân viên">
              <TreeSelect
                treeData={treeData}
                placeholder={loadingData ? 'Đang tải dữ liệu...' : 'Chọn nhân viên gửi thông báo'}
                allowClear
                multiple
                showSearch
                treeCheckable
                filterTreeNode={(input, node) =>
                  node.title.toLowerCase().includes(input.toLowerCase())
                }
                disabled={loadingData}
                loading={loadingData}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
