const jwt = require('jsonwebtoken');
const User = require("../models/user");

const authenticate = async (req, res, next) => {
    try {
        const {accessToken} = req.cookies;
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err || !decoded?.id) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            } 
            req.user = user;
            next();
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Internal Server Error"
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
        message: "Unauthorized",
      });
    }
  } catch (error) {
      res.status(500).json({
        success: false,
        message: e.message || "Internal Server Error",
      });
  }
};
module.exports = {authenticate,isAdmin};