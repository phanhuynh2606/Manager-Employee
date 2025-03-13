import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Space, Row, Col, Select, message, Avatar, Popconfirm } from "antd";
import { assignManager, createDepartment, deleteDepartment, getDepartments, updateDepartment } from "@/apis/departments/departments";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
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
const location = useLocation();
  console.log(location)

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const [res, resManager] = await Promise.all([getDepartments(), assignManager()]);
      if(res.success){
        setLoadingData(false);
        setDepartments(res.data);
        setManagerList(resManager.data);
      }else{
        setLoadingData(true);
      }
    } catch (error) {
      console.error("Failed to fetch departments");
    }
  };

 const handleAddEdit = async () => {
  try {
    const values = await form.validateFields();

    if (editingDepartment) {
      const res = await updateDepartment(editingDepartment?._id, values);
      if(res.success){
        messageApi.success("Update department success");
        setModalOpen(false);
        form.resetFields();
        fetchDepartments();
      }else{
        messageApi.error("Update department failed");
      }
    } else {
      const res = await createDepartment(values);
      if(res.success){
        messageApi.success("Create department success");
        setModalOpen(false);
        form.resetFields();
        fetchDepartments();
      }else{
        messageApi.error("Create department failed");
      }
    }
  } catch (error) {
    console.error("Validation failed:", error);
  }
};


  const handleDelete = async (id) => {
    try {
      const res = await deleteDepartment(id);
      if(res.success){
        messageApi.success("Delete department success");
      }else{
        messageApi.error("Delete department failed");
      }
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department");
    }
  };

  const filteredDepartments = departments?.filter(dept => 
    dept?.name?.toLowerCase().includes(searchText.toLowerCase()) || 
    dept?.roomNumber?.toLowerCase().includes(searchText.toLowerCase())
  );
  const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
  return (
    <div className="p-6">
      <Space style={{ marginBottom: 16 }}>
        <Input 
          placeholder="Search Departments" 
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" className="text-[#000]" onClick={() => setModalOpen(true)}>Add Department</Button>
      </Space>
      <Table 
        dataSource={filteredDepartments} 
        loading={loadingData  }
        rowKey="_id" 
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Room", dataIndex: "roomNumber", key: "roomNumber" },
          { title: "Manager",
            dataIndex: ["manager", "fullName"], // Truy cập nested object
            key: "manager.fullName",
            render: (text, record) => (<>
              {record?.managerId ?(
                <Space>
                {
                  record.managerId?.avatarUrl ? 
                  <Avatar src={record.managerId?.avatarUrl} /> : 
                  <Avatar style={{ backgroundColor: ColorList[Math.floor(Math.random() * 4)], verticalAlign: "middle" }}>{record.managerId?.fullName.charAt(0)}</Avatar>
                }
                  {record.managerId?.fullName}
              </Space>
              ): <> ⚠️<b>Không có quản lý</b></>}
              </>
            )},
          {
            title: "Actions",
            key: "actions",
            render: (_, dept) => (
              <Space>
                <Button type="link" onClick={() => { setEditingDepartment(dept); form.setFieldsValue({...dept,managerId:dept?.managerId?._id}); setModalOpen(true); }}>Edit</Button>
                <Popconfirm
                  title="Are you sure you want to delete this department?"
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okType="danger"
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  onConfirm={() => handleDelete(dept._id)}
                >
                  <Button type="link" danger>Delete</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
      {contextHolder}
      <Modal 
        title={editingDepartment ? "Edit Department" : "Add Department"} 
        open={modalOpen} 
        onCancel={() => { setModalOpen(false); setEditingDepartment(null); form.resetFields(); }}
        onOk={handleAddEdit}
        confirmLoading={loading}
        okButtonProps={{ style: { backgroundColor: "#1890ff", borderColor: "#1890ff" } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Department Name" rules={[{ required: true, message: "Please enter department name" }]}> 
            <Input /> 
          </Form.Item>
          <Form.Item name="description" label="Description"> 
            <Input.TextArea /> 
          </Form.Item>
          <Row gutter={16}>
            <Col span={10}>
                <Form.Item name="roomNumber" label="Room" rules={[{ required: true, message: "Please enter room" }]}> 
                  <Input /> 
                </Form.Item>      
            </Col>
            <Col span={14}>
              <Form.Item
                name="managerId"
                label="Manager"
              >
              <Select placeholder="Select manager" allowClear 
               style={{ width: "100%", minWidth: 200 }} // Đảm bảo rộng tối thiểu
               dropdownStyle={{ maxHeight: 400, overflow: "auto" }} // Tăng chiều cao dropdown
               dropdownAlign={{ offset: [0, 10] }} // Dịch chuyển dropdown
               popupMatchSelectWidth={false}
              >
                {managerList.map(manager => (
                <Option key={manager._id} value={manager._id}>
                  <div className="flex items-center gap-2">
                    <img src={`https://cdn-icons-png.flaticon.com/512/149/149071.png`} alt={manager.fullName} height={30} width={30} />
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