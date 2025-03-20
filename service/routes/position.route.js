const router = require('express').Router();
const positions = require('../controllers/position.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', positions.getPositions);
router.post('/', positions.addPosition);
router.get('/:id', positions.getPosition);
router.patch('/:id', positions.updatePosition);
router.delete('/:id', positions.deletePosition);

module.exports = router;