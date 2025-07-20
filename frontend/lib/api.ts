import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export default api; 


export const getCurrentUserOptions = () => ({
  queryKey: ['currentUser'],
  queryFn: async () => {
    const res = await axios.get('http://localhost:3000/api/users/me', { withCredentials: true });
    // FastAPI response: session cookie will be sent if present
    return res.data;
  },
});