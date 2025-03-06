import axios from '../../configs/axiosCustomize';

export const getDepartments = async () => {
  try {
    const response = await axios.get('/departments');
    return response;
  } catch (error) {
    return error;
  }
};