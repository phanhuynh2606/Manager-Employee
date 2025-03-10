import { Button, Dropdown, Input, Modal, Select, Space, Table, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { getSalaries } from "@/apis/salaries/salaries";
import { columns } from "./column";
import SalaryModal from "./modal";
import SalaryModalEdit from "./modalEdit";

function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [status, setStatus] = useState(null);

  const fetchSalaries = async () => {
    try {
      const res = await getSalaries({ search, month, year, status });
      console.log(res)
      if (res.success) {
        setLoadingData(false);
        setSalaries(res.data);
      } else {
        setLoadingData(true);
      }
    } catch (error) {
      console.error("Failed to fetch salaries");
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchSalaries();
  }, [search, month, year, status]);

  return (
    <div>
      <div className="flex justify-between items-center mt-5">
        <Space className="mt-4">
          <Space.Compact size="middle" style={{ width: "400px" }}>
            <Input addonBefore={<SearchOutlined />} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Space.Compact>
          <Select
            placeholder="Month"
            value={month}
            onChange={setMonth}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={null}>Select Month</Select.Option>
            {Array.from({ length: 12 }, (_, i) => (
              <Select.Option key={i + 1} value={i + 1}>
                {i + 1}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Year"
            value={year}
            onChange={setYear}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={null}>Select Year</Select.Option>
            {Array.from({ length: 5 }, (_, i) => {
              const currentYear = new Date().getFullYear();
              return (
                <Select.Option key={currentYear - i} value={currentYear - i}>
                  {currentYear - i}
                </Select.Option>
              );
            })}
          </Select>
          <Select
            placeholder="Status"
            value={status}
            onChange={setStatus}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value={null}>Select Status</Select.Option>
            <Select.Option value="DRAFT">DRAFT</Select.Option>
            <Select.Option value="APPROVED">APPROVED</Select.Option>
            <Select.Option value="PAID">PAID</Select.Option>
          </Select>
        </Space>
        <Button type="primary" variant="solid" color="default" onClick={showModal}>
          <PlusOutlined /> Add new salary
        </Button>
      </div>
      <Table dataSource={salaries} columns={columns(fetchSalaries, setEditingSalary, setIsModalOpenEdit)} className="mt-10" scroll={{ x: "max-content" }} />
      <SalaryModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} fetchSalaries={fetchSalaries} />
      <SalaryModalEdit editingSalary={editingSalary} isModalOpenEdit={isModalOpenEdit} setIsModalOpenEdit={setIsModalOpenEdit} fetchSalaries={fetchSalaries} />
    </div>

  );
}

export default Salary;
