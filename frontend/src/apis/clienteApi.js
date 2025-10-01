import axios from 'axios';

const clienteApi = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default clienteApi;
