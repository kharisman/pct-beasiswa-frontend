// src/axios.js

// baseURL: 'http://127.0.0.1:8000/api/v1/', 

// baseURL: 'https://kolaborasi.palcomtech.ac.id/api/v1/', 
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1/', 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
});

// Add an interceptor to include the Authorization header with the token, if available
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default instance;
