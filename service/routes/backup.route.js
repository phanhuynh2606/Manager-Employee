const router = require('express').Router();
const {backupDatabase, cleanupOldBackups, restoreDatabase, downloadLatestBackup, restoreLatestBackup, createBackupFromMongoDB} = require('../controllers/backup.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.get('/backups', backupDatabase);

router.get('/cleanups', cleanupOldBackups);

router.post('/restores', restoreDatabase);

router.get("/download-latest", downloadLatestBackup);

router.get('/restore-latest-backup', restoreLatestBackup);

router.get('/create-backup-from-mongodb', createBackupFromMongoDB);

module.exports = router;