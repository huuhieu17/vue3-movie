import axios from 'axios';

// Tạo một instance của axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Thay bằng URL API của bạn
  timeout: 10000, // Thời gian chờ tối đa (10 giây)
  headers: {
    'Content-Type': 'application/json',
  },
});
