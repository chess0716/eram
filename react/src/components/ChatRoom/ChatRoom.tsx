import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import jwtDecode from 'jwt-decode';
import {
	MainContainer,
	ChatContainer,
	MessageList,
	Message,
	MessageInput,
	Sidebar,
	ConversationHeader,
	Avatar,
	ConversationList,
	Conversation,
	MessageModel,
} from '@chatscope/chat-ui-kit-react';
import { getChatRoomByPostId, getMessagesByRoomId, getMembersByRoomId } from '../../service/ChatService';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

interface Members {
	mno: number;
	id: string;
	name: string;
	email: string;
}

function ChatRoom() {
	const [messages, setMessages] = useState<any[]>([]);
	const [members, setMembers] = useState<Members[]>([]);
	const { postId } = useParams<{ postId: string }>();
	const [chatRoomId, setChatRoomId] = useState<string | null>(null);
	const clientRef = useRef<Client | null>(null);
	const [currentUser, setCurrentUser] = useState<Members | null>(null);

	useEffect(() => {
		const loadChatRoom = async () => {
			try {
				const roomResponse = await getChatRoomByPostId(postId!);
				const data = roomResponse.data;
				if (data.chatRoomId) {
					setChatRoomId(data.chatRoomId);
					const messagesResponse = await getMessagesByRoomId(data.chatRoomId);
					setMessages(
						messagesResponse.data.map((msg: any) => ({
							...msg,
							direction: msg.senderId === currentUser?.mno ? 'outgoing' : 'incoming',
						}))
					);
					const membersResponse = await getMembersByRoomId(data.chatRoomId);
					setMembers(membersResponse.data);
					const token = localStorage.getItem('accessToken');
					if (token) {
						const decodedToken = jwtDecode<{ sub: string }>(token);
						const email = decodedToken.sub;
						const currentUser = membersResponse.data.find((member) => member.email === email);
						if (currentUser) {
							setCurrentUser(currentUser);
						}
					}
					setupWebSocket(data.chatRoomId);
				} else {
					console.error('Chat room not found for the provided post ID');
				}
			} catch (error) {
				console.error('Error fetching chat room:', error);
			}
		};

		loadChatRoom();

		return () => {
			if (clientRef.current) {
				clientRef.current.deactivate();
			}
		};
	}, [postId]);

	useEffect(() => {
		if (chatRoomId) {
			setupWebSocket(chatRoomId);
		}
		return () => {
			if (clientRef.current) {
				clientRef.current.deactivate();
			}
		};
	}, [chatRoomId]);

	const setupWebSocket = (roomId: string) => {
		if (clientRef.current) {
			clientRef.current.deactivate();
		}

		const socket = new SockJS('http://localhost:8005/ws');
		const stompClient = new Client({
			webSocketFactory: () => socket,
			reconnectDelay: 10000,
			onConnect: () => {
				stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
					const receivedMessage = JSON.parse(message.body);
					setMessages((prev) => [...prev, { ...receivedMessage, direction: 'incoming' }]);
				});

				stompClient.subscribe(`/topic/chat/${roomId}/members`, (message) => {
					const updatedMembers = JSON.parse(message.body);
					setMembers(updatedMembers);
				});

				const token = localStorage.getItem('accessToken');
				if (token) {
					stompClient.publish({
						destination: `/app/chat/${roomId}/join`,
						body: JSON.stringify({ token }),
					});
				}
			},
		});

		stompClient.activate();
		clientRef.current = stompClient;
	};

	const sendMessage = async (input: string) => {
		if (input.trim() && clientRef.current && clientRef.current.connected && chatRoomId && currentUser) {
			const token = localStorage.getItem('accessToken') || '';
			const messageData = { message: input, token };
			try {
				clientRef.current.publish({
					destination: `/app/chat/${chatRoomId}/send`,
					body: JSON.stringify(messageData),
				});
				setMessages((prev) => [...prev, { message: input, direction: 'outgoing', senderName: currentUser.name }]);
			} catch (error) {
				console.error('Error sending message:', error);
			}
		}
	};

	return (
		<div className="container">
			<MainContainer className="main-container">
				<Sidebar position="left" scrollable={true} className="custom-sidebar">
					<ConversationList>
						<ConversationHeader>
							<ConversationHeader.Content userName="User list" />
						</ConversationHeader>
						{members.map((member) => (
							<Conversation key={member.mno} name={member.name}>
								<Avatar name={member.name} />
							</Conversation>
						))}
					</ConversationList>
				</Sidebar>
				<ChatContainer className="custom-chat-container">
					<MessageList>
						{messages.map((msg, index) => (
							<Message
								key={index}
								model={
									{
										message: msg.message,
										direction: msg.direction,
										sender: msg.senderName,
									} as MessageModel
								}
							/>
						))}
					</MessageList>
					<MessageInput placeholder="Type message here" onSend={sendMessage} />
				</ChatContainer>
			</MainContainer>
		</div>
	);
}

export default ChatRoom;
