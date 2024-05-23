import axios from 'axios';

const BASE_URL = 'http://localhost:8005'; // Spring Boot 서버의 포트

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 예시로 토큰을 로컬 스토리지에서 가져오는 경우
axiosInstance.interceptors.request.use((config) => {
  const modifiedConfig = { ...config }; // 매개변수를 복사하여 수정
  const token = localStorage.getItem('token');
  if (token) {
    modifiedConfig.headers.Authorization = `Bearer ${token}`; // 점 표기법 사용
  }
  return modifiedConfig;
}, (error) => Promise.reject(error)); // 화살표 함수에서 블록 문 제거

export const getPosts = () => axiosInstance.get('/posts/list');
export const getPostById = (id) => {
  if (!id) {
    throw new Error('ID is undefined');
  }
  return axiosInstance.get(`/posts/${id}`);
};
export const createPost = (postData) => axiosInstance.post('/posts/new', postData);
export const updatePost = (id, postData) => axiosInstance.put(`/posts/${id}`, postData);
export const deletePost = (id) => axiosInstance.delete(`/posts/${id}`);
