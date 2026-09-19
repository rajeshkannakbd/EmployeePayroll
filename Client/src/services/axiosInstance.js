// src/services/axiosInstance.js

import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
});

axiosInstance.interceptors.request.use((config) => {
    const savedAuth = localStorage.getItem("payroll_auth");

    if (savedAuth) {
        try {
            const auth = JSON.parse(savedAuth);

            if (auth?.token) {
                config.headers.Authorization = `Bearer ${auth.token}`;
            }
        } catch {
            // Ignore invalid stored auth
        }
    }

    return config;
});

export default axiosInstance;