import axios from 'axios';
import { appConfig } from '@/utils/config.ts'

// Tạo một instance của axios
const httpClient = axios.create({
  baseURL: appConfig.remoteUrl, // Thay bằng URL API của bạn
  timeout: 10000, // Thời gian chờ tối đa (10 giây)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpClient;
