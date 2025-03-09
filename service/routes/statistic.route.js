const router = require('express').Router();

const statisticController = require("../controllers/statistic.controller")

router.post("/employee",statisticController.statisticEmployee)
router.post("/salary",statisticController.statisticSalary)

module.exports = router