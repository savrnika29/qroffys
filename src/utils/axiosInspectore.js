import axios from "axios";
//16sepbyraj
const api = axios.create({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.message;

    if (status === 401 || message === "jwt expired") {
    //   store.dispatch(clearAuthState()); 
      window.location.href = "/login"; 
    }

    return Promise.reject(error);
  }
);