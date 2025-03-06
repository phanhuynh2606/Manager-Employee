import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Space } from "antd";
import { getDepartments } from "@/apis/departments/departments";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false); 
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (error) {
      console.error("Failed to fetch departments");
    }
  };

  const handleAddEdit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDepartment) {
      //   await axios.put(`/api/departments/${editingDepartment._id}`, values);
         console.log("editingDepartment", editingDepartment);
      } else {
      //   await axios.post("/api/departments", values);
         console.log("values", values);
      }
      fetchDepartments();
      setModalOpen(false);
      setEditingDepartment(null);
      form.resetFields();
    } catch (error) {
      console.error("Operation failed");
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

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchText.toLowerCase()) || 
    dept.location.toLowerCase().includes(searchText.toLowerCase())
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
          <Form.Item name="roomNumber" label="Room" rules={[{ required: true, message: "Please enter room" }]}> 
            <Input /> 
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;