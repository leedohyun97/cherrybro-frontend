import axios from 'axios';
import { logout } from '../util/logout';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});


API.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (status === 401 && errorCode === 'EXPIRED_TOKEN') {
      logout(); //로그아웃 함수
    }

    return Promise.reject(error);
  }
);
export default API;