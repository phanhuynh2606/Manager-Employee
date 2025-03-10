require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initRoutes = require('./routes/index.route');
const connectDB = require('./config/mongo');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 9000;
app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));

connectDB();
initRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});