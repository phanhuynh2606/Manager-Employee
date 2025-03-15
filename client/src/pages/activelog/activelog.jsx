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
} from "@heroicons/react/24/outline";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const TABLE_HEAD = [
  "ID", 
  "User", 
  "Action", 
  "Module", 
  "IP Address", 
  "Device", 
  "Status", 
  "Timestamp", 
  ""
];

export function ActiveLogTable() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Replace with your actual API endpoint
        // const response = await axios.get("https://api.example.com/logs");
        // setLogs(response.data);
        
        // For demo purposes, we'll use mock data
        const mockData = generateMockData(50);
        setLogs(mockData);
        setFilteredLogs(mockData);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  // Generate mock data for demonstration
  const generateMockData = (count) => {
    const actions = ["Login", "Logout", "Create", "Update", "Delete", "Download"];
    const modules = ["User Management", "Products", "Orders", "Dashboard", "Reports"];
    const devices = ["Desktop", "Mobile", "Tablet"];
    const statuses = ["success", "pending", "failed"];
    const users = ["admin@example.com", "user1@example.com", "user2@example.com"];
    
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      user: users[Math.floor(Math.random() * users.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      module: modules[Math.floor(Math.random() * modules.length)],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device: devices[Math.floor(Math.random() * devices.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  // Handle search
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
      setFilteredLogs(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, logs]);

  // Get current logs
  const indexOfLastLog = currentPage * itemsPerPage;
  const indexOfFirstLog = indexOfLastLog - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Export to Excel
  const exportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    
    const exportData = filteredLogs.map(log => ({
      ID: log.id,
      User: log.user,
      Action: log.action,
      Module: log.module,
      "IP Address": log.ipAddress,
      Device: log.device,
      Status: log.status,
      Timestamp: new Date(log.timestamp).toLocaleString(),
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { "Activity Logs": ws }, SheetNames: ["Activity Logs"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "activity_logs" + fileExtension);
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Activity Logs
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              View and manage all system activity logs
            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="flex items-center gap-2" onClick={exportToExcel}>
              <ArrowDownTrayIcon className="h-4 w-4" /> Export
            </Button>
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
            {currentLogs.map((log, index) => {
              const isLast = index === currentLogs.length - 1;
              const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={log.id} className="hover:bg-blue-gray-50/50">
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.id}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.user}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.action}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.module}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.ipAddress}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {log.device}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <div className="w-max">
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={log.status}
                        color={
                          log.status === "success"
                            ? "green"
                            : log.status === "pending"
                            ? "amber"
                            : "red"
                        }
                      />
                    </div>
                  </td>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <IconButton variant="text" color="blue-gray">
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
            Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
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
            {Array.from({ length: Math.ceil(filteredLogs.length / itemsPerPage) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "filled" : "text"}
                color="blue-gray"
                size="sm"
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </Button>
            )).slice(Math.max(0, currentPage - 3), Math.min(currentPage + 2, Math.ceil(filteredLogs.length / itemsPerPage)))}
            <Button
              variant="outlined"
              color="blue-gray"
              size="sm"
              disabled={currentPage === Math.ceil(filteredLogs.length / itemsPerPage)}
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