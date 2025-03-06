const router = require('express').Router();
const employeeController = require('../controllers/employee.controller');

router.post('/create', employeeController.createEmployee); 
router.get('/', employeeController.getEmployee); 
router.get('/:id', employeeController.getEmployeeDetail); 
router.put('/:id', employeeController.updateEmployee); 

module.exports = router;
