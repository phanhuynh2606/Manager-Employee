import { createPosition, deletePosition, getPosition, getPositions, updatePosition } from '@/apis/position/position';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react'

function Positions() {
    const [positions, setPositions] = useState([]);
    const [name, setName] = useState('');
    const [modal, setModal] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [editingPosition, setEditingPosition] = useState(null);
    const [form] = Form.useForm();
    useEffect(() => {
        fetchPositions();
    }, [name])
 
    const fetchPositions = async () => {
        try {
            const response = await getPositions({ name });
            if (response.success) {
                setPositions(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch positions:", error);
        }
    }
    const handleAdd = async () => {
        try {
            const dataForm = form.getFieldsValue();
            const response = await createPosition(dataForm);
            setModal(false);
            form.resetFields();
            fetchPositions();
            return response;
        } catch (error) {
            console.error("Failed to add position:", error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setModal(false);
    };

    useEffect(() => {
        if (editingPosition && modalEdit) {
            form.setFieldsValue({
                name: editingPosition?.name,
                description: editingPosition?.description
            });
        }
    }, [editingPosition, modalEdit, form]);
    const handleShowModalEdit = async (id) => {
        try {
            const position = await getPosition(id);
            if (position) {
                setEditingPosition(position.data);
                form.setFieldsValue(position);
                setModalEdit(true);
            }
        } catch (error) {
            console.error("Failed to show modal edit:", error);
        }
    }

    const handleCancelEdit = () => {
        form.resetFields();
        setModalEdit(false);
    };

    const handleEdit = async () => {
        try {
            const dataForm = form.getFieldsValue();
            const response = await updatePosition(editingPosition._id, dataForm);
            setModalEdit(false);
            form.resetFields();
            fetchPositions();
            return response;
        } catch (error) {
            console.error("Failed to edit position:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await deletePosition(id);
            fetchPositions();
            return res;
        } catch (error) {
            console.error("Failed to delete position:", error);
        }
    };

    const columns = [
        {
            title: "Tên vị trí",
            dataIndex: "name",
            key: "name",
            width: "25%",
            render: (text) => <p className='text-base font-medium'>{text}</p>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: "50%",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div style={{ display: "flex", gap: "12px" }}>
                    <Button
                        type="default"
                        variant='solid'
                        color='blue'
                        icon={<EditOutlined />}
                        onClick={() => handleShowModalEdit(record?._id)}
                    >
                        Sửa
                    </Button>

                    <Button
                        type="default"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => Modal.confirm({
                            title: 'Xác nhận',
                            content: `Bạn có chắc chắn muốn xóa vị trí ${record?.name}?`,
                            okText: 'Đồng ý',
                            cancelText: 'Hủy',
                            okType: 'danger',
                            onOk: () => handleDelete(record?._id),
                        })}
                    >
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center  mt-5">
                <Space className="mt-4">
                    <Space.Compact size="middle" style={{ width: "400px" }}>
                        <Input addonBefore={<SearchOutlined />} placeholder="Tìm kiếm" value={name} onChange={(e) => setName(e.target.value)} />
                    </Space.Compact>
                </Space>
                <Button type="default" variant='solid' color='default' onClick={() => setModal(true)}>
                    Thêm vị trí
                </Button>
            </div>
            <Table columns={columns} dataSource={positions} className="mt-10" scroll={{ x: "max-content" }} />
            <Modal
                title="Thêm vị trí nhân viên"
                open={modal}
                onOk={handleAdd}
                onCancel={handleCancel}
                okText="Thêm"
                cancelText="Hủy"
                okButtonProps={{
                    style: { backgroundColor: "black", borderColor: "black" },
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên vị trí">
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Sửa vị trí nhân viên"
                open={modalEdit}
                onOk={handleEdit}
                onCancel={handleCancelEdit}
                okText="Cập nhật"
                cancelText="Hủy"
                okButtonProps={{
                    style: { backgroundColor: "black", borderColor: "black" },
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên vị trí" rules={[{ required: true, message: "Vị trí nhân viên là bắt buộc" }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Positions