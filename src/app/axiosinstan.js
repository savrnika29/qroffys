import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
