const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const { Types } = mongoose;
const Backup = require("../models/backup");

const BACKUP_DIR = path.join(__dirname, "../backups");
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

try {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
} catch (err) {
    console.log("Lỗi khi tạo thư mục backups:", err);
}

const backupDatabase = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.collections();
        const backupData = {};

        for (const collection of collections) {
            const data = await collection.find({}).toArray();
            backupData[collection.collectionName] = data;
        }

        const filename = `backup_${Date.now()}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        try {
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
        } catch (err) {
            console.log("Lỗi khi ghi file sao lưu:", err);
            return;
        }

        await Backup.create({
            filename,
            filePath,
            description: "Sao lưu thành công",
            createdBy: null,
        });

        console.log(`Sao lưu thành công: ${filename}`);

        res.status(200).json({ message: "Sao lưu thành công!" });
    } catch (error) {
        console.log("Sao lưu thất bại:", error);
    }
};

const cleanupOldBackups = (req, res) => {
    try {
        fs.readdir(BACKUP_DIR, (err, files) => {
            if (err) {
                console.log("Lỗi khi đọc thư mục backups:", err);
                return res.status(500).json({ message: "Lỗi khi đọc thư mục backups!" });
            }

            let deletedFiles = [];
            let keptFiles = [];

            files.forEach((file) => {
                const filePath = path.join(BACKUP_DIR, file);
                try {
                    const stats = fs.statSync(filePath);
                    const ageInMilliseconds = Date.now() - stats.mtimeMs;

                    if (ageInMilliseconds > MAX_AGE) {
                        fs.unlinkSync(filePath);
                        deletedFiles.push(file);
                        console.log(`Xoá sao lưu cũ: ${file}`);
                    } else {
                        keptFiles.push(file);
                        console.log(`Giữ lại: ${file} (Ngày tạo: ${stats.mtime})`);
                    }
                } catch (err) {
                    console.log(`Lỗi khi xoá sao lưu ${file}:`, err);
                }
            });

            res.status(200).json({
                message: "Dọn dẹp hoàn tất!",
                deleted: deletedFiles,
                kept: keptFiles
            });
        });
    } catch (error) {
        console.log("Xoá sao lưu thất bại:", error);
        res.status(500).json({ message: "Xoá sao lưu thất bại!" });
    }
};

setInterval(backupDatabase, 24 * 60 * 60 * 1000);
setInterval(cleanupOldBackups, 7 * 24 * 60 * 60 * 1000);

const restoreDatabase = async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ message: "Thiếu filename để phục hồi!" });
        }

        if (!filename.endsWith('.json')) {
            return res.status(400).json({ message: "File không hợp lệ! Chỉ chấp nhận file .json." });
        }

        const filePath = path.join(BACKUP_DIR, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File backup không tồn tại!" });
        }

        const backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const collectionName in backupData) {
            if (backupData.hasOwnProperty(collectionName)) {
                const collection = mongoose.connection.collection(collectionName);
                const documents = backupData[collectionName];

                if (documents && documents.length > 0) {
                    for (const doc of documents) {
                        if (doc.createdAt) {
                            doc.createdAt = new Date(doc.createdAt);
                        }
                        if (doc.updatedAt) {
                            doc.updatedAt = new Date(doc.updatedAt);
                        }
                        if (doc._id) {
                            doc._id = new mongoose.Types.ObjectId(doc._id.toString());
                        }

                        const existingDoc = await collection.findOne({ _id: doc._id });

                        if (!existingDoc) {
                            try {
                                await collection.insertOne(doc);
                                console.log(`Thêm document vào ${collectionName}: ${doc._id}`);
                            } catch (error) {
                                console.log(`Lỗi khi thêm document vào ${collectionName}: ${doc._id} - ${error.message}`);
                            }
                        } else {
                            console.log(`Document với _id ${doc._id} đã tồn tại trong ${collectionName}, bỏ qua.`);
                        }
                    }
                }
            }
        }

        return res.status(200).json({ message: "Phục hồi dữ liệu hoàn tất!" });
    } catch (error) {
        console.error("Lỗi khi phục hồi:", error);
        return res.status(500).json({ message: "Lỗi khi phục hồi dữ liệu!" });
    }
};

const downloadLatestBackup = async (req, res) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (files.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy file backup nào!" });
        }

        const latestFile = files[0].name;
        const filePath = path.join(BACKUP_DIR, latestFile);

        res.setHeader('Content-Disposition', `attachment; filename="${latestFile}"`);
        res.setHeader('Content-Type', 'application/json');

        const fileStream = fs.createReadStream(filePath);
        
        fileStream.pipe(res);
    } catch (error) {
        console.log("Lỗi khi tải file backup:", error);
        return res.status(500).json({ message: "Lỗi khi tải file backup!" });
    }
};

module.exports = { backupDatabase, cleanupOldBackups, restoreDatabase, downloadLatestBackup };