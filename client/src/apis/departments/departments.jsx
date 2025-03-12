import axios from '../../configs/axiosCustomize';

export const getDepartments = async () => {
  try {
    const response = await axios.get('/departments');
    return response;
  } catch (error) {
    return error;
  }
};

export const assignManager = async (id) => {
  try {
    const response = await axios.get(`/departments/assign-manager`);
    return response;
  } catch (error) {
    return error;
  }
}
export const createDepartment = async (data) => {
  try {
    const response = await axios.post('/departments', data);
    return response;
  } catch (error) {
    return error;
  }
}

export const updateDepartment = async (id, data) => {
  try {
    const response = await axios.put(`/departments/${id}`, data);
    return response;
  } catch (error) {
    return error;
  }
}

export const deleteDepartment = async (id) => {
  try {
    const response = await axios.delete(`/departments/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}