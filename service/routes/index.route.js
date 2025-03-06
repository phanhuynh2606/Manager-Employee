const departmentRoute = require('./department.route');
const employeeRoute = require('./employee.route');
const initRoutes = (app) => {

  app.get('/', (req, res) => {
    res.send('Welcome to API Manager Employee!');
  });

  app.use('/departments', departmentRoute);
  app.use('/employee', employeeRoute);
}

module.exports = initRoutes;