const router = require('express').Router();
const salaries = require('../controllers/salary.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', salaries.getSalary);
router.get('/:id', salaries.getSalaryById);
router.use(isAdmin);
router.patch('/:id', salaries.updateSalary);
router.delete('/:id', salaries.deleteSalary);

module.exports = router;