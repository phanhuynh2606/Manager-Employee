import axios from '../../configs/axiosCustomize';

export const getAttendances = async () => {
    try {
        const response = await axios.get('/attendance');
        return response;
    } catch (error) {
        return error;
    }
};

export const getAttendanceHistory = async (startDate, endDate) => {
    try {
        const response = await axios.post(`/attendance/getAttendanceHistory`, {
            startDate: startDate,
            endDate: endDate
        });
        return response;
    }catch (e) {
        return e;
    }
}

export const getAttendanceToday = async () => {
    try {
        const response = await axios.get(`/attendance/getAttendanceToday`);
        return response;
    }catch (e) {
        return e;
    }
}

export const checkin = async (date) => {
    try {
        const response = await axios.post('/attendance/checkin',{
            date: date
        });
        return response;
    } catch (error) {
        return error;
    }
}

export const checkout = async (date) => {
    try {
        const response = await axios.post('/attendance/checkout', {
            date: date
        });
        return response;
    } catch (error) {
        return error;
    }
}

export const getAttendanceHistoryByMonth = async (startDate, endDate) => {
    try {
        const response = await axios.post(`/attendance/getAttendanceHistoryByMonth`, {
            startDate: startDate,
            endDate: endDate
        });
        return response;
    }catch (e) {
        return e;
    }
}
