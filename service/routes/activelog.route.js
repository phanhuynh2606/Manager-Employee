const Route = require("express").Router();
const activeLogController = require("../controllers/activelog.controller")
const authMiddleware = require("../middlewares/auth.middleware")
Route.use(authMiddleware.authenticate)
Route.use(authMiddleware.isAdmin)
Route.post("/",activeLogController.getAllLog)

module.exports = Route