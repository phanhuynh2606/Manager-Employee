const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

        const filename = `backup_${Date.now()}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        await Backup.create({
            filename,
            filePath,
            description: "Sao lưu thành công",
            createdBy: null,
        });

        for (const collection of collections) {
            const data = await collection.find({}).toArray();
            backupData[collection.collectionName] = data;
        }

        try {
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
        } catch (err) {
            console.log("Lỗi khi ghi file sao lưu:", err);
            return;
        }

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
                            doc._id = new mongoose.Types.ObjectId(doc._id);
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

// const createBackupFromMongoDB = async (req, res) => {
//     try {
//         const backupData = {};
//         const db = mongoose.connection.db;

//         const collections = await db.listCollections().toArray();

//         for (const collectionInfo of collections) {
//             const collectionName = collectionInfo.name;
//             const collection = db.collection(collectionName);

//             const documents = await collection.find({}).toArray();
//             backupData[collectionName] = documents;
//         }

//         const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//         const backupFileName = `backup-${timestamp}.json`;
//         const backupFilePath = path.join(BACKUP_DIR, backupFileName);

//         fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');

//         return res.status(200).json({
//             success: true,
//             message: "Tạo file backup từ MongoDB thành công!",
//             backupFile: backupFileName
//         });
//     } catch (error) {
//         console.error("Lỗi khi tạo backup từ MongoDB:", error);
//         return res.status(500).json({ success: false, message: "Lỗi khi tạo file backup!" });
//     }
// };

const createBackupFromMongoDB = async (req, res) => {
    try {
        const backupData = {};
        const db = mongoose.connection.db;

        // Lấy danh sách collections
        const collections = await db.listCollections().toArray();

        // Duyệt qua từng collection
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = db.collection(collectionName);

            // Lấy tất cả documents
            const documents = await collection.find({}).toArray();

            // Chuyển đổi dữ liệu sang định dạng JSON thuần
            backupData[collectionName] = documents.map(doc => {
                // Chuyển ObjectId thành string và xử lý các kiểu dữ liệu đặc biệt
                return JSON.parse(JSON.stringify(doc));
            });
        }

        // Tạo timestamp cho tên file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${timestamp}.json`;
        const backupFilePath = path.join(BACKUP_DIR, backupFileName);

        // Ghi file JSON với định dạng đẹp
        fs.writeFileSync(
            backupFilePath,
            JSON.stringify(backupData, null, 2),
            'utf-8'
        );

        return res.status(200).json({
            success: true,
            message: "Tạo file backup từ MongoDB thành công!",
            backupFile: backupFileName
        });
    } catch (error) {
        console.error("Lỗi khi tạo backup từ MongoDB:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tạo file backup!",
            error: error.message
        });
    }
};

