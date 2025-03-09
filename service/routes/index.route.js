const departmentRoute = require('./department.route'); 
const authRoute = require('./auth.route'); 
const employeeRoute = require('./employee.route'); 
const initRoutes = (app) => {

  app.get('/', (req, res) => {
    res.send('Welcome to API Manager Employee!');
  });

  app.use('/departments', departmentRoute); 
  app.use('/auth', authRoute); 
  app.use('/employee', employeeRoute); 
}

module.exports = initRoutes;