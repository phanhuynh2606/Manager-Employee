import axios from '../../configs/axiosCustomize';

export const getNotifications = async (employeeId) => {
  const res = await axios.get('/notifications');
  return res;
}

export const createNotification = async (data) => {
  const res = await axios.post('/notifications', data);
  return res;
}