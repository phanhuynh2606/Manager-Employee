import React, {useEffect, useState} from 'react';
import {
    Box,
    Container,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Divider,
    IconButton,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Check as CheckIcon,
    EventNote as EventNoteIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    Assessment as AssessmentIcon,
    CalendarToday as CalendarTodayIcon,
    AccessTime as AccessTimeIcon,
    ExitToApp as ExitToAppIcon,
    People,
    CheckCircle,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import viLocale from 'date-fns/locale/vi';
import ReactApexChart from 'react-apexcharts';
import * as XLSX from 'xlsx';
import {
    checkin,
    checkout,
    getAttendanceHistory, getAttendanceHistoryByMonth,
    getAttendances,
    getAttendanceToday
} from "@/apis/attendances/attendances.js";
import {toast} from "react-toastify";
import moment from 'moment-timezone';

const initialEmployees = [
    { id: 1, name: "Nguyễn Văn A", position: "Nhân viên", department: "Phòng Kỹ thuật" },
    { id: 2, name: "Trần Thị B", position: "Trưởng phòng", department: "Phòng Kinh doanh" },
];

const now = new Date();
const offset = now.getTimezoneOffset() * 60000;
const localDate = new Date(now.getTime() - offset);

function AttendanceManagement() {
    const [tabValue, setTabValue] = useState(0);
    const [attendanceData, setAttendanceData] = useState();
    const [employeeData, setEmployeeData] = useState();
    const [employees, setEmployees] = useState(initialEmployees);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openCheckInDialog, setOpenCheckInDialog] = useState(false);
    const [openCheckOutDialog, setOpenCheckOutDialog] = useState(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [openOvertimeDialog, setOpenOvertimeDialog] = useState(false);
    const [leaveData, setLeaveData] = useState({ startDate: null, endDate: null, reason: "", type: "Nghỉ phép năm" });
    const [overtimeData, setOvertimeData] = useState({ date: null, hours: "", reason: "" });
    const [currentMonth, setCurrentMonth] = useState(localDate);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState("Tất cả");
    const departments = ["Tất cả", "Phòng Kỹ thuật", "Phòng Kinh doanh"];
    const [attendanceDataToday, setAttendanceDataToday] = useState();
    const [attendanceDataByMonth, setAttendanceDataByMonth] = useState([]);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const fetchDataEmployee = async () => {
        try {
            const response = await getAttendances();
            if (!response) return;
            setEmployeeData(response.data);
        }catch (error) {
            console.error(error, "Error");
            toast.error("Lấy dữ liệu thất bại!", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
        }
    }
    const getFirstAndLastDayOfMonth = (year, month) => {
        const firstDay = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
        const lastDay = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
        return { firstDay, lastDay };
    };
    const fetchAttendanceData = async () => {
        try {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            const dateNow = new Date(now.getTime() - offset);
            const Month = dateNow.getMonth() + 1;
            const Year = dateNow.getFullYear();
            const check = getFirstAndLastDayOfMonth(Year, Month);
            const startDate = check.firstDay;
            const endDate = check.lastDay;
            const response = await getAttendanceHistory(startDate, endDate);
            if (!response) return;
            setAttendanceData(response.data);
        }catch (error) {
            console.error(error, "Error");
            toast.error("Lấy dữ liệu thất bại!", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
        }
    }

    const fetchAttendanceToday = async () => {
            const response = await getAttendanceToday();
            if (!response) {
                console.error(error, "Error");
                return toast.error("Lấy dữ liệu thất bại!", {
                    autoClose: 2000,
                    closeOnClick: true,
                    pauseOnHover: false,
                })}
            setAttendanceDataToday(response.data);
    }

    const fetchAttendanceDataByMonth = async (year, month) => {
        const check = getFirstAndLastDayOfMonth(year, month);
        const startDate = check.firstDay;
        const endDate = check.lastDay;
        const response = await getAttendanceHistoryByMonth(startDate, endDate);
        if (!response) {
            console.error(error, "Error");
            return toast.error("Lấy dữ liệu thất bại!", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            })}
        setAttendanceDataByMonth(response.data);
    };

    useEffect(() => {
        fetchDataEmployee();
        fetchAttendanceData();
        fetchAttendanceToday();
    }, []);

    useEffect(() => {
        fetchAttendanceDataByMonth(currentMonth.getFullYear(),(currentMonth.getMonth() + 1));
        }, [currentMonth]);


    const handleCheckInOpen = () => setOpenCheckInDialog(true);
    const handleCheckInClose = () => setOpenCheckInDialog(false);
    const handleCheckOutOpen = () => setOpenCheckOutDialog(true);
    const handleCheckOutClose = () => setOpenCheckOutDialog(false);
    const handleLeaveOpen = () => setOpenLeaveDialog(true);
    const handleLeaveClose = () => setOpenLeaveDialog(false);
    const handleOvertimeOpen = () => setOpenOvertimeDialog(true);
    const handleOvertimeClose = () => setOpenOvertimeDialog(false);

    const handleCheckIn = async () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const dateNow = new Date(now.getTime() - offset);
        const response = await checkin(dateNow);
        console.log(response)
        if (!response.success){
            setOpenCheckInDialog(false);
            return toast.error(response.response.data.message, {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
        }
        await fetchAttendanceData();
        await fetchAttendanceToday();
        setOpenCheckInDialog(false);
        setNotification({ open: true, message: response.message + response.data.checkInTime, severity: "success" });
    };

    const handleCheckOut = async () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const dateNow = new Date(now.getTime() - offset);
        const response = await checkout(dateNow);
        console.log(response)
        if (!response.success){
            setOpenCheckOutDialog(false);
            return toast.error(response.response.data.message, {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
        }
        await fetchAttendanceData();
        await fetchAttendanceToday();
        setOpenCheckOutDialog(false);
        setNotification({ open: true, message: response.message + response.data.checkOutTime, severity: "success" });
    };

    const handleLeaveSubmit = () => {
        if (!leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
            setNotification({ open: true, message: "Vui lòng điền đầy đủ thông tin", severity: "error" });
            return;
        }
        const startDate = new Date(leaveData.startDate);
        const endDate = new Date(leaveData.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setEmployeeData({ ...employeeData, leaveTaken: employeeData.leaveTaken + diffDays });
        setLeaveRequests([...leaveRequests, { id: Date.now(), ...leaveData, status: "Chờ duyệt" }]);

        let currentDate = new Date(startDate);
        const newAttendanceData = [...attendanceData];
        while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const existingIndex = attendanceData.findIndex(item => item.date === dateStr);
            if (existingIndex !== -1) {
                newAttendanceData[existingIndex] = { ...newAttendanceData[existingIndex], checkIn: "", checkOut: "", status: "Nghỉ phép", note: leaveData.reason };
            } else {
                newAttendanceData.push({ date: dateStr, checkIn: "", checkOut: "", status: "Nghỉ phép", note: leaveData.reason });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setAttendanceData(newAttendanceData);
        setOpenLeaveDialog(false);
        setLeaveData({ startDate: null, endDate: null, reason: "", type: "Nghỉ phép năm" });
        setNotification({ open: true, message: `Đã đăng ký nghỉ phép thành công: ${diffDays} ngày`, severity: "success" });
    };

    const handleOvertimeSubmit = () => {
        if (!overtimeData.date || !overtimeData.hours || !overtimeData.reason) {
            setNotification({ open: true, message: "Vui lòng điền đầy đủ thông tin", severity: "error" });
            return;
        }
        const dateStr = format(new Date(overtimeData.date), 'yyyy-MM-dd');
        const hours = parseInt(overtimeData.hours, 10);
        setEmployeeData({ ...employeeData, overtime: employeeData.overtime + hours });
        const existingIndex = attendanceData.findIndex(item => item.date === dateStr);
        const newAttendanceData = [...attendanceData];
        if (existingIndex !== -1) {
            newAttendanceData[existingIndex] = { ...newAttendanceData[existingIndex], status: "Làm thêm giờ", note: overtimeData.reason };
        } else {
            newAttendanceData.push({ date: dateStr, checkIn: "08:00", checkOut: `${17 + hours}:00`, status: "Làm thêm giờ", note: overtimeData.reason });
        }
        setAttendanceData(newAttendanceData);
        setOpenOvertimeDialog(false);
        setOvertimeData({ date: null, hours: "", reason: "" });
        setNotification({ open: true, message: `Đã đăng ký làm thêm ${hours} giờ thành công`, severity: "success" });
    };

    const handleNotificationClose = () => setNotification({ ...notification, open: false });

    // const getCurrentMonthAttendance = () => {
    //     const year = currentMonth.getFullYear();
    //     const month = currentMonth.getMonth();
    //     return attendanceData.filter(item => {
    //         const itemDate = new Date(item.date);
    //         return itemDate.getFullYear() === year && itemDate.getMonth() === month;
    //     });
    // };

    // const calculateMonthlyStats = () => {
    //     const filteredData = getCurrentMonthAttendance();
    //     const workDays = filteredData.filter(item => ["Đúng giờ", "Đi muộn", "Làm thêm giờ"].includes(item.status)).length;
    //     const lateDays = filteredData.filter(item => item.status === "Đi muộn").length;
    //     const leaveDays = filteredData.filter(item => item.status === "Nghỉ phép").length;
    //     const overtimeDays = filteredData.filter(item => item.status === "Làm thêm giờ").length;
    //     return { workDays, lateDays, leaveDays, overtimeDays };
    // };

    // const stats = calculateMonthlyStats();

    // const todayAttendance = attendanceData.filter(row => row.date === format(new Date(), 'yyyy-MM-dd'));

    // const filteredAttendance = getCurrentMonthAttendance().filter(
    //     row => departmentFilter === "Tất cả" || employeeData.department === departmentFilter
    // );

    const exportReport = () => {
        const ws = XLSX.utils.json_to_sheet(getCurrentMonthAttendance());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `BaoCaoChamCong_Thang${currentMonth.getMonth() + 1}_${currentMonth.getFullYear()}.xlsx`);
        setNotification({ open: true, message: "Báo cáo đã được xuất thành công", severity: "success" });
    };

    const Charts = () => {
        const barChartOptions = {
            chart: { type: 'bar' },
            series: [{ name: 'Ngày', data: [stats.workDays, stats.lateDays, stats.leaveDays, stats.overtimeDays] }],
            xaxis: { categories: ['Làm việc', 'Đi muộn', 'Nghỉ phép', 'Làm thêm'] },
        };
        const pieChartOptions = {
            chart: { type: 'pie' },
            series: [stats.workDays, stats.lateDays, stats.leaveDays],
            labels: ['Đúng giờ', 'Đi muộn', 'Nghỉ phép'],
        };

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Thống kê ngày làm việc</Typography>
                            <ReactApexChart options={barChartOptions} series={barChartOptions.series} type="bar" height={350} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Tỷ lệ trạng thái</Typography>
                            <ReactApexChart options={pieChartOptions} series={pieChartOptions.series} type="pie" height={350} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const EmployeeManagement = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quản lý nhân viên</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tên</TableCell>
                            <TableCell>Chức vụ</TableCell>
                            <TableCell>Phòng ban</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((emp) => (
                            <TableRow key={emp.id}>
                                <TableCell>{emp.id}</TableCell>
                                <TableCell>{emp.name}</TableCell>
                                <TableCell>{emp.position}</TableCell>
                                <TableCell>{emp.department}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const LeaveApproval = () => {
        const handleApprove = (id) => {
            setLeaveRequests(leaveRequests.map(req => req.id === id ? { ...req, status: "Đã duyệt" } : req));
            setNotification({ open: true, message: "Đã duyệt đơn nghỉ", severity: "success" });
        };
        const handleReject = (id) => {
            setLeaveRequests(leaveRequests.map(req => req.id === id ? { ...req, status: "Từ chối" } : req));
            setNotification({ open: true, message: "Đã từ chối đơn nghỉ", severity: "error" });
        };

        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Danh sách đơn nghỉ chờ duyệt</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Ngày bắt đầu</TableCell>
                                <TableCell>Ngày kết thúc</TableCell>
                                <TableCell>Lý do</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaveRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.id}</TableCell>
                                    <TableCell>{format(new Date(req.startDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{format(new Date(req.endDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{req.reason}</TableCell>
                                    <TableCell>{req.status}</TableCell>
                                    <TableCell>
                                        {req.status === "Chờ duyệt" && (
                                            <>
                                                <Button onClick={() => handleApprove(req.id)} color="primary">Duyệt</Button>
                                                <Button onClick={() => handleReject(req.id)} color="secondary">Từ chối</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Hệ thống Quản lý Chấm công
                        </Typography>
                        <IconButton color="inherit">
                            <ExitToAppIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Paper sx={{ width: '100%', mb: 4 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
                            <Tab icon={<AssignmentTurnedInIcon />} label="Chấm công" />
                            <Tab icon={<EventNoteIcon />} label="Thông tin chấm công" />
                            <Tab icon={<AssessmentIcon />} label="Báo cáo" />
                            <Tab icon={<People />} label="Quản lý nhân viên" />
                            <Tab icon={<CheckCircle />} label="Phê duyệt đơn nghỉ" />
                        </Tabs>

                        {tabValue === 0 && (
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Thông tin nhân viên</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <Typography variant="body1"><strong>Họ và tên:</strong> {employeeData?.fullName}</Typography>
                                                <Typography variant="body1"><strong>Chức vụ:</strong> {employeeData?.position}</Typography>
                                                <Typography variant="body1"><strong>Phòng ban:</strong> {employeeData?.department}</Typography>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Tổng quan tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <Typography variant="body1"><strong>Số ngày công:</strong> {(attendanceData?.totalWorkingHours)/8}/{employeeData?.workingDay}</Typography>
                                                <Typography variant="body1"><strong>Số ngày nghỉ phép:</strong> {attendanceData?.leaveDays}/{employeeData?.leaveBalance}</Typography>
                                                <Typography variant="body1"><strong>Số ngày đi muộn:</strong> {attendanceData?.lateDays}</Typography>
                                                <Typography variant="body1"><strong>Số giờ làm thêm:</strong> {attendanceData?.totalOvertimeHours}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Chấm công ngày {format(selectedDate, 'dd/MM/yyyy')}</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                                    <Button variant="contained" color="primary" startIcon={<AccessTimeIcon />} onClick={handleCheckInOpen}>
                                                        Chấm công vào
                                                    </Button>
                                                    <Button variant="contained" color="secondary" startIcon={<ExitToAppIcon />} onClick={handleCheckOutOpen}>
                                                        Chấm công ra
                                                    </Button>
                                                </Box>
                                                <Divider sx={{ mb: 2 }} />
                                                <Typography variant="h6" gutterBottom>Đăng ký nghỉ phép / Làm thêm giờ</Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                                    <Button variant="outlined" color="primary" startIcon={<CalendarTodayIcon />} onClick={handleLeaveOpen}>
                                                        Đăng ký nghỉ phép
                                                    </Button>
                                                    <Button variant="outlined" color="secondary" startIcon={<AddIcon />} onClick={handleOvertimeOpen}>
                                                        Đăng ký làm thêm giờ
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Chấm công hôm nay ({format(new Date(), 'dd/MM/yyyy')})</Typography>
                                                <TableContainer component={Paper}>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Tên nhân viên</TableCell>
                                                                <TableCell>Giờ vào</TableCell>
                                                                <TableCell>Giờ ra</TableCell>
                                                                <TableCell>Trạng thái</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {attendanceDataToday ? (
                                                                    <TableRow>
                                                                        <TableCell>{attendanceDataToday.name}</TableCell>
                                                                        <TableCell>{attendanceDataToday.checkIn || "--:--"}</TableCell>
                                                                        <TableCell>{attendanceDataToday.checkOut || "--:--"}</TableCell>
                                                                        <TableCell>{attendanceDataToday.status}</TableCell>
                                                                    </TableRow>
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={4}>Không có dữ liệu hôm nay</TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Lịch sử chấm công tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <DatePicker
                                        views={['year', 'month']}
                                        label="Chọn tháng"
                                        minDate={new Date('2020-01-01')}
                                        maxDate={new Date('2030-12-31')}
                                        value={currentMonth}
                                        onChange={(newValue) => setCurrentMonth(newValue)}
                                        renderInput={(params) => <TextField {...params} helperText={null} />}
                                    />
                                </Box>
                                {/*<Box sx={{ mb: 2 }}>*/}
                                {/*    <FormControl fullWidth>*/}
                                {/*        <InputLabel>Bộ phận</InputLabel>*/}
                                {/*        <Select*/}
                                {/*            value={departmentFilter}*/}
                                {/*            onChange={(e) => setDepartmentFilter(e.target.value)}*/}
                                {/*            label="Bộ phận"*/}
                                {/*        >*/}
                                {/*            {departments.map((dept) => (*/}
                                {/*                <MenuItem key={dept} value={dept}>{dept}</MenuItem>*/}
                                {/*            ))}*/}
                                {/*        </Select>*/}
                                {/*    </FormControl>*/}
                                {/*</Box>*/}
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Ngày</TableCell>
                                                <TableCell>Giờ vào</TableCell>
                                                <TableCell>Giờ ra</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell>Ghi chú</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attendanceDataByMonth && attendanceDataByMonth.length > 0 ? (
                                                attendanceDataByMonth.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell>{item.checkIn || "--:--"}</TableCell>
                                                        <TableCell>{item.checkOut || "--:--"}</TableCell>
                                                        <TableCell>{item.status}</TableCell>
                                                        <TableCell>{item.note}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5}>Không có dữ liệu hôm nay</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {tabValue === 2 && (
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>Báo cáo chấm công tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}</Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <DatePicker
                                                views={['year', 'month']}
                                                label="Chọn tháng"
                                                minDate={new Date('2020-01-01')}
                                                maxDate={new Date('2030-12-31')}
                                                value={currentMonth}
                                                onChange={(newValue) => setCurrentMonth(newValue)}
                                                renderInput={(params) => <TextField {...params} helperText={null} />}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Tổng quan</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <TableContainer>
                                                    <Table>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell><strong>Tổng số ngày làm việc trong tháng</strong></TableCell>
                                                                <TableCell align="right">{employeeData.workingDays}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell><strong>Số ngày đã làm việc</strong></TableCell>
                                                                <TableCell align="right">{stats.workDays}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell><strong>Số ngày nghỉ phép</strong></TableCell>
                                                                <TableCell align="right">{stats.leaveDays}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell><strong>Số ngày đi muộn</strong></TableCell>
                                                                <TableCell align="right">{stats.lateDays}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell><strong>Số ngày làm thêm giờ</strong></TableCell>
                                                                <TableCell align="right">{stats.overtimeDays}</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Phép năm</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <TableContainer>
                                                    <Table>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell><strong>Tổng số ngày phép năm</strong></TableCell>
                                                                <TableCell align="right">{employeeData.leaveBalance}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell><strong>Đã sử dụng</strong></TableCell>
                                                                <TableCell align="right">{employeeData.leaveTaken}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell><strong>Còn lại</strong></TableCell>
                                                                <TableCell align="right">{employeeData.leaveBalance - employeeData.leaveTaken}</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                        <Card sx={{ mt: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>Làm thêm giờ</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <TableContainer>
                                                    <Table>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell><strong>Tổng số giờ làm thêm</strong></TableCell>
                                                                <TableCell align="right">{employeeData.overtime}</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Charts />
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                            <Button variant="contained" color="primary" startIcon={<AssessmentIcon />} onClick={exportReport}>
                                                Xuất báo cáo
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {tabValue === 3 && <EmployeeManagement />}
                        {tabValue === 4 && <LeaveApproval />}
                    </Paper>
                </Container>
            </Box>

            <Dialog open={openCheckInDialog} onClose={handleCheckInClose}>
                <DialogTitle>Xác nhận chấm công vào</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn đang chấm công vào ngày {format(new Date(), 'dd/MM/yyyy')} vào lúc {format(new Date(), 'HH:mm')}. Xác nhận chấm công?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCheckInClose} color="inherit">Hủy bỏ</Button>
                    <Button onClick={handleCheckIn} color="primary" startIcon={<CheckIcon />}>Xác nhận</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openCheckOutDialog} onClose={handleCheckOutClose}>
                <DialogTitle>Xác nhận chấm công ra</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn đang chấm công ra ngày {format(new Date(), 'dd/MM/yyyy')} vào lúc {format(new Date(), 'HH:mm')}. Xác nhận chấm công?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCheckOutClose} color="inherit">Hủy bỏ</Button>
                    <Button onClick={handleCheckOut} color="primary" startIcon={<CheckIcon />}>Xác nhận</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openLeaveDialog} onClose={handleLeaveClose}>
                <DialogTitle>Đăng ký nghỉ phép</DialogTitle>
                <DialogContent>
                    <DatePicker
                        label="Ngày bắt đầu"
                        value={leaveData.startDate}
                        onChange={(newValue) => setLeaveData({ ...leaveData, startDate: newValue })}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                    <DatePicker
                        label="Ngày kết thúc"
                        value={leaveData.endDate}
                        onChange={(newValue) => setLeaveData({ ...leaveData, endDate: newValue })}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                    <TextField
                        label="Lý do"
                        value={leaveData.reason}
                        onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLeaveClose}>Hủy</Button>
                    <Button onClick={handleLeaveSubmit} color="primary">Xác nhận</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openOvertimeDialog} onClose={handleOvertimeClose}>
                <DialogTitle>Đăng ký làm thêm giờ</DialogTitle>
                <DialogContent>
                    <DatePicker
                        label="Ngày làm thêm"
                        value={overtimeData.date}
                        onChange={(newValue) => setOvertimeData({ ...overtimeData, date: newValue })}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                    <TextField
                        label="Số giờ"
                        value={overtimeData.hours}
                        onChange={(e) => setOvertimeData({ ...overtimeData, hours: e.target.value })}
                        fullWidth
                        margin="normal"
                        type="number"
                    />
                    <TextField
                        label="Lý do"
                        value={overtimeData.reason}
                        onChange={(e) => setOvertimeData({ ...overtimeData, reason: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOvertimeClose}>Hủy</Button>
                    <Button onClick={handleOvertimeSubmit} color="primary">Xác nhận</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleNotificationClose}>
                <Alert onClose={handleNotificationClose} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
}

export default AttendanceManagement;
