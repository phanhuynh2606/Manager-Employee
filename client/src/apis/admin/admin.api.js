import axios from "../../configs/axiosCustomize";

export const getAdmins = async () => {
  try {
    const response = await axios.get("/admin");
    return response;
  } catch (error) {
    throw error;
  }
}

export const getAdminDetail = async (id) => {
  try {
    const response = await axios.get(`/admin/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export const createAdmin = async (data) => {
  try {
    const response = await axios.post("/admin/create", data);
    return response;
  } catch (error) {
    throw error;
  }
}