import axios from 'axios';

const BASE_URL = process.env.MODERATE_CLI_BASE_URL ? process.env.MODERATE_CLI_BASE_URL :
    'https://zero2one.moderate.run/api2';

const request = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
});

request.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        return Promise.reject(error);
    }
);

export default  request;
