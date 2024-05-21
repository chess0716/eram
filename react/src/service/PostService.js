import axios from 'axios';

const BASE_URL = 'http://localhost:8005'; // Spring Boot 서버의 포트

export const getPosts = () => axios.get(`${BASE_URL}/posts`);

export const getPostById = (id) => {
  if (!id) {
    throw new Error('ID is undefined');
  }
  return axios.get(`${BASE_URL}/posts/${id}`);
};

export const createPost = (postData) => axios.post(`${BASE_URL}/posts`, postData);

export const updatePost = (id, postData) => axios.put(`${BASE_URL}/posts/${id}`, postData);

export const deletePost = (id) => axios.delete(`${BASE_URL}/posts/${id}`);
