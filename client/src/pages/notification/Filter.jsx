import { DatePicker, Radio, Select, Space } from 'antd'
import React from 'react'
const { RangePicker } = DatePicker;
const { Option } = Select;
export const Filter = (props) => {
  const {filter,setFilter,selectedType,setSelectedType,setDateRange} = props
   const handleTypeSelectChange = (value) => {
    setSelectedType(value);
  };
  const handleDateChange = (dates) => {
    setDateRange(dates || []);
  };
  return (
    <>
        <Space>
            <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
              <Radio.Button value="ALL">Tất cả</Radio.Button>
              <Radio.Button value="READ">Đã đọc</Radio.Button>
              <Radio.Button value="UNREAD">Chưa đọc</Radio.Button>
            </Radio.Group>
            <Select
              value={selectedType}
              onChange={handleTypeSelectChange}
              placeholder="Chọn loại thông báo"
              className="w-[180px]"
              >
              <Option value="ALL">Tất cả</Option>
              <Option value="SYSTEM">Hệ thống</Option>
              <Option value="DEPARTMENT">Phòng ban</Option>
              <Option value="PERSONAL">Cá nhân</Option>
            </Select>
            <RangePicker onChange={handleDateChange} />
          </Space>
    </>
  )
}
