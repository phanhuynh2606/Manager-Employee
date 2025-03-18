const router = require('express').Router(); 
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');  
const { handleCloudinaryUpload } = require('../middlewares/upload.middleware');
const ctrl = require('../controllers/administration.controller');

router.use(authenticate);
router.use(isAdmin);
router.post('/create', ctrl.createAdmin);
router.get('/', ctrl.getAdmins);
router.get('/:id', ctrl.getAdmin);
router.put('/:id', ctrl.updateAdmin);
router.delete('/:id', ctrl.removeAdmin);
router.put('/lock-account/:id', ctrl.lockAccount);
router.put('/unlock-account/:id', ctrl.unlockAccount);

module.exports = router;