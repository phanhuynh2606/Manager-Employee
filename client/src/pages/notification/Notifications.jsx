import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, message, Modal, Form, Input, Select, TreeSelect, Pagination, Skeleton, DatePicker, Space, notification } from 'antd';
import { createNotification, getNotifications, updatemarkAsRead } from '@/apis/notifications/notifications.api';
import { useSelector } from 'react-redux';
import { assignManager, getDepartments } from '@/apis/departments/departments';
import buildTreeSelect from '@/utils/buildTreeSelect';
import dayjs from 'dayjs';
import { Filter } from './Filter';
import socket from '@/utils/socket';
const { Title, Text } = Typography;
const { Option } = Select;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // Giả định ID nhân viên
  const { user } = useSelector((state) => state.auth);
  const [departments, setDepartments] = useState([]);
  const [selectedType, setSelectedType] = useState('SYSTEM');
  const [loadingData, setLoadingData] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedTypeSelect, setSelectedTypeSelect] = useState('ALL');
  const [dateRange, setDateRange] = useState([]);
  const pageSize = 10;
  const {employeeId} = useSelector((state) => state.auth.user);
  
  
  const fetchNotifications = async (page = 1) => {
    try {
      setLoadingNotifications(true);
      const startDate = dateRange.length ? dayjs(dateRange[0]).format('YYYY-MM-DD') : '';
      const endDate = dateRange.length ? dayjs(dateRange[1]).format('YYYY-MM-DD') : '';
      const res = await getNotifications(page, pageSize, filter, selectedTypeSelect, startDate, endDate);
      if (res.success) {
        setNotifications(res.data);
        setTotalNotifications(
          filter === 'ALL'
            ? res.totalNotifications
            : filter === 'READ'
            ? res.readNotifications
            : res.unreadNotifications
        );
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, [filter, selectedTypeSelect, dateRange]);

  // Tích hợp Socket.IO để nhận real-time
  useEffect(() => {
    if (!employeeId) return;

    // Lắng nghe sự kiện newNotification
    const handleNewNotification = (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setTotalNotifications((prev) => prev + 1);
    };

    socket.on("newNotification", handleNewNotification);

    // Cleanup
    return () => {
      console.log("Cleaning up socket listeners in Notifications");
      socket.off("newNotification", handleNewNotification);
    };
  }, []);
  const markAsRead = async (id) => {
    try {
      const res = await updatemarkAsRead(id);
      if(res.success){
        message.success('Đã đánh dấu là đã đọc');
      }else{
        message.error(res.message);
      }
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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
      if (res.success) {
        message.success('Tạo thông báo thành công!');
      } else {
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  return (
    <div className="mx-auto p-3">
      <Title level={2} className="mb-4">Thông báo</Title>

      <div className='flex justify-between align-center pr-10'>
        <div className="mb-4">
          <Filter filter={filter} setFilter={setFilter}
            selectedType={selectedTypeSelect} setSelectedType={setSelectedTypeSelect}
            dateRange={dateRange} setDateRange={setDateRange}
          />
        </div>
        {user?.role === 'ADMIN' && (
          <Button type="primary" onClick={handleCreateNotification} className="bg-blue-500">Tạo thông báo</Button>
        )}
      </div>
      <div>
        <div className="space-y-2">
          {/* Danh sách thông báo */}
          {loadingNotifications ? (
             <Skeleton active />
          ) :<>
              {notifications.length === 0 && (
                <Text type="secondary" className='text-[20px]'>Chưa có thông báo nào {filter==='ALL'?'':(filter==='READ'?"đã đọc":"chưa dọc")}</Text>
              )}
              {notifications?.map((notification) => {
                const isRead = notification.readBy.includes(employeeId);
                return (
                  <Card
                    key={notification._id}
                    className={`shadow-md ${isRead ? 'bg-gray-100 border-l-4' : 'bg-blue-100 border-l-4 border-blue-500'}`}
                  >
                    <div className="flex justify-between items-center">
                      <Title level={4} className="mb-1">{notification.title}</Title>
                      <Text className="text-gray-500 text-[16px]">{dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                    </div>
                    <Text className="block mb-1">{notification.content}</Text>
                    <div className="flex justify-between items-center">
                      <Text type="secondary">
                        <strong>Loại:</strong> {notification.type === 'SYSTEM' ? 'Hệ thống' : notification.type === 'DEPARTMENT' ? 'Phòng ban' : 'Cá nhân'}
                      </Text>
                      <Text type="secondary">
                        <strong>Người gửi:</strong> {notification?.createdBy || 'Không rõ'}
                      </Text>
                    </div>
                    {!isRead && (
                      <Button
                        onClick={() => markAsRead(notification._id)}
                        className="mt-2 text-blue-500 border-none"
                      >
                        Đánh dấu là đã đọc
                      </Button>
                    )}
                  </Card>
                );
              })}
          </>}
        </div>
        {/* Phân trang */}
        {totalNotifications > 0 && (
            <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalNotifications}
              onChange={handlePageChange}
            />
          </div>
        )}
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
