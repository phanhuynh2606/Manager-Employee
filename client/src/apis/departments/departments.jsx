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

//
export const getDepartmentById = async (id) => {
  try {
    const response = await axios.get(`/departments/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

export const getEmployeesOtherDepartments = async (departmentId) => {
  try {
    const response = await axios.get(`/departments/${departmentId}/employees-other-departments`);
    return response;
  } catch (error) {
    return error;
  }
}

// Gán nhân viên vào phòng ban
export const assignEmployeeToDepartment = async (departmentId, employeeIds) => {
  try {
    const response = await axios.post(`/departments/${departmentId}/assign-employee`, { employeeIds });
    return response;
  } catch (error) {
    return error;
  }
}
