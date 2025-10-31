import axios from 'axios';

const API_URL = 'http://localhost:5050'; 

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

export default api;
