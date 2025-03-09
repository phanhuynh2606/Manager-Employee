import axios from '../../configs/axiosCustomize';

export const getEmployees = async (searchData) => {
  try { 
    return await axios.get(`/employee/search?${searchData}`); 
  } catch (error) {
    return error;
  }
};

export const getEmployeePosition = async () => {
    try { 
        return await axios.get('/employee/positions'); 
    } catch (error) {
      return error;
    }
  };
export const getEmployeeDetail = async (employeeId) =>{
    try { 
        return await axios.get(`/employee/${employeeId}`); 
    } catch (error) {
        return error;
    }
}
 