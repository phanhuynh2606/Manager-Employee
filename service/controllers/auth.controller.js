const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Employee = require("../models/employee");
const Department =require("../models/department");
const {isActiveUser} = require("../utils/isActiveUser");

const authLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc!"
            });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email không tìm thấy!"
            });
        }

        const getEmployee = await Employee.findOne({userId: user._id});

        let manager = "STAFF";
        const getManager = await Department.findOne({managerId: getEmployee._id});
        if(getManager) {
            manager = "MANAGER";
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu không hợp lệ!"
            });
        }

        const isActiveResponse = isActiveUser(user.isActive, res);
        if (isActiveResponse) return isActiveResponse;

        const accessToken = user.SignAccessToken();
        const refreshToken = user.SignRefreshToken();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/"
        };

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            email: user.email,
            role: user.role,
            active: user.isActive,
            position: manager
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại!"
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        if (!refreshToken) {
            return res.status(403).json({
                success: false,
                message: "Không có refresh token được cung cấp"
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tìm thấy!"
            });
        }

        const newAccessToken = user.SignAccessToken();

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (e) {
        console.error("Refresh token error:", e);

        if (e.name === "TokenExpiredError") {
            return res.status(403).json({
                success: false,
                message: "Refresh token đã hết hạn"
            });
        }

        return res.status(403).json({
            success: false,
            message: "Refresh token không hợp lệ"
        });
    }
};

const firstTimeChangePassword = async (req, res) => {
    try {
        const {email, oldPassword, newPassword, newConfirmPassword} = req.body;

        if (!oldPassword || !newPassword || !newConfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ các trường!"
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu cũ cần khác với mật khẩu mới!"
            });
        }

        if (newPassword !== newConfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới cần giống với mật khẩu xác nhận!"
            });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng!"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu cũ không chính xác!"
            });
        }

        user.password = newPassword;
        user.isActive = "1";
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Mật khẩu đã được thay đổi thành công!"
        });
    } catch (e) {
        res.status(401).json({
            success: false,
            message: "Thay đổi mật khẩu thất bại!"
        });
    }
};

const authLogout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/"
        });

        res.status(200).json({
            success: true,
            message: "Đăng xuất thành công!"
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Thay đổi mật khẩu không thành công!"
        });
    }
};

const getProfile = (req, res) => {
    try {
        const {username} = req.user;
        res.status(200).json({
            success: true,
            result: {
                username
            }
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Đăng xuất thất bại!"
        });
    }
};

module.exports = {authLogin, refreshAccessToken, firstTimeChangePassword, authLogout, getProfile};