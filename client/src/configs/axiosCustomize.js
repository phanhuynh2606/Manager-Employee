import axios from "axios";
import { refreshToken } from "@/apis/auth/auth.js";

const instance = axios.create({
    baseURL: "http://localhost:4000",
    withCredentials: true,
});

instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 500) {
            console.warn("Server error:", error.response.data);
        }
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const result = await refreshToken();
                return instance(originalRequest);
            } catch (refreshError) {
                console.error("Interceptor: Refresh token failed ❌", refreshError);
                window.location = "/auth/sign-in";
            }
        }
        return Promise.reject(error);
    }
);

export default instance;