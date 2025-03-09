const router = require('express').Router();
const employeeController = require('../controllers/employee.controller');

router.post('/create', employeeController.createEmployee); 
router.get('/', employeeController.getEmployee); 
router.get('/search', employeeController.filterEmployee); 
router.get('/positions', employeeController.getEmployeePosition); 
router.get('/:id', employeeController.getEmployeeDetail); 
router.put('/:id', employeeController.updateEmployee); 
router.delete('/:employeeId', employeeController.removeEmployee); 

module.exports = router;
