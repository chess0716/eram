"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembersByRoomId = exports.sendMessageToRoom = exports.getMessagesByRoomId = exports.getChatRoomByPostId = void 0;
var axios_1 = __importDefault(require("axios"));
var BASE_URL = 'http://localhost:8005'; // Backend server URL
var axiosInstance = axios_1.default.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
var getChatRoomByPostId = function (postId) {
    return axiosInstance.get("/chat/room/by-post/".concat(postId));
};
exports.getChatRoomByPostId = getChatRoomByPostId;
var getMessagesByRoomId = function (chatRoomId) {
    return axiosInstance.get("/chat/messages/".concat(chatRoomId));
};
exports.getMessagesByRoomId = getMessagesByRoomId;
var sendMessageToRoom = function (chatRoomId, message) {
    return axiosInstance.post("/chat/".concat(chatRoomId, "/send"), message);
};
exports.sendMessageToRoom = sendMessageToRoom;
var getMembersByRoomId = function (chatRoomId) {
    return axiosInstance.get("/chat/chatroom/".concat(chatRoomId, "/user"));
};
exports.getMembersByRoomId = getMembersByRoomId;
