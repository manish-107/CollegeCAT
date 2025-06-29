import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export default api; 