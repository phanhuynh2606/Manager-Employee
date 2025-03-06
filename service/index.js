require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initRoutes = require('./routes/index.route');
const connectDB = require('./config/mongo');
const path = require('path'); 
const app = express();
const port = process.env.PORT || 9000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images'))); 

connectDB(); 
initRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});