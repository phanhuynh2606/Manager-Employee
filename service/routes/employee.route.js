const router = require('express').Router(); 
const employeeController = require('../controllers/employee.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');  
const { handleCloudinaryUpload } = require('../middlewares/upload.middleware');

router.use(authenticate);
router.get('/', employeeController.getEmployee);
router.get('/search', employeeController.filterEmployee);
router.get('/positions', employeeController.getEmployeePosition);
router.get('/:id', employeeController.getEmployeeDetail);
router.post('/change-avatar/:employeeId', handleCloudinaryUpload('avatar'), employeeController.changeAvatar);

router.use(isAdmin);
router.put('/:id', employeeController.updateEmployee);
router.post('/create', employeeController.createEmployee);
router.delete('/:employeeId', employeeController.removeEmployee);
router.post('/reset-password', employeeController.resetPassword); 
module.exports = router;
