import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Story/MyStory.scss';
import UserService from '../../service/UserService'; // UserService를 임포트

function MyChat() {
    const [chatRooms, setChatRooms] = useState([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const userData = await UserService.getCurrentUser();
                const chatRoomsData = await UserService.getCurrentUserChatRooms();
                console.log('Fetched chat rooms:', chatRoomsData);
                if (chatRoomsData) {
                    setChatRooms(chatRoomsData);
                }
            } catch (error) {
                console.error('Failed to fetch chat rooms:', error);
            }
        };

        fetchChatRooms();
    }, []);

    return (
        <section className="Mystory_container">
            <StoryInfo />
            <Storys chatRooms={chatRooms} />
        </section>
    );
}

function Storys({ chatRooms }) {
    return chatRooms.map((room) => (
        <div className="MyStory" key={room.id}>
            <span className="story_number story_child">{room.id}</span>
            <span className="story_name story_child">{room.postUserName || 'Unknown'}</span> {/* 작성자 이름 */}
            <Link to={`/Chat/${room.id}`}>
                <span className="story_title story_child">
                    {room.name}
                </span>
            </Link>
            <span className="story_time story_child">{room.postTitle || 'Unknown'}</span> {/* 게시글 제목 */}
        </div>
    ));
}

function StoryInfo() {
    return (
        <div className="story storyInfo">
            <span className="story_number story_child">번호</span>
            <span className="story_title story_child">채팅방 제목</span>
            <span className="story_name story_child">작성자</span>
            <span className="story_time story_child">게시글 제목</span>
        </div>
    );
}

export default MyChat;
