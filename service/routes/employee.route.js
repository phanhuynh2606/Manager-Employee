const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const employeeController = require('../controllers/employee.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../assets/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const shortId = req.params.employeeId.slice(-6); 
        const timestamp = Date.now().toString().slice(-6); 
        const filename = `avatar-${shortId}-${timestamp}${path.extname(file.originalname)}`; 
        cb(null, filename);
    }
});
const upload = multer({
    storage: storage,
});

router.use(authenticate);
router.get('/', employeeController.getEmployee);
router.get('/search', employeeController.filterEmployee);
router.get('/positions', employeeController.getEmployeePosition);
router.get('/:id', employeeController.getEmployeeDetail);

router.use(isAdmin);
router.put('/:id', employeeController.updateEmployee);
router.post('/create', employeeController.createEmployee);
router.delete('/:employeeId', employeeController.removeEmployee);
router.post('/reset-password', employeeController.resetPassword);
router.post('/change-avatar/:employeeId', upload.single('avatar'), employeeController.changeAvatar);
module.exports = router;
