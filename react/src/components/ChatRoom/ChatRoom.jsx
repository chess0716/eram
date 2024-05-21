import React, { useEffect, useState, useRef } from 'react';
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
  ConversationList,
  Conversation,
} from '@chatscope/chat-ui-kit-react';
import { getChatRoomByPostId, getMessagesByRoomId, getMembersByRoomId } from '../../service/ChatService';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

function ChatRoom() {
  const { postId } = useParams();
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const clientRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  const setupWebSocket = (roomId) => {
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
          setMessages((prev) => [
            ...prev,
            {
              ...receivedMessage,
              direction: receivedMessage.senderId === currentUser?.mno ? 'outgoing' : 'incoming',
              position: 'normal',
            },
          ]);
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

  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        const { data: roomData } = await getChatRoomByPostId(postId);
        if (roomData.chatRoomId) {
          setChatRoomId(roomData.chatRoomId);

          const { data: membersData } = await getMembersByRoomId(roomData.chatRoomId);
          setMembers(membersData);

          const token = localStorage.getItem('accessToken');
          if (token) {
            const decodedToken = jwtDecode(token);
            const email = decodedToken.sub;
            const user = membersData.find((member) => member.email === email);
            if (user) {
              setCurrentUser(user);
            }
          }
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
    if (chatRoomId && currentUser) {
      const loadMessages = async () => {
        try {
          const { data: messagesData } = await getMessagesByRoomId(chatRoomId);
          setMessages(
            messagesData.map((msg) => ({
              ...msg,
              direction: msg.senderName === currentUser.name ? 'outgoing' : 'incoming',
              position: 'normal',
            }))
          );
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      loadMessages();
      setupWebSocket(chatRoomId);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [chatRoomId, currentUser]);

  const sendMessage = async (input) => {
    if (input.trim() && clientRef.current && clientRef.current.connected && chatRoomId && currentUser) {
      const token = localStorage.getItem('accessToken') || '';
      const messageData = { message: input, token, senderName: currentUser.name, senderId: currentUser.mno };
      try {
        clientRef.current.publish({
          destination: `/app/chat/${chatRoomId}/send`,
          body: JSON.stringify(messageData),
        });
        // 메시지를 직접 추가하지 않음
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
            {members.map((member) => (
              <Conversation key={member.mno} name={member.name}>
                {/* <Avatar name={member.name} /> */}
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
                  message: `${msg.senderName}: ${msg.message}`,
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
