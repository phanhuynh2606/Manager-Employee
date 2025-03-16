const jwt = require('jsonwebtoken');
const User = require("../models/user");

const authenticate = async (req, res, next) => {
    try {
        const {accessToken} = req.cookies;
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Không có quyền truy cập!"
            });
        }

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({
                        success: false,
                        message: "Phiên đăng nhập hết hạn!"
                    });
                }
                return res.status(401).json({
                    success: false,
                    message: "Không có quyền truy cập!"
                });
            }

            const user = await User.findById(decoded.id).select("-password -__v ");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng!"
                });
            }
            req.user = user;
            next();
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};
const isAdmin = async (req, res, next) => {
    try {
        if (req?.user?.role === "ADMIN") {
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Không có quyền truy cập",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ",
        });
    }
};
module.exports = {authenticate, isAdmin};
