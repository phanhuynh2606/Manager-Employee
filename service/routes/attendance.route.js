const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const {authenticate, isAdmin} = require('../middlewares/auth.middleware');
router.use(authenticate)
router.get('/', attendanceController.getInformation);
router.post('/checkin', attendanceController.checkin);
router.post('/checkout', attendanceController.checkout);
router.get('/getAttendanceToday', attendanceController.getAttendanceToday);
router.post('/getAttendanceHistory', attendanceController.getAttendanceHistory);
router.post('/getAttendanceHistoryByMonth', attendanceController.getAttendanceHistoryByMonth);
router.post('/requestLeave', attendanceController.requestLeave);
router.get('/getListLeave',isAdmin, attendanceController.getListLeave);
router.post('/toDoLeave',isAdmin, attendanceController.toDoLeave);
router.get('/getAllAttendance',isAdmin, attendanceController.getAllAttendance);
module.exports = router;
