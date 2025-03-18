import axios from '../../configs/axiosCustomize';
import API_BE from "@/constant/API_BE.js";

export const authLogin = async (email, password) => {
    try {
        const response = await axios.post(API_BE.LOGIN, {
            email: email,
            password: password
        });
        return response;
    } catch (e) {
        return e;
    }
};

export const firstTimeChangePassword = async (email, oldPassword, newPassword, newConfirmPassword) => {
    try {
        const response = await axios.post(API_BE.FIRST_TIME_CHANGE_PASSWORD, {
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword,
            newConfirmPassword: newConfirmPassword
        });
        return response;
    } catch (e) {
        return e;
    }
};

export const refreshToken = async () => {
    try {
        const response = await axios.get(API_BE.REFRESH_TOKEN);
        return response;
    } catch (e) {
        return e;
    }
};

export const logout = async () => {
    try {
        const response = await axios.get(API_BE.LOGOUT);
        return response;
    } catch (e) {
        return e;
    }
};

export const getProfile = async () => {
    try {
        const response = await axios.get(API_BE.GET_PROFILE);
        return response;
    } catch (e) {
        return e;
    }
};