import axios from "axios";
import toast from "react-hot-toast";

axios.interceptors.response.use(
  res => res,
  err => {
    if (!err.response) {
      toast.error("Network error: check your connection");
    } else if (err.response.status === 404) {
      toast.error("Resource not found (404)");
      window.location.href = "/error/404";
    } else if (err.response.status === 500) {
      toast.error("Server error (500)");
      window.location.href = "/error/500";
    }
    return Promise.reject(err);
  }
);

export default axios;