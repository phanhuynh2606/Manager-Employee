import axios from "@/configs/axiosCustomize";
import API_BE from "@/constant/API_BE.js";

export const downloadBackup = async () => {
    try {
        console.log("Gửi request tải file backup...");

        const response = await axios.get(API_BE.DOWLOAD_FILE_BACKUP, {
            responseType: "blob", // Giữ nguyên để nhận file dạng blob
            withCredentials: true,
        });

        // Log phản hồi gốc từ axios
        console.log("Full response:", response);

        // Dữ liệu blob nằm trong response.data, không phải response trực tiếp
        const blob = response.data;
        console.log("Blob data:", blob);
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (!blob) {
            throw new Error("Không nhận được dữ liệu từ server!");
        }

        // Lấy tên file từ header Content-Disposition
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "backup.json";

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match && match[1]) {
                fileName = match[1];
            }
        }

        // Tạo URL và tải file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Giải phóng bộ nhớ

        return { success: true, message: "Tải file backup thành công!" };
    } catch (error) {
        console.error("Lỗi khi tải file backup:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return { success: false, message: "Lỗi khi tải file backup!" };
    }
};

export const restoreBackup = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(API_BE.RESTORES, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Lỗi khi phục hồi dữ liệu:", error);
        return { success: false, message: "Lỗi khi phục hồi dữ liệu!" };
    }
};
