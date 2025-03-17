const router = require('express').Router();
const {backupDatabase, cleanupOldBackups, restoreDatabase, downloadLatestBackup} = require('../controllers/backup.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.get('/backups', backupDatabase);

router.get('/cleanups', cleanupOldBackups);

router.post('/restores', restoreDatabase);

router.get("/download-latest", downloadLatestBackup);

module.exports = router;