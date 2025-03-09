const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

const authLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required!"
            });
        };

        const user = await User.findOne({email}).select("+password");
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
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Internal Server Error"
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

module.exports = {authLogin, refreshAccessToken};