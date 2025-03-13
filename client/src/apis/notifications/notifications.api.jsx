import axios from '../../configs/axiosCustomize';

export const getNotifications = async (employeeId) => {
  const res = await axios.get('/notifications');
  return res;
}
