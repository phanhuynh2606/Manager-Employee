import axios from "@/configs/axiosCustomize";
import API_BE from "@/constant/API_BE.js";

export const backupsData = async () => {
    try {
        const response = await axios.get(API_BE.BACKUP_DATA_IN_DATABASE);
        return response.data;
    } catch (error) {
        console.error(error, "Error");
        return [];
    }
};

export const restoreBackup = async () => {
    try {
        const response = await axios.get(API_BE.RESTORE_DATA_IN_DATABASE);
        return response.data;
    } catch (error) {
        console.error(error, "Error");
        return [];
    }
};