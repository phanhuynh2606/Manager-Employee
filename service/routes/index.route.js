
const statisticRoute = require("./statistic.route")
const departmentRoute = require('./department.route');
const authRoute = require('./auth.route');
const employeeRoute = require('./employee.route');
const adminRoute = require('./administration.route');
const attendanceRoute = require('./attendance.route');
const salaryRoute = require('./salary.route');
const notificationRoute = require('./notification.route');
const backupRoute = require('./backup.route');
const activeRoute = require("./activelog.route")
const positionRoute = require('./position.route');
const initRoutes = (app) => {

  app.get('/', (req, res) => {
    res.send('Welcome to API Manager Employee!');
  });

  app.use("/activelog",activeRoute)
  app.use('/statistic', statisticRoute); 
  app.use('/departments', departmentRoute);
  app.use('/auth', authRoute);
  app.use('/employee', employeeRoute);
  app.use('/admin', adminRoute);
  app.use('/attendance', attendanceRoute);
  app.use('/salaries', salaryRoute)
  app.use('/notifications', notificationRoute);
  app.use('/', backupRoute);
  app.use('/positions', positionRoute)
}

module.exports = initRoutes;
