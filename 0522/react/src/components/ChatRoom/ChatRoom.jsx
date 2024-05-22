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
import { getChatRoomByPostId, getMessagesByRoomId, getChatRoomMembers } from '../../service/ChatService';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

function ChatRoom() {
  const { postId } = useParams();
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const clientRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log('roomData:', roomData);
        if (roomData.chatRoomId) {
          setChatRoomId(roomData.chatRoomId);

          const { data: membersData } = await getChatRoomMembers(roomData.chatRoomId);
          console.log('membersData:', membersData);
          setMembers(membersData);

          const token = localStorage.getItem('accessToken');
          if (token && membersData) {
            const decodedToken = jwtDecode(token);
            const email = decodedToken.sub;
            const user = membersData.find((member) => member.email === email);
            if (user) {
              setCurrentUser(user);
            } else {
              setError('User not found in chat room members');
            }
          }
        } else {
          console.error('Chat room not found for the provided post ID');
          setError('Chat room not found for the provided post ID');
        }
      } catch (error) {
        console.error('Error fetching chat room:', error);
        setError('Error fetching chat room');
      } finally {
        setLoading(false);
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
          console.log('messagesData:', messagesData);
          setMessages(
            messagesData.map((msg) => ({
              ...msg,
              direction: msg.senderName === currentUser.name ? 'outgoing' : 'incoming',
              position: 'normal',
            }))
          );
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError('Error fetching messages');
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
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!chatRoomId || !currentUser) {
    return <div>Chat room or user not found</div>;
  }

  return (
    <div className="container">
      <MainContainer className="main-container">
        <Sidebar position="left" scrollable className="custom-sidebar">
          <ConversationList>
            {members && members.length > 0 ? (
              members.map((member, index) => (
                <Conversation key={index} name={member}>
                  {/* <Avatar name={member.name} /> */}
                </Conversation>
              ))
            ) : (
              <div>No members found</div>
            )}
          </ConversationList>
        </Sidebar>
        <ChatContainer className="custom-chat-container">
          <MessageList>
            {messages && messages.length > 0 ? (
              messages.map((msg, index) => (
                <Message
                  key={index}
                  model={{
                    message: `${msg.senderName}: ${msg.message}`,
                    direction: msg.direction,
                    sender: msg.senderName,
                    position: 'normal',
                  }}
                />
              ))
            ) : (
              <div>No messages found</div>
            )}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={sendMessage} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default ChatRoom;
