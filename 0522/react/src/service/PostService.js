import axios from 'axios';

const BASE_URL = 'http://localhost:8005'; // Spring Boot 서버의 포트

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
