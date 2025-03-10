const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const {authenticate} = require('../middlewares/auth.middleware');
router.use(authenticate)
router.post('/', attendanceController.getInformation);
router.post('/checkin', attendanceController.checkin);
router.post('/checkout', attendanceController.checkout);
router.post('/getAttendanceHistory', attendanceController.getAttendanceHistory);
module.exports = router;