const restoreLatestBackup = async (req, res) => {
    try {
        const files = fs
            .readdirSync(BACKUP_DIR)
            .filter((file) => file.endsWith(".json"))
            .map((file) => ({
                name: file,
                time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);


        if (files.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy file backup nào!" });
        }


        const latestFile = files[0].name;
        const filePath = path.join(BACKUP_DIR, latestFile);
        const backupData = JSON.parse(fs.readFileSync(filePath, "utf-8"));


        const toObjectId = (value) => {
            if (!value) return value;
            if (typeof value === "object" && value.$oid) value = value.$oid;
            if (typeof value !== "string") return value;
            try {
                return new mongoose.Types.ObjectId(value);
            } catch (e) {
                console.log(
                    `Không thể chuyển đổi ${value} thành ObjectId: ${e.message}`
                );
                return value;
            }
        };


        const toDate = (value) => {
            if (typeof value === "object" && value.$date) value = value.$date;
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date;
        };


        const convertValues = (
            doc,
            objectIdFields,
            dateFields,
            arrayObjectIdFields
        ) => {
            // Chuyển đổi các trường ObjectId đơn
            objectIdFields.forEach((field) => {
                if (doc[field]) {
                    doc[field] = toObjectId(doc[field]);
                }
            });


            // Chuyển đổi các trường ObjectId trong mảng
            arrayObjectIdFields.forEach((field) => {
                if (doc[field] && Array.isArray(doc[field])) {
                    doc[field] = doc[field].map((item) => toObjectId(item));
                }
            });


            // Chuyển đổi các trường Date
            dateFields.forEach((field) => {
                if (doc[field]) {
                    doc[field] = toDate(doc[field]);
                }
            });


            // Chuyển đổi các trường ObjectId và Date trong các đối tượng lồng nhau
            if (doc.oldValues || doc.newValues) {
                ["oldValues", "newValues"].forEach((nestedField) => {
                    if (doc[nestedField]) {
                        for (const key in doc[nestedField]) {
                            if (doc[nestedField].hasOwnProperty(key)) {
                                if (
                                    key === "_id" ||
                                    key === "createdBy" ||
                                    key === "managerId" ||
                                    key === "userId" ||
                                    key === "departmentId" ||
                                    key === "position"
                                ) {
                                    doc[nestedField][key] = toObjectId(doc[nestedField][key]);
                                } else if (key === "createdAt" || key === "updatedAt") {
                                    doc[nestedField][key] = toDate(doc[nestedField][key]);
                                }
                            }
                        }
                    }
                });
            }


            if (doc.allowances || doc.bonuses || doc.deductions || doc.daySalary) {
                ["allowances", "bonuses", "deductions", "daySalary"].forEach(
                    (nestedField) => {
                        if (doc[nestedField] && Array.isArray(doc[nestedField])) {
                            doc[nestedField] = doc[nestedField].map((item) => {
                                if (item._id) item._id = toObjectId(item._id);
                                if (item.periodStart)
                                    item.periodStart = toDate(item.periodStart);
                                if (item.periodEnd) item.periodEnd = toDate(item.periodEnd);
                                return item;
                            });
                        }
                    }
                );
            }


            return doc;
        };


        const objectIdFields = {
            attendances: ["_id", "employeeId"],
            backups: ["_id", "createdBy"],
            departments: ["_id", "managerId", "createBy"],
            employees: ["_id", "userId", "departmentId", "position"],
            leaves: ["_id", "employeeId"],
            leaveRequests: ["_id", "employeeId", "approvedBy"],
            activity_logs: ["_id", "userId", "entityId"],
            notifications: ["_id", "createdBy"],
            positions: ["_id"],
            salaries: ["_id", "employeeId"],
            user_session: ["_id", "userId"],
            users: ["_id", "employeeId"]
        };


        const arrayObjectIdFields = {
            notifications: ["departmentId", "recipientId", "readBy"]
        };


        const dateFields = {
            attendances: ["date", "checkIn", "checkOut", "createdAt", "updatedAt"],
            backups: ["createdAt"],
            departments: ["createdAt", "updatedAt"],
            employees: ["dateOfBirth", "hireDate", "createdAt", "updatedAt"],
            leaves: ["startDate", "endDate", "createdAt", "updatedAt"],
            leaveRequests: [
                "startDate",
                "endDate",
                "approvedAt",
                "createdAt",
                "updatedAt"
            ],
            activity_logs: ["createdAt"],
            notifications: ["createdAt", "updatedAt"],
            positions: ["createdAt", "updatedAt"],
            salaries: [
                "periodStart",
                "periodEnd",
                "paymentDate",
                "createdAt",
                "updatedAt"
            ],
            user_session: ["lastAccessed", "createdAt", "updatedAt"],
            users: ["lastLogin", "createdAt", "updatedAt"]
        };


        for (const collectionName in backupData) {
            if (backupData.hasOwnProperty(collectionName)) {
                const collection = mongoose.connection.collection(collectionName);
                const documents = backupData[collectionName];
                const fieldsToConvertToObjectId = objectIdFields[collectionName] || [
                    "_id"
                ];
                const fieldsToConvertToDate = dateFields[collectionName] || [
                    "createdAt",
                    "updatedAt"
                ];
                const arrayFieldsToConvert = arrayObjectIdFields[collectionName] || [];


                if (documents && documents.length > 0) {
                    for (const doc of documents) {
                        let restoredDoc = { ...doc };


                        // Chuyển đổi các trường ObjectId và Date
                        restoredDoc = convertValues(
                            restoredDoc,
                            fieldsToConvertToObjectId,
                            fieldsToConvertToDate,
                            arrayFieldsToConvert
                        );


                        // Xử lý các trường đặc biệt


                        // Xử lý các trường Date trong mảng daySalary của salary
                        if (
                            collectionName === "salaries" &&
                            restoredDoc.daySalary &&
                            Array.isArray(restoredDoc.daySalary)
                        ) {
                            restoredDoc.daySalary = restoredDoc.daySalary.map((day) =>
                                convertValues(day, [], ["periodStart", "periodEnd"], [])
                            );
                        }


                        // Xử lý mật khẩu cho users
                        if (collectionName === "users" && restoredDoc.password) {
                            if (
                                !restoredDoc.password.startsWith("$2a$") &&
                                !restoredDoc.password.startsWith("$2b$")
                            ) {
                                restoredDoc.password = await bcrypt.hash(
                                    restoredDoc.password,
                                    10
                                );
                                console.log(
                                    `Mật khẩu của ${restoredDoc._id} chưa mã hóa, đã mã hóa lại.`
                                );
                            }
                        }


                        // Kiểm tra document đã tồn tại chưa
                        const existingDoc = await collection.findOne({
                            _id: restoredDoc._id
                        });


                        if (!existingDoc) {
                            await collection.insertOne(restoredDoc);
                            console.log(
                                `Thêm document vào ${collectionName}: ${restoredDoc._id}`
                            );
                        } else {
                            // Chuẩn hóa document hiện tại để so sánh
                            const normalizedExistingDoc = {};
                            for (const key in existingDoc) {
                                if (
                                    fieldsToConvertToObjectId.includes(key) &&
                                    existingDoc[key] instanceof mongoose.Types.ObjectId
                                ) {
                                    normalizedExistingDoc[key] = existingDoc[key].toString();
                                } else if (
                                    arrayFieldsToConvert.includes(key) &&
                                    Array.isArray(existingDoc[key])
                                ) {
                                    normalizedExistingDoc[key] = existingDoc[key].map((id) =>
                                        id instanceof mongoose.Types.ObjectId ? id.toString() : id
                                    );
                                } else if (
                                    fieldsToConvertToDate.includes(key) &&
                                    existingDoc[key] instanceof Date
                                ) {
                                    normalizedExistingDoc[key] = existingDoc[key].toISOString();
                                } else if (
                                    key === "daySalary" &&
                                    Array.isArray(existingDoc[key])
                                ) {
                                    normalizedExistingDoc[key] = existingDoc[key].map((day) => ({
                                        ...day,
                                        periodStart:
                                            day.periodStart instanceof Date
                                                ? day.periodStart.toISOString()
                                                : day.periodStart,
                                        periodEnd:
                                            day.periodEnd instanceof Date
                                                ? day.periodEnd.toISOString()
                                                : day.periodEnd
                                    }));
                                } else {
                                    normalizedExistingDoc[key] = existingDoc[key];
                                }
                            }


                            // So sánh để quyết định cập nhật
                            const isEqual =
                                JSON.stringify(normalizedExistingDoc) === JSON.stringify(doc);
                            if (!isEqual) {
                                await collection.updateOne(
                                    { _id: restoredDoc._id },
                                    { $set: restoredDoc },
                                    { upsert: true }
                                );
                                console.log(
                                    `Cập nhật document trong ${collectionName}: ${restoredDoc._id}`
                                );
                            } else {
                                console.log(
                                    `Document với _id ${restoredDoc._id} trong ${collectionName} đã khớp, bỏ qua.`
                                );
                            }
                        }
                    }
                }
            }
        }


        return res.status(200).json({
            success: true,
            message: "Phục hồi dữ liệu hoàn tất!",
            restoredFile: latestFile
        });
    } catch (error) {
        console.error("Lỗi khi phục hồi từ file mới nhất:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi phục hồi dữ liệu từ file mới nhất!",
            error: error.message
        });
    }
};

// const restoreLatestBackup = async (req, res) => {
//     try {
//         // Tìm file backup mới nhất
//         const files = fs.readdirSync(BACKUP_DIR)
//             .filter(file => file.endsWith('.json'))
//             .map(file => ({
//                 name: file,
//                 time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
//             }))
//             .sort((a, b) => b.time - a.time);

//         if (files.length === 0) {
//             return res.status(404).json({ message: "Không tìm thấy file backup nào!" });
//         }

//         const latestFile = files[0].name;
//         const filePath = path.join(BACKUP_DIR, latestFile);

//         // Đọc dữ liệu từ file backup mới nhất
//         const backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

//         // Phục hồi dữ liệu từ file
//         for (const collectionName in backupData) {
//             if (backupData.hasOwnProperty(collectionName)) {
//                 const collection = mongoose.connection.collection(collectionName);
//                 const documents = backupData[collectionName];

//                 if (documents && documents.length > 0) {
//                     for (const doc of documents) {
//                         // Chuyển đổi các trường date và ObjectId
//                         if (doc.createdAt) {
//                             doc.createdAt = new Date(doc.createdAt);
//                         }
//                         if (doc.updatedAt) {
//                             doc.updatedAt = new Date(doc.updatedAt);
//                         }
//                         if (doc._id) {
//                             doc._id = new mongoose.Types.ObjectId(doc._id.toString());
//                         }

//                         // Kiểm tra và mã hóa mật khẩu nếu cần (chỉ cho collection 'users')
//                         if (collectionName === 'users' && doc.password) {
//                             const isHashed = await bcrypt.compare(doc.password, doc.password).catch(() => false);
//                             if (!isHashed && !doc.password.startsWith('$2a$') && !doc.password.startsWith('$2b$')) {
//                                 // Nếu mật khẩu chưa được mã hóa, mã hóa nó
//                                 doc.password = await bcrypt.hash(doc.password, 10);
//                                 console.log(`Mật khẩu của ${doc._id} chưa mã hóa, đã mã hóa lại.`);
//                             } else {
//                                 console.log(`Mật khẩu của ${doc._id} đã được mã hóa, giữ nguyên.`);
//                             }
//                         }

//                         const existingDoc = await collection.findOne({ _id: doc._id });

//                         if (!existingDoc) {
//                             try {
//                                 await collection.insertOne(doc);
//                                 console.log(`Thêm document vào ${collectionName}: ${doc._id}`);
//                             } catch (error) {
//                                 console.log(`Lỗi khi thêm document vào ${collectionName}: ${doc._id} - ${error.message}`);
//                             }
//                         } else {
//                             console.log(`Document với _id ${doc._id} đã tồn tại trong ${collectionName}, bỏ qua.`);
//                         }
//                     }
//                 }
//             }
//         }

//         return res.status(200).json({ 
//             message: "Phục hồi dữ liệu từ file mới nhất hoàn tất!",
//             restoredFile: latestFile 
//         });
//     } catch (error) {
//         console.error("Lỗi khi phục hồi từ file mới nhất:", error);
//         return res.status(500).json({ message: "Lỗi khi phục hồi dữ liệu từ file mới nhất!" });
//     }
// };

module.exports = { backupDatabase, cleanupOldBackups, restoreDatabase, downloadLatestBackup, restoreLatestBackup, createBackupFromMongoDB };