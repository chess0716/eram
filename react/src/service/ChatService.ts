import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8005'; // Backend server URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface ChatRoomResponse {
  chatRoomId: string;
  postId: number;
}

interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  message: string;
  timestamp: string;
  token?: string;
}

interface Members {
  mno: number;
  id: string;
  name: string;
  email: string;
}

export const getChatRoomByPostId = (postId: string): Promise<AxiosResponse<ChatRoomResponse>> => {
  return axiosInstance.get<ChatRoomResponse>(`/chat/room/by-post/${postId}`);
};

export const getMessagesByRoomId = (chatRoomId: string): Promise<AxiosResponse<ChatMessage[]>> => {
  return axiosInstance.get<ChatMessage[]>(`/chat/messages/${chatRoomId}`);
};

export const sendMessageToRoom = (chatRoomId: string, message: { message: string, token: string }): Promise<AxiosResponse<ChatMessage>> => {
  return axiosInstance.post<ChatMessage>(`/chat/${chatRoomId}/send`, message);
};

export const getMembersByRoomId = (chatRoomId: string): Promise<AxiosResponse<Members[]>> => {
  return axiosInstance.get<Members[]>(`/chat/chatroom/${chatRoomId}/user`);
};
