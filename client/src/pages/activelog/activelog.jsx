import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Input,
  Chip,
} from "@material-tailwind/react";
import { 
  EllipsisVerticalIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import instance from "@/configs/axiosCustomize";

const TABLE_HEAD = [
  "Người dùng", 
  "Hành động", 
  "Loại thực thể", 
  "Địa chỉ IP", 
  "Vị trí ", 
  "Thời gian", 
];

export function ActiveLogTable() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [numberOfPage, setNumberOfPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  

  console.log(startDate)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await instance.post("/activelog",{
              "sort" :{
              "updatedAt":-1
            },
            "limitItem" : 10,
            "page":currentPage,
            "startDate":startDate,
            "endDate":endDate
        })
        setLogs(response.data);
        setNumberOfPage(response.totalItem)
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, [currentPage,startDate,endDate,numberOfPage]);
  
  const paginate = (page) => {
    setCurrentPage(page)
  }
  
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
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="w-full md:w-48">
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
              <div className="w-full md:w-48">
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
              <div className="flex items-end">
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
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
                      {log.userId?.employeeId.fullName || "N/A"}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.action}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.entityType}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.ipAddress}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.userId?.employeeId.position || "N/A"}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {new Date(log.createdAt).toLocaleString()}
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, numberOfPage)} of {numberOfPage} entries
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
            {Array.from({ length: Math.ceil(numberOfPage / itemsPerPage) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "filled" : "text"}
                color="blue-gray"
                size="sm"
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </Button>
            )).slice(Math.max(0, currentPage - 3), Math.min(currentPage + 2, Math.ceil(numberOfPage/ itemsPerPage)))}
            <Button
              variant="outlined"
              color="blue-gray"
              size="sm"
              disabled={currentPage == Math.ceil(numberOfPage/ itemsPerPage)}
              onClick={() => paginate(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ActiveLogTable;