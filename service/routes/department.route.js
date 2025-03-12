const router = require('express').Router();
const ctrls = require('../controllers/department.controller');
const {authenticate,isAdmin} = require('../middlewares/auth.middleware');

router.use(authenticate); 
router.get('/', ctrls.getDepartments);
router.get("/assign-manager",isAdmin,ctrls.getEmployeeByManager);
router.get('/:id', ctrls.getDepartmentById);

router.use(isAdmin);
router.post('/', ctrls.createDepartment);
router.put('/:id', ctrls.updateDepartment);
router.delete('/:id', ctrls.deleteDepartment);
router.post("/departments/:id/employees",ctrls.asignEmployeeToDepartment);
router.get("/departments/:id/employees",ctrls.getEmployeesByDepartment);
router.delete("/departments/:id/employees/:employeeId",ctrls.removeEmployeeFromDepartment);

module.exports = router;
