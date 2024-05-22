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
  return axiosInstance.post(`/chat/room/create`, { postId });
};

export const getMessagesByRoomId = (chatRoomId) => {
  if (!chatRoomId) {
    throw new Error('Chat Room ID is undefined');
  }
  return axiosInstance.get(`/chat/messages/${chatRoomId}`);
};

export const sendMessageToRoom = (chatRoomId, message) => {
  if (!chatRoomId) {
    throw new Error('Chat Room ID is undefined');
  }
  return axiosInstance.post(`/chat/${chatRoomId}/send`, message);
};

export const getChatRoomMembers = (chatRoomId) => { // 함수명 변경
  if (!chatRoomId) {
    throw new Error('Chat Room ID is undefined');
  }
  return axiosInstance.get(`/chatroom/${chatRoomId}/user`); // URL 수정
};
