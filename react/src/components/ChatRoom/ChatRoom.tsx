import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
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
} from '@chatscope/chat-ui-kit-react';
import { getChatRoomByPostId, getMessagesByRoomId, getMembersByRoomId, Members } from '../../service/ChatService';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

function ChatRoom() {
  const { postId } = useParams<{ postId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<Members[]>([]);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const [currentUser, setCurrentUser] = useState<Members | null>(null);

  const setupWebSocket = (roomId: string) => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    const socket = new SockJS('http://localhost:8005/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 10000,
      onConnect: () => {
        stompClient.subscribe(`/topic/chat/${roomId}`, (message: IMessage) => {
          const receivedMessage = JSON.parse(message.body);
          if (receivedMessage.senderId !== currentUser?.mno) {
            setMessages((prev) => [...prev, { ...receivedMessage, direction: 'incoming', position: 'normal' }]);
          }
        });

        stompClient.subscribe(`/topic/chat/${roomId}/members`, (message: IMessage) => {
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

  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        const { data: roomData } = await getChatRoomByPostId(postId!);
        if (roomData.chatRoomId) {
          setChatRoomId(roomData.chatRoomId);

          const { data: messagesData } = await getMessagesByRoomId(roomData.chatRoomId);
          setMessages(
            messagesData.map((msg: any) => ({
              ...msg,
              direction: msg.senderId === currentUser?.mno ? 'outgoing' : 'incoming',
              position: 'normal',
            }))
          );

          const { data: membersData } = await getMembersByRoomId(roomData.chatRoomId);
          setMembers(membersData);

          const token = localStorage.getItem('accessToken');
          if (token) {
            const decodedToken = jwtDecode<{ sub: string }>(token);
            const email = decodedToken.sub;
            const currentUser = membersData.find((member: Members) => member.email === email);
            if (currentUser) {
              setCurrentUser(currentUser);
            }
          }
          setupWebSocket(roomData.chatRoomId);
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
  }, [postId, currentUser?.mno]);

  useEffect(() => {
    if (chatRoomId) {
      setupWebSocket(chatRoomId);
    }
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [chatRoomId, currentUser?.mno]);

  const sendMessage = async (input: string) => {
    if (input.trim() && clientRef.current && clientRef.current.connected && chatRoomId && currentUser) {
      const token = localStorage.getItem('accessToken') || '';
      const messageData = { message: input, token };
      try {
        clientRef.current.publish({
          destination: `/app/chat/${chatRoomId}/send`,
          body: JSON.stringify(messageData),
        });
        setMessages((prev) => [...prev, { message: input, direction: 'outgoing', senderName: currentUser.name, position: 'normal' }]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="container">
      <MainContainer className="main-container">
        <Sidebar position="left" scrollable className="custom-sidebar">
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
                model={{
                  message: msg.message,
                  direction: msg.direction,
                  sender: msg.senderName,
                  position: 'normal',
                }}
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
