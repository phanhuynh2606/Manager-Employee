const cloudinary = require('cloudinary').v2;
require('dotenv').config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
}); 
const uploadToCloudinary = async (filePath, options = {}) => {
  try { 
    const defaultOptions = {
      folder: 'employee-avatars',
      use_filename: false,
      unique_filename: true,
      overwrite: true,
      resource_type: 'auto', // tự động phát hiện loại tài nguyên
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' } // Crop và focus vào khuôn mặt nếu có
      ]
    }; 
    const uploadOptions = { ...defaultOptions, ...options }; 
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};
 
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};
 
const generateUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  generateUrl
};