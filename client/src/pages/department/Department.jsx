import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Space, Row, Col, Select, message } from "antd";
import { getDepartments } from "@/apis/departments/departments";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
const [messageApi, contextHolder] = message.useMessage();
  const showMessage = async (action, apiCall) => {
  const key = `department-${action.toLowerCase()}`;
  setLoading(true);
  messageApi.open({
    key,
    type: "loading",
    content: `${action} department...`,
  });

  try {
    await apiCall(); // Gọi API xử lý logic

    messageApi.open({
      key,
      type: "success",
      content: `Department ${action.toLowerCase()}d successfully!`,
      duration: 2,
    });

    await fetchDepartments(); // Cập nhật danh sách phòng ban sau khi thành công
    setModalOpen(false);
    setEditingDepartment(null);
    form.resetFields();
  } catch (error) {
    messageApi.open({
      key,
      type: "error",
      content: `Failed to ${action.toLowerCase()} department.`,
      duration: 2,
    });
    console.error(`Operation failed: ${error}`);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      console.log(res)
      if(res.success){
        setLoadingData(false);
        setDepartments(res.data);
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
      await showMessage("Update", async () => {
        // await axios.put(`/api/departments/${editingDepartment._id}`, values);
        console.log("Updating department:", values);
      });
    } else {
      await showMessage("Create", async () => {
        // await axios.post("/api/departments", values);
        console.log("Creating department:", values);
      });
    }
  } catch (error) {
    console.error("Validation failed:", error);
  }
};


  const handleDelete = async (id) => {
    try {
      // await axios.delete(`/api/departments/${id}`);

      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department");
    }
  };

  const filteredDepartments = departments?.filter(dept => 
    dept?.name?.toLowerCase().includes(searchText.toLowerCase()) || 
    dept?.roomNumber?.toLowerCase().includes(searchText.toLowerCase())
  );

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
          {title: "Manager", dataIndex: "managerId", key: "managerId"},
          {
            title: "Actions",
            key: "actions",
            render: (_, dept) => (
              <Space>
                <Button type="link" onClick={() => { setEditingDepartment(dept); form.setFieldsValue(dept); setModalOpen(true); }}>Edit</Button>
                <Button type="link" danger onClick={() => handleDelete(dept._id)}>Delete</Button>
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
                <Select
                  placeholder="Select manager"
                  allowClear
                >
                  <Option value="male">male</Option>
                  <Option value="female">female</Option>
                  <Option value="other">other</Option>
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