const router = require('express').Router();
const salaries = require('../controllers/salary.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.use(isAdmin);
router.post('/', salaries.addSalary);
router.get('/', salaries.getSalary);
router.get('/:id', salaries.getSalaryById);
router.patch('/:id', salaries.updateSalary);
router.delete('/:id', salaries.deleteSalary);
router.patch('/:id/status', salaries.updateSalaryStatus);

module.exports = router;