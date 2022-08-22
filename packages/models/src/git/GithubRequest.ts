import { AxiosInstance } from "axios";

const axios = require('axios');
const BASE_URL = 'https://api.github.com';

class GithubRequest {
  token:string=""
  service:AxiosInstance
  constructor(token:string) {
    this.token = token;
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });
    this.service.interceptors.request.use(
      (config:any) => {
        config.headers['Authorization'] = `token ${this.token}`;
        return config;
      },
      error => {
        Promise.reject(error);
      },
    );
    this.service.interceptors.response.use(
      response => {
        return response.data;
      },
      error => {
        if (error.response && error.response.data) {
          return error.response;
        } else {
          return Promise.reject(error);
        }
      },
    );
  }

  get(url:string, params?:any, headers?:any) {
    return this.service({
      url,
      params,
      method: 'get',
      headers,
    });
  }

  post(url:string, data?:any, headers?:any) {
    return this.service({
      url,
      data,
      method: 'post',
      headers,
    });
  }
}

export default GithubRequest;
