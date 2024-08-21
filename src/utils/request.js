import axios from "axios";
import store from "@/store";
import { getToken } from "./auth";
import { message } from 'ant-design-vue'

const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 5000,
});

// Add a request interceptor
service.interceptors.request.use(

    config => {
        if (store.getters.token) {
            config.headers["X-Token"] = getToken();
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }

);

// Add a response interceptor
service.interceptors.response.use(

    response => {
        const res = response.data;
        if (res.code !== 20000) {
            message.error( res.message || 'Error');
            return Promise.reject(new Error(res.message || 'Error'));
        }
        return res;
    },
    error => {
        message.error( error.message || 'Error');
        return Promise.reject(error);
    }
);

export default service;
