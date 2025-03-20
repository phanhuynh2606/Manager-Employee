import { deleteSalary, getSalary } from '@/apis/salaries/salaries';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Card,
    Descriptions,
    Table,
    Spin,
    Typography,
    Space,
    Divider,
    Tag,
    Button,
    Row,
    Col,
    Statistic,
    notification,
    Modal
} from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    DeleteFilled,
    DollarOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

function ViewSalaryDetail() {
    const [salary, setSalary] = useState(null);
    const [loading, setLoading] = useState(false);
    const { salaryId } = useParams();
    const { Title, Text } = Typography;
    const role = useSelector((state) => state?.auth?.user?.role);

    useEffect(() => {
        fetchSalaryData();
    }, []);

    const fetchSalaryData = async () => {
        try {
            setLoading(true);
            const response = await getSalary(salaryId);
            setSalary(response.data);
        } catch (error) {
            console.error("Failed to fetch salary data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const handleDelete = async (id, salaryId) => {
        try {
            const res = await deleteSalary(id, salaryId);   
            fetchSalaryData();
            return res;
        } catch (error) {
            console.error("Failed to delete salary", error);
    
            notification.error({
                message: "Không thành công",
                description: error.message || "Có lỗi xảy ra, vui lòng thử lại!",
                placement: "topRight",
            });
        }
    };
    
    const daySalaryColumns = [
        {
            title: 'Ngày',
            dataIndex: 'day',
            key: 'day',
            render: (day) => `${day}/${salary.month}/${salary.year}`,
        },
        {
            title: 'Giờ làm việc',
            dataIndex: 'workingHours',
            key: 'workingHours',
        },
        {
            title: 'Giờ làm thêm',
            dataIndex: 'overTimeHours',
            key: 'overTimeHours',
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'periodStart',
            key: 'periodStart',
            render: (time) => {
                return time.split('T')[1].split('.')[0];
            },
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'periodEnd',
            key: 'periodEnd',
            render: (time) => {
                return time.split('T')[1].split('.')[0];
            },
        },
        {
            title: 'Lương ngày',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary) => formatVND(salary),
        },
        role === 'ADMIN' ? {
            title: 'Hành động',
            dataIndex: '_id',
            key: '_id',
            render: (id) => (
                <Space>
                    <div className='flex items-center gap-2 w-full cursor-pointer'  onClick={() => {
                        Modal.confirm({
                            title: 'Xác nhận',
                            content: `Bạn có chắc chắn muốn xóa ngày lương ${salary.day}/${salary.month}/${salary.year}?`,
                            okText: 'Đồng ý',
                            cancelText: 'Hủy',
                            okType: 'danger',
                            onOk: () => handleDelete(salaryId, id),
                        });
                    }}>
                        <DeleteFilled /> Xóa
                    </div>
                </Space>
            ),
        } : false
    ].filter(Boolean);

    const allowancesColumns = [
        {
            title: 'Tên khoản phụ cấp',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => formatVND(amount),
        }
    ];

    const bonusesColumns = [
        {
            title: 'Tên khoản thưởng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => formatVND(amount),
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        }
    ];

    const deductionsColumns = [
        {
            title: 'Tên khoản khấu trừ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => formatVND(amount),
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Đang tải thông tin lương..." />
            </div>
        );
    }

    return (
        <div className="p-8">
            <Space direction="vertical" size="large" className="w-full">
                <div>
                    <Button type="link" icon={<ArrowLeftOutlined />}>
                        <Link to="/dashboard/salaries">Quay lại danh sách lương</Link>
                    </Button>
                </div>

                {salary && (
                    <>
                        <Card>
                            <Space direction="vertical" size="middle" className="w-full">
                                <Row gutter={16} align="middle">
                                    <Col>
                                        <UserOutlined style={{ fontSize: '24px' }} />
                                    </Col>
                                    <Col>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {salary.employeeId.fullName}
                                        </Title>
                                        <Text type="secondary">{salary.employeeId.position}</Text>
                                    </Col>
                                </Row>

                                <Divider />

                                <Descriptions title="Thông tin lương" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                                    <Descriptions.Item label="Tháng/Năm">
                                        {`${salary.month}/${salary.year}`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Lương cơ bản">
                                        {formatVND(salary.baseSalary)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày bắt đầu">
                                        {moment(salary.periodStart).format('DD/MM/YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày kết thúc">
                                        {moment(salary.periodEnd).format('DD/MM/YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày thanh toán">
                                        {moment(salary.paymentDate).format('DD/MM/YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ghi chú" span={2}>
                                        {salary.note || 'Không có'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Row gutter={16}>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Tổng lương"
                                                value={salary.totalSalary}
                                                precision={2}
                                                valueStyle={{ color: '#3f8600' }}
                                                prefix={<DollarOutlined />}
                                                formatter={(value) => Math.ceil(value).toLocaleString() + ' ₫'}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                <Divider orientation="left">Chi tiết lương theo ngày</Divider>
                                <Table
                                    dataSource={salary.daySalary}
                                    columns={daySalaryColumns}
                                    rowKey="_id"
                                    pagination={false}
                                    bordered
                                    summary={() => (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={5}>
                                                <Text strong>Tổng</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1}>
                                                <Text strong>
                                                    {formatVND(salary.daySalary.reduce((acc, day) => acc + day.salary, 0))}
                                                </Text>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Divider orientation="left">Phụ cấp</Divider>
                                        <Table
                                            dataSource={salary.allowances}
                                            columns={allowancesColumns}
                                            rowKey="_id"
                                            pagination={false}
                                            bordered
                                            summary={() => (
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell index={0}>
                                                        <Text strong>Tổng phụ cấp</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}>
                                                        <Text strong>
                                                            {formatVND(salary.allowances.reduce((acc, item) => acc + item.amount, 0))}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Divider orientation="left">Thưởng</Divider>
                                        <Table
                                            dataSource={salary.bonuses}
                                            columns={bonusesColumns}
                                            rowKey="_id"
                                            pagination={false}
                                            bordered
                                            summary={() => (
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell index={0} colSpan={2}>
                                                        <Text strong>Tổng thưởng</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2}>
                                                        <Text strong>
                                                            {formatVND(salary.bonuses.reduce((acc, item) => acc + item.amount, 0))}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Divider orientation="left">Khấu trừ</Divider>
                                <Table
                                    dataSource={salary.deductions}
                                    columns={deductionsColumns}
                                    rowKey="_id"
                                    pagination={false}
                                    bordered
                                    summary={() => (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={2}>
                                                <Text strong>Tổng khấu trừ</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={2}>
                                                <Text strong>
                                                    {formatVND(salary.deductions.reduce((acc, item) => acc + item.amount, 0))}
                                                </Text>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}
                                />

                                <Card title="Chi tiết tính lương" bordered={false}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Tổng lương thoe ngày">
                                            {formatVND(salary.daySalary.reduce((acc, day) => acc + day.salary, 0))}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="+ Tổng phụ cấp">
                                            {formatVND(salary.allowances.reduce((acc, item) => acc + item.amount, 0))}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="+ Tổng thưởng">
                                            {formatVND(salary.bonuses.reduce((acc, item) => acc + item.amount, 0))}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="- Tổng khấu trừ">
                                            {formatVND(salary.deductions.reduce((acc, item) => acc + item.amount, 0))}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="= Tổng lương">
                                            <Text strong style={{ color: '#3f8600', fontSize: '16px' }}>
                                                {formatVND(salary.totalSalary)}
                                            </Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Space>
                        </Card>
                    </>
                )}
            </Space>
        </div>
    );
}

export default ViewSalaryDetail;