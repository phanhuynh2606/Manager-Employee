const { Server } = require('socket.io');

let io;
const connectedUsers = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // console.log(`🔗 User connected: ${socket.id}`);

    socket.on('joinRoom', (employeeId) => {
      // console.log(`🔗 Employee ${employeeId} joined room: ${socket.id}`);
      socket.join(employeeId);
      socket.emit('joinedRoom', `Joined room: ${employeeId}`);
    });

    socket.on('registerUser', (userId) => {
      // Lưu socket id và user id vào map để theo dõi
      connectedUsers[socket.id] = userId;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // console.log(`❌ User disconnected: ${socket.id}`);
      const userId = connectedUsers[socket.id];
      if (userId) {
        console.log(`User ${userId} disconnected`); 
        delete connectedUsers[socket.id];
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io chưa được khởi tạo!");
  return io;
};

module.exports = { initSocket, getIO };
