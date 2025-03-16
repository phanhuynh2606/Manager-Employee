const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { uploadToCloudinary } = require('../utils/cloudinaryStorage'); 
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const shortId = req.params.employeeId ? req.params.employeeId.slice(-6) : 'unknown';
    const timestamp = Date.now().toString().slice(-6);
    const filename = `temp-${shortId}-${timestamp}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});
 
const upload = multer({
  storage: tempStorage,
  limits: {
    fileSize: 5 * 1024 * 1024  
  },
  fileFilter: (req, file, cb) => { 
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});
 
const uploadToCloud = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
 
    const shortId = req.params.employeeId ? req.params.employeeId.slice(-6) : 'unknown';
    const customPublicId = `avatar-${shortId}`;
    
    // Upload lên Cloudinary
    const result = await uploadToCloudinary(req.file.path, {
      public_id: customPublicId,  
      folder: 'employee-avatars',
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' }
      ]
    }); 
    fs.unlinkSync(req.file.path); 
    req.cloudinaryUrl = result.url;
    req.cloudinaryPublicId = result.publicId;
    
    next();
  } catch (error) { 
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
 
const uploadMultipleToCloud = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map(async (file, index) => {
      const shortId = req.params.employeeId ? req.params.employeeId.slice(-6) : 'unknown';
      const timestamp = Date.now().toString().slice(-6);
      const customPublicId = `gallery-${shortId}-${timestamp}-${index}`;
      
      const result = await uploadToCloudinary(file.path, {
        public_id: customPublicId,
        folder: 'employee-gallery'
      }); 
      fs.unlinkSync(file.path);
      
      return result;
    }); 
    const results = await Promise.all(uploadPromises); 
    req.cloudinaryResults = results; 
    next();
  } catch (error) { 
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};
 
const handleCloudinaryUpload = (fieldName) => {
  return [
    upload.single(fieldName),
    uploadToCloud
  ];
}; 
const handleMultipleCloudinaryUpload = (fieldName) => {
  return [
    upload.array(fieldName),
    uploadMultipleToCloud
  ];
};

module.exports = {
  upload,
  uploadToCloud,
  uploadMultipleToCloud,
  handleCloudinaryUpload,
  handleMultipleCloudinaryUpload
};