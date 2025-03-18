import axios from '../../configs/axiosCustomize';

export const getSalaries = async ({ search, month, year }) => {
    try {
        const response = await axios.get('/salaries', {
            params: { search, month, year }
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

export const updateSalary = async (id, data) => {
    try {
        const response = await axios.patch(`/salaries/${id}`, data);
        return response;
    } catch (error) {
        return error;
    }
};

export const deleteSalary = async (id, salaryId) => {
    try {
        const response = await axios.delete(`/salaries/${id}`, {
            data: { salaryId }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Có lỗi xảy ra khi xóa");
        }

        return data;
    } catch (error) {
        return { error: error.message };
    }
};