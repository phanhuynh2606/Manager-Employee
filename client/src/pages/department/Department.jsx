import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Space, Row, Col, Select, message, Avatar, Popconfirm } from "antd";
import { assignManager, createDepartment, deleteDepartment, getDepartments, updateDepartment } from "@/apis/departments/departments";
import { DeleteFilled, EditFilled, QuestionCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [managerList, setManagerList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const [res, resManager] = await Promise.all([getDepartments(), assignManager()]);
      if (res.success) {
        setLoadingData(false);
        setDepartments(res.data);
        setManagerList(resManager.data);
      } else {
        setLoadingData(true);
      }
    } catch (error) {
      console.error("Failed to fetch departments");
    }
  };

  const handleAddEdit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editingDepartment) {
        // So sánh dữ liệu mới với dữ liệu hiện tại
        const currentData = {
          name: editingDepartment.name,
          description: editingDepartment.description || "", // Đảm bảo không undefined
          roomNumber: editingDepartment.roomNumber,
          managerId: editingDepartment.managerId?._id || "", // Lấy _id của managerId nếu có
        };

        const newData = {
          name: values.name,
          description: values.description || "", // Đảm bảo không undefined
          roomNumber: values.roomNumber,
          managerId: values.managerId || "", // Nếu không chọn thì để rỗng
        };

        const isUnchanged =
          currentData.name === newData.name &&
          currentData.description === newData.description &&
          currentData.roomNumber === newData.roomNumber &&
          currentData.managerId === newData.managerId;

        if (isUnchanged) {
          messageApi.info("Không có thay đổi để cập nhật.");
          setModalOpen(false);
          setLoading(false);
          return;
        }

        const res = await updateDepartment(editingDepartment._id, values);
        if (res.success) {
          messageApi.success("Cập nhật phòng ban thành công");
          setModalOpen(false);
          form.resetFields();
          fetchDepartments();
        } else {
          messageApi.error("Cập nhật phòng ban thất bại");
        }
      } else {
        const res = await createDepartment(values);
        if (res.success) {
          messageApi.success("Tạo phòng ban thành công");
          setModalOpen(false);
          form.resetFields();
          fetchDepartments();
        } else {
          messageApi.error("Tạo phòng ban thất bại");
        }
      }
    } catch (error) {
      console.error("Validation failed:", error);
      messageApi.error("Xảy ra lỗi khi xử lý dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteDepartment(id);
      if (res.success) {
        messageApi.success("Xóa phòng ban thành công");
      } else {
        messageApi.error("Xóa phòng ban thất bại");
      }
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department", error);
      messageApi.error("Xảy ra lỗi khi xóa phòng ban");
    }
  };

  const filteredDepartments = departments?.filter(dept =>
    dept?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    dept?.roomNumber?.toLowerCase().includes(searchText.toLowerCase())
  );
  const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-3">Quản lý phòng ban</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm phòng ban theo tên, phòng"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 260 }}
        />
        <Button type="primary" className="text-[#000]" onClick={() => setModalOpen(true)}>Thêm phòng ban</Button>
      </Space>
      <Table
        dataSource={filteredDepartments}
        loading={loadingData}
        rowKey="_id"
        columns={[
          { title: "Tên phòng ban", dataIndex: "name", key: "name" },
          { title: "Phòng", dataIndex: "roomNumber", key: "roomNumber" },
          {
            title: "Quản lý",
            dataIndex: ["manager", "fullName"], // Truy cập nested object
            key: "manager.fullName",
            render: (text, record) => (<>
              {record?.managerId ? (
                <Space>
                  {
                    record.managerId?.avatarUrl ?
                      <img src={`${record.managerId?.avatarUrl}`} width={39} height={39} style={{ borderRadius: '100%' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" }}
                      /> :
                      <Avatar style={{ backgroundColor: ColorList[Math.floor(Math.random() * 4)], verticalAlign: "middle" }}>{record.managerId?.fullName.charAt(0)}</Avatar>
                  }
                  {record.managerId?.fullName}
                </Space>
              ) : <> ⚠️<b>Không có quản lý</b></>}
            </>
            )
          },
          {
            title: "Hành động",
            key: "actions",
            render: (_, dept) => (
              <Space>
                <Button type="link" icon={<EditFilled />} onClick={() => { setEditingDepartment(dept); form.setFieldsValue({ ...dept, managerId: dept?.managerId?._id }); setModalOpen(true); }} />
                <Popconfirm
                  title="Are you sure you want to delete this department?"
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okType="danger"
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  onConfirm={() => handleDelete(dept._id)}
                >
                  <Button type="link" danger icon={<DeleteFilled />} />
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
      {contextHolder}
      <Modal
        title={editingDepartment ? "Chỉnh sửa phòng ban" : "Tạo mới phòng ban"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingDepartment(null); form.resetFields(); }}
        onOk={handleAddEdit}
        confirmLoading={loading}
        okButtonProps={{ style: { backgroundColor: "#1890ff", borderColor: "#1890ff" } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên phòng ban" rules={[{ required: true, message: "Please enter department name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="roomNumber" label="Phòng" rules={[{ required: true, message: "Please enter room" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                name="managerId"
                label="Quản lý"
              >
                <Select placeholder="Select manager" allowClear
                  style={{ width: "100%", minWidth: 200 }} // Đảm bảo rộng tối thiểu
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }} // Tăng chiều cao dropdown
                  dropdownAlign={{ offset: [0, 10] }} // Dịch chuyển dropdown
                  popupMatchSelectWidth={false}
                  showSearch
                  filterOption={(input, option) => {
                    const manager = managerList.find((m) => m._id === option.value);
                    if (!manager) return false;
                    const searchText = input.toLowerCase();
                    return (
                      manager.fullName?.toLowerCase().includes(searchText) ||
                      manager.roler?.toLowerCase().includes(searchText)
                    );
                  }}
                >
                  {managerList?.map(manager => (
                    <Option key={manager._id} value={manager._id}>
                      <div className="flex items-center gap-2">
                        <img src={manager?.avatarUrl} alt={manager.fullName} height={30} width={30}
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" }}
                        />
                        <span>{manager?.fullName} - {manager?.roler}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;