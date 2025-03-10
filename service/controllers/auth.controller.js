const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const {isActiveUser} = require("../utils/isActiveUser");

const authLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required!"
            });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email not found!"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password!"
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
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successfully!",
            email: user.email,
            role: user.role,
            active: user.isActive
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
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

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (e) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};

const firstTimeChangePassword = async (req, res) => {
    try {
        const {email, oldPassword, newPassword, newConfirmPassword} = req.body;

        if (!oldPassword || !newPassword || !newConfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please all field!"
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password need to different new password!"
            });
        }

        if (newPassword !== newConfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password need to same confirm password!"
            });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect!"
            });
        }

        user.password = newPassword;
        user.isActive = "1";
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (e) {
        res.status(401).json({
            success: false,
            message: e.message
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
            message: "Logged out successfully!"
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

const getProfile = (req, res) => {
    try {
        const { username } = req.user;
        res.status(200).json({
            success: true,
            result: {
                username
            }
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

module.exports = {authLogin, refreshAccessToken, firstTimeChangePassword, authLogout, getProfile};