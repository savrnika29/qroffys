import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // withCredentials: true, 
});
api.interceptors.request.use(
    (config) => {
        const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODgwODY2OWJjN2EzNzBjZmNjNDQ2MDciLCJlbWFpbCI6InBhcmtoeWFxYTA3KzAxQGdtYWlsLmNvbSIsIm5hbWUiOiJSaWNrIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzUzODc4MzkzLCJleHAiOjE3ODU0MTQzOTN9.MOP08FfoQGAJUPlZR4ydI_PAGV2DU0_nHf6Z4lo-Fs4"
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