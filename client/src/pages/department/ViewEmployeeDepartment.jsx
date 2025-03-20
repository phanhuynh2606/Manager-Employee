
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Modal, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const EmployeeListModal = ({ visible, onCancel, employees, loading }) => {
  const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
  const navigate = useNavigate();
  const columns = [
    {
      title: "Tên nhân viên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
        <Avatar
          src={record?.avatarUrl}
          icon={<UserOutlined />}
          size="large"
        />
        <div>
          <div style={{ fontWeight: "bold" }}>{record?.fullName}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>{record.phoneNumber}</div>
        </div>
      </Space>
      )
    },
    {
      title: "Email",
      dataIndex: ["userId", "email"],
      key: "userId.email"
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
          title: "Ngày Bắt Đầu",
          dataIndex: "hireDate",
          key: "hireDate",
          render: (date) => dayjs(date).format("DD/MM/YYYY"),
          sorter: (a, b) => new Date(a.hireDate) - new Date(b.hireDate),
    },
  ];

  return (
    <Modal
      title="Danh sách nhân viên"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        onRow={(record) => ({
          onClick: () => navigate(`/dashboard/employee/${record._id}`),
        })}
        rowClassName="cursor-pointer"
        dataSource={employees}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  )
}

export default EmployeeListModal