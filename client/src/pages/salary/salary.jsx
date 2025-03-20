import { Button, Dropdown, Input, Modal, Select, Space, Table, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { getSalaries } from "@/apis/salaries/salaries";
import { columns } from "./column";
import SalaryModalEdit from "./modalEdit";
import { useSelector } from "react-redux";

function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingSalary, setEditingSalary] = useState(null);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);   
  const role = useSelector((state) => state?.auth?.user?.role);

  const fetchSalaries = async () => {
    try {
      const res = await getSalaries({ search, month, year });
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

  useEffect(() => {
    fetchSalaries();
  }, [search, month, year]);

  return (
    <div>
      <div className="flex justify-between items-center mt-5">
        <Space className="mt-4">
          <Space.Compact size="middle" style={{ width: "400px" }}>
            <Input addonBefore={<SearchOutlined />} placeholder="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Space.Compact>
          <Select
            placeholder="Month"
            value={month}
            onChange={setMonth}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={null}>Chọn Tháng</Select.Option>
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
            <Select.Option value={null}>Chọn Năm</Select.Option>
            {Array.from({ length: 5 }, (_, i) => {
              const currentYear = new Date().getFullYear();
              return (
                <Select.Option key={currentYear - i} value={currentYear - i}>
                  {currentYear - i}
                </Select.Option>
              );
            })}
          </Select>
        </Space>
      </div>
      <Table dataSource={salaries} columns={columns( setEditingSalary, setIsModalOpenEdit,role)} className="mt-10" scroll={{ x: "max-content" }} />
      <SalaryModalEdit editingSalary={editingSalary} isModalOpenEdit={isModalOpenEdit} setIsModalOpenEdit={setIsModalOpenEdit} fetchSalaries={fetchSalaries} />
    </div>

  );
}

export default Salary;
