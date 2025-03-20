import axios from '../../configs/axiosCustomize';

export const getPositions = async ({ name }) => {
    try {
        const response = await axios.get('/positions', {
            params: { name }
        });
        return response;
    } catch (error) {
        return error;
    }
};

export const createPosition = async (data) => {
    try {
        const response = await axios.post('/positions', data);
        return response;
    } catch (error) {
        return error;
    }
}

export const getPosition = async (id) => {
    try {
        const response = await axios.get(`/positions/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

export const updatePosition = async (id, data) => {
    try {
        const response = await axios.patch(`/positions/${id}`, data);
        return response;
    } catch (error) {
        return error;
    }
};

export const deletePosition = async (id) => {
    try {
        const response = await axios.delete(`/positions/${id}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Có lỗi xảy ra khi xóa");
        }

        return data;
    } catch (error) {
        return { error: error.message };
    }
};