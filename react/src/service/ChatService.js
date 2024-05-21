import axios from 'axios';

const BASE_URL = 'http://localhost:8005'; // Backend server URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getChatRoomByPostId = (postId) => 
  axiosInstance.get(`/chat/room/by-post/${postId}`);

export const getMessagesByRoomId = (chatRoomId) => 
  axiosInstance.get(`/chat/messages/${chatRoomId}`);

export const sendMessageToRoom = (chatRoomId, message) => 
  axiosInstance.post(`/chat/${chatRoomId}/send`, message);

export const getMembersByRoomId = (chatRoomId) => 
  axiosInstance.get(`/chat/chatroom/${chatRoomId}/user`);
