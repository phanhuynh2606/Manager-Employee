const departmentRoute = require('./department.route');
const authRoute = require('./auth.route');
const employeeRoute = require('./employee.route');
const attendanceRoute = require('./attendance.route');
const salaryRoute = require('./salary.route');
const notificationRoute = require('./notification.route');
const initRoutes = (app) => {

  app.get('/', (req, res) => {
    res.send('Welcome to API Manager Employee!');
  });

  app.use('/departments', departmentRoute);
  app.use('/auth', authRoute);
  app.use('/employee', employeeRoute);
  app.use('/attendance', attendanceRoute);
  app.use('/salaries', salaryRoute)
  app.use('/notifications', notificationRoute);
}

module.exports = initRoutes;
