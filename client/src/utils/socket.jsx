import { io } from 'socket.io-client';

const socket = io('https://api.codemy.id.vn/', {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false,
});

const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect(); 
    socket.on('connect', () => {
      socket.emit('registerUser', userId);
    });
  }
  return socket;
};
 
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
export { connectSocket, disconnectSocket };