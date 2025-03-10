import axios from '../../configs/axiosCustomize';

export const getAttendances = async () => {
    try {
        const response = await axios.get('/attendances');
        return response;
    } catch (error) {
        return error;
    }
};
