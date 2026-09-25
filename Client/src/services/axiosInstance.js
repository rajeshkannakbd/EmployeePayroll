// src/services/axiosInstance.js

import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
});

axiosInstance.interceptors.request.use(
    (config) => {

        const savedAuth = localStorage.getItem("payroll_auth");

        let token = null;

        if (savedAuth) {
            try {
                const auth = JSON.parse(savedAuth);
                token = auth?.token;
            } catch (error) {
                console.error(
                    "Invalid authentication data:",
                    error
                );
            }
        }

        const publicEndpoints = [
            "/auth/login",
            "/auth/signup",
        ];

        const isPublicEndpoint = publicEndpoints.some(
            (endpoint) => config.url?.endsWith(endpoint)
        );

        if (token && !isPublicEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (isPublicEndpoint) {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;