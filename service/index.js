require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initRoutes = require('./routes/index.route');
const connectDB = require('./config/mongo');
const app = express();
const port = process.env.PORT || 9000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB(); 
initRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});