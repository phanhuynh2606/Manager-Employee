const departmentRoute = require('./department.route');
const initRoutes = (app) => {

  app.get('/', (req, res) => {
    res.send('Welcome to API Manager Employee!');
  });

  app.use('/departments', departmentRoute);
}

module.exports = initRoutes;