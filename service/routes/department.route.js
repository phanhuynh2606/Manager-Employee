const router = require('express').Router();

const ctrls = require('../controllers/department.controller');

router.post('/', ctrls.createDepartment);
router.get('/', ctrls.getDepartments);
router.get('/:id', ctrls.getDepartmentById);
router.put('/:id', ctrls.updateDepartment);
router.delete('/:id', ctrls.deleteDepartment);
router.post("/departments/:id/employees",ctrls.asignEmployeeToDepartment);
router.get("/departments/:id/employees",ctrls.getEmployeesByDepartment);
router.delete("/departments/:id/employees/:employeeId",ctrls.removeEmployeeFromDepartment);

module.exports = router;
