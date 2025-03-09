const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
    } 
});
 
const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };  
        await transporter.sendMail(mailOptions); 
    } catch (error) { 
        console.log(error);
        throw new Error('Có lỗi xảy ra, không thể gửi email');
    }
};

module.exports = {sendEmail};
