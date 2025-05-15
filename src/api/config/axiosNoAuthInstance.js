import axios from "axios";
import { BASE_URL } from "./axiosInstance";

const axiosNoAuthInstance = axios.create({
    baseURL: BASE_URL, // http://localhost:8080/
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

export default axiosNoAuthInstance;