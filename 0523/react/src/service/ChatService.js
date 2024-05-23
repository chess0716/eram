import axios from 'axios';

const BASE_URL = 'http://localhost:8005'; // Spring Boot 서버의 포트

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getChatRoomByPostId = (postId) => {
  if (!postId) {
    throw new Error('Post ID is undefined');
  }
  return axiosInstance.get(`/chat/room/by-post/${postId}`);
};

export const createChatRoom = (postId) => {
  if (!postId) {
    throw new Error('Post ID is undefined');
  }
  return axiosInstance.post(`/chat/room`, { postId });
};

export const getMessagesByRoomId = (chatRoomId) => {
  if (!chatRoomId) {
    throw new Error('Chat Room ID is undefined');
  }
  return axiosInstance.get(`/chat/chatroom/${chatRoomId}/messages`);
};

export const sendMessageToRoom = (chatRoomId, message) => {
  if (!chatRoomId) {
    throw new Error('Chat Room ID is undefined');
  }
  return axiosInstance.post(`/chat/${chatRoomId}/send`, message);
};

export const getChatRoomMembers = (chatRoomId) => {
  if (!chatRoomId) {
    throw new Error('Chat Room ID is undefined');
  }
  return axiosInstance.get(`/chat/chatroom/${chatRoomId}/user`);
};
