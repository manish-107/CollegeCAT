import axios from 'axios';

const api = axios.create({
  baseURL: 'https://b271-103-89-235-71.ngrok-free.app/api/',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export default api; 