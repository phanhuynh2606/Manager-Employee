require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initRoutes = require('./routes/index.route');
const connectDB = require('./config/mongo');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 9000;
const http = require('http');
const { initSocket } = require('./config/socket');
const server = http.createServer(app);
app.use(
  cors({
    origin: "https://employe-manager-sdn302.netlify.app",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
  })
);

initSocket(server);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));

connectDB();
initRoutes(app);

server.listen(port, () => {
  console.log(`Server is running on https://employe-manager-sdn302.netlify.app${port}`);
});