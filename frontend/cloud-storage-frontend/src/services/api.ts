import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;