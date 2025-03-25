import React, { useState, useEffect, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Input,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  Spinner,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import instance from "@/configs/axiosCustomize";
import { width } from "@mui/system";

const TABLE_HEAD = [
  "Người dùng",
  "Hành động",
  "Loại thực thể",
  "Địa chỉ IP",
  "Thời gian",
  "Tùy chọn"
];

export function ActiveLogTable() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [numberOfPage, setNumberOfPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await instance.post("/activelog", {
          "sort": {
            "updatedAt": -1
          },
          "limitItem": 10,
          "page": currentPage,
          "startDate": startDate,
          "endDate": endDate,
          "entityType": entityTypeFilter
        });
        console.log("Response is",response)
        setLogs(response.data);
        setNumberOfPage(response.totalItem);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, startDate, endDate, entityTypeFilter]);
  const paginate = (page) => {
    setCurrentPage(page);
  };

  const handleOpenDetailDialog = (log) => {
    setSelectedLog(log);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedLog(null);
  };
  const getEntityTypeChip = (entityType) => {
    switch (entityType) {
      case "DEPARTMENT":
        return <Chip value={entityType} color="indigo" className="rounded-full text-center" />;
      case "EMPLOYEE":
        return <Chip value={entityType} color="blue" className="rounded-full text-center" />;
      case "employees":
        return <Chip value={entityType} color="blue" className="rounded-full text-center" />;
      default:
        return <Chip value={entityType} color="orange" className="rounded-full text-center" />;
    }
  };
  const renderDetailContent = () => {
    if (!selectedLog) return null;

    // Render different detail dialogs based on entity type
    if (selectedLog.entityType === "DEPARTMENT") {
      return renderDepartmentDetails();
    } else if (selectedLog.entityType === "EMPLOYEE" || selectedLog.entityType === "employees" || selectedLog.entityType === "ADMIN") {
      return renderEmployeeDetails();
    } else {
      return renderGenericDetails();
    }
  };

  const renderDepartmentDetails = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        <div className="p-6">
          <div className="flex items-center mb-5">
            <div className="bg-green-500 w-3 h-3 rounded-md mr-2"></div>
            <Typography variant="h6" color="blue-gray">
              Giá trị mới
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Tên phòng ban
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.name || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Mô tả
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.description || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Người quản lý
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.managerId ? selectedLog.newValues?.managerId?.fullName : ""}
              </Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Phòng
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.roomNumber ? selectedLog.newValues?.roomNumber : "N/A"}
              </Typography>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-5">
            <div className="bg-red-500 w-3 h-3 rounded-full mr-2"></div>
            <Typography variant="h6" color="blue-gray">
              Giá trị cũ
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Tên phòng ban
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                {selectedLog.oldValues?.name || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Mô tả
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                {selectedLog.oldValues?.description || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Người quản lý
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                {selectedLog.oldValues?.managerId ? selectedLog.newValues?.managerId?.fullName : "N/A"}
              </Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Phòng
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                {selectedLog.oldValues?.roomNumber ? selectedLog.oldValues?.roomNumber : "N/A"}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeDetails = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        <div className="p-6">
          <div className="flex items-center mb-5">
            <div className="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
            <Typography variant="h6" color="blue-gray">
              Giá trị mới
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Username
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.userId?.username || "N/A"}
              </Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Tên
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.fullName || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Giới tính
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.gender || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Email
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.userId?.email || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Số điện thoại
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.phoneNumber || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Địa chỉ
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.address || "N/A"}
              </Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Ngày sinh
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.dateOfBirth
                  ? new Date(selectedLog.newValues.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </div>

            {selectedLog.newValues?.userId?.role !== "ADMIN" && (
                <>
                <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Lương cơ bản
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.baseSalary
                  ? (selectedLog.newValues?.baseSalary).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  })
                  : "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Phòng ban
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.departmentId?.name || "N/A"}
              </Typography>
            </div>

            <div className="space-y-1">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Vị trí
              </Typography>
              <Typography variant="small" className="block text-blue-gray-600 bg-green-50 p-2 rounded-md">
                {selectedLog.newValues?.position?.name || "N/A"}
              </Typography>
            </div>
                </>
            )}
          </div>

          {selectedLog.newValues?.avatarUrl && (
            <div className="mt-6">
              <Typography variant="small" className="font-semibold text-blue-gray-700 mb-2">
                Ảnh đại diện
              </Typography>
              <div className="bg-green-50 p-2 rounded-md inline-block">
                <img
                  className="w-24 h-24 object-cover rounded-md border border-green-200"
                  src={selectedLog.newValues?.avatarUrl}
                  alt="Ảnh đại diện mới"
                />
              </div>
            </div>
          )}
        </div>

        {/* Old Values */}
        {selectedLog.oldValues ? (
          <div className="p-6">
            <div className="flex items-center mb-5">
              <div className="bg-red-500 w-3 h-3 rounded-full mr-2"></div>
              <Typography variant="h6" color="blue-gray">
                Giá trị cũ
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Username
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.userId?.username || "N/A"}
                </Typography>
              </div>
              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Tên người dùng
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.fullName || "N/A"}
                </Typography>
              </div>

              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Giới tính
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.gender || "N/A"}
                </Typography>
              </div>

              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Email
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.userId?.email || "N/A"}
                </Typography>
              </div>

              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Số điện thoại
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.phoneNumber || "N/A"}
                </Typography>
              </div>

              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Địa chỉ
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.address || "N/A"}
                </Typography>
              </div>
              <div className="space-y-1">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Ngày sinh
                </Typography>
                <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                  {selectedLog.oldValues?.dateOfBirth
                    ? new Date(selectedLog.oldValues.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </div>
              {selectedLog.oldValues?.userId?.role !== "ADMIN" && (
                <>
                  <div className="space-y-1">
                    <Typography variant="small" className="font-semibold text-blue-gray-700">
                      Lương cơ bản
                    </Typography>
                    <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                      {selectedLog.oldValues?.baseSalary
                        ? (selectedLog.oldValues?.baseSalary).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        })
                        : "N/A"}
                    </Typography>
                  </div>

                  <div className="space-y-1">
                    <Typography variant="small" className="font-semibold text-blue-gray-700">
                      Phòng ban
                    </Typography>
                    <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                      {selectedLog.oldValues?.departmentId?.name || "N/A"}
                    </Typography>
                  </div>

                  <div className="space-y-1">
                    <Typography variant="small" className="font-semibold text-blue-gray-700">
                      Vị trí
                    </Typography>
                    <Typography variant="small" className="block text-blue-gray-600 bg-red-50 p-2 rounded-md">
                      {selectedLog.oldValues?.position?.name || "N/A"}
                    </Typography>
                  </div>
                </>
              )}
            </div>

            {selectedLog.oldValues?.avatarUrl && (
              <div className="mt-6">
                <Typography variant="small" className="font-semibold text-blue-gray-700 mb-2">
                  Ảnh đại diện
                </Typography>
                <div className="bg-red-50 p-2 rounded-md inline-block">
                  <img
                    className="w-24 h-24 object-cover rounded-md border border-red-200"
                    src={selectedLog.oldValues?.avatarUrl}
                    alt="Ảnh đại diện cũ"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <Typography variant="h6" color="blue-gray">
              Không có giá trị cũ
            </Typography>
          </div>
        )}
      </div>
    );
  };

  const renderGenericDetails = () => {
    return (
      <div className="p-6">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          Chi tiết hoạt động không có dữ liệu cụ thể
        </Typography>
        <Typography variant="paragraph" color="blue-gray">
          Xem thông tin cơ bản trong bảng hoạt động.
        </Typography>
      </div>
    );
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Lịch sử hoạt động
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Xem lịch sử hoạt động
            </Typography>
          </div>
          <div className="flex w-full shrink-0 flex-col md:flex-row md:w-max gap-4">
            <div className="w-full md:w-30">
              <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
                Loại thực thể
              </Typography>
              <div className="relative">
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  className="w-full h-10 px-3 border border-blue-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="DEPARTMENT">Phòng ban</option>
                  <option value="EMPLOYEE">Nhân viên</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="w-full md:w-48 mr-3">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
                  From Date
                </Typography>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pr-10 focus:ring-blue-500"
                  />
                  <CalendarIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-300" />
                </div>
              </div>
              <div className="w-full md:w-48 mr-3">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
                  To Date
                </Typography>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pr-10 focus:ring-blue-500"
                  />
                  <CalendarIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-300" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner className="h-12 w-12" color="blue" />
            <Typography color="blue-gray" className="ml-2 font-medium">
              Đang tải dữ liệu...
            </Typography>
          </div>
        ) : (
          <>
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const classes = "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={index} className="hover:bg-blue-gray-50/50">
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {log.userId?.employeeId?.fullName || "N/A"}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {log.action}
                        </Typography>
                      </td>
                      <td className={classes}>
                        {getEntityTypeChip(log.entityType)}
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {log.ipAddress}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {new Date(log.createdAt).toLocaleString()}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <IconButton
                          variant="text"
                          color="blue-gray"
                          className="rounded-full"
                          onClick={() => handleOpenDetailDialog(log)}
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4">
              <Typography variant="small" color="blue-gray" className="font-normal">
                Showing {logs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, numberOfPage)} of {numberOfPage} entries
              </Typography>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  color="blue-gray"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.ceil(numberOfPage / itemsPerPage) || 1 }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "filled" : "text"}
                    color="blue-gray"
                    size="sm"
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Button>
                )).slice(Math.max(0, currentPage - 3), Math.min(currentPage + 2, Math.ceil(numberOfPage / itemsPerPage)))}
                <Button
                  variant="outlined"
                  color="blue-gray"
                  size="sm"
                  disabled={currentPage === Math.ceil(numberOfPage / itemsPerPage) || Math.ceil(numberOfPage / itemsPerPage) === 0}
                  onClick={() => paginate(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardBody>

      {/* Dynamic Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        handler={handleCloseDetailDialog}
        size="xl"
        className="bg-white overflow-hidden"
      >
        <DialogHeader className="flex justify-between items-center bg-blue-gray-50 px-6 py-4">
          <div>
            <Typography variant="h5" color="blue-gray">
              Chi tiết hoạt động
            </Typography>
            {selectedLog && (
              <Typography variant="small" color="blue-gray" className="font-normal mt-1">
                {selectedLog.action} - {selectedLog.entityType} - {new Date(selectedLog.createdAt).toLocaleString()}
              </Typography>
            )}
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={handleCloseDetailDialog}
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="p-0">
          {selectedLog ? (
            renderDetailContent()
          ) : (
            <div className="flex justify-center items-center h-64">
              <Spinner color="blue" className="h-12 w-12" />
            </div>
          )}
        </DialogBody>
      </Dialog>
    </Card>
  );
}

export default ActiveLogTable;