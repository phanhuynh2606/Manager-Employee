import axios from '../../configs/axiosCustomize';

export const getSalaries = async ({search, month, year, status}) => {
    try {
        const response = await axios.get('/salaries',{
            params: {
                search,
                month,
                year,
                status
            }
        });
        return response;
    } catch (error) {
        return error;
    }
};

export const getSalary = async (id) => {
    try {
        const response = await axios.get(`/salaries/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

export const createSalary = async (data) => {
    try {
        const response = await axios.post('/salaries', data);
        return response;
    } catch (error) {
        return error;
    }
};

export const updateSalary = async (id, data) => {
    try {
        const response = await axios.patch(`/salaries/${id}`, data);
        return response;
    } catch (error) {
        return error;
    }
};

export const deleteSalary = async (id) => {
    try {
        const response = await axios.delete(`/salaries/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

export const changeSalaryStatus = async (id, status) => {
    try {
        const response = await axios.patch(`/salaries/${id}/status`, { status });
        return response;
    } catch (error) {
        return error;
    }
}

export const getEmployeeSalary = async () => {
    try {
        const response = await axios.get('/employee');
        return response;
    } catch (error) {
        return error;
    }
}