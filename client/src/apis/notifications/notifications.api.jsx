import axios from '../../configs/axiosCustomize';

export const getNotifications = async (page,pageSize,filter, selectedType, startDate, endDate) => {
  const res = await axios.get('/notifications',{
    params: {
      page,
      pageSize,
      status: filter,
      type: selectedType,
      startDate,
      endDate
    }
  });
  return res;
}

export const createNotification = async (data) => {
  const res = await axios.post('/notifications', data);
  return res;
}

export const updatemarkAsRead = async (id) => {
  const res = await axios.put(`/notifications/${id}/read`);
  return res;
}