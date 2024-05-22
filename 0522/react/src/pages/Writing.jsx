import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pages/Writing.scss';
import ReactQuill from 'react-quill';
import store from '../store';
import { modules, formats } from '../constants/editor';
import { createPost } from '../service/PostService';

export default function Writing() {
	return <WriteContent />;
}

function WriteContent() {
	const { UserStore } = store();
	const navigate = useNavigate();
	const titleRef = useRef(null);
	const [content, setContent] = useState('');
	const endDateRef = useRef(null);
	const [numberOfUsers, setNumberOfUsers] = useState('');
	const [user, setUser] = useState(null);
	const { nickname: nickName } = UserStore; // 이미 구조 분해 할당이 사용됨

	const today = new Date();
	const { year, month, day } = {
		year: today.getFullYear(),
		month: today.getMonth() + 1,
		day: today.getDate(),
	};

	const formattedMonth = month < 10 ? `0${month}` : month;
	const formattedDay = day < 10 ? `0${day}` : day;
	const time = `${year}-${formattedMonth}-${formattedDay}`;

	// 페이지 로드 시 로그인한 사용자 정보를 불러옵니다.
	useEffect(() => {
		const fetchUser = () => {
			try {
				const userJson = localStorage.getItem('user');
				const currentUser = userJson ? JSON.parse(userJson) : null;
				console.log('로그인유저: ', currentUser);
				setUser(currentUser);
			} catch (error) {
				console.error('Failed to load user info:', error);
			}
		};

		fetchUser();
	}, []);

	function handleNumberOfUsersChange(e) {
		const num = e.target.value;
		if (num === '' || /^\d+$/.test(num)) {
			setNumberOfUsers(num);
		}
	}

	function storySubmit(e) {
		if (!user) {
			alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 다시 로그인 해주세요.');
			return;
		}
		e.preventDefault();
		if (titleRef.current.value.length === 0) {
			alert('제목을 입력해주세요.');
			return;
		}
		if (content.length === 0) {
			alert('내용을 입력해주세요.');
			return;
		}
		if (numberOfUsers === '') {
			alert('방 인원을 입력해주세요.');
			return;
		}

		const { mno } = user;

		const postData = {
			mno,
			title: titleRef.current.value,
			content,
			endDate: endDateRef.current.value,
			numberOfUsers: parseInt(numberOfUsers, 10),
			viewCount: 0,
		};
		console.log('전송할데이터', postData);

		createPost(postData)
			.then((response) => {
				navigate('/posts/list');
				// navigate(`/page=1/Read=${response.data.data.post_idx}`);
			})
			.catch((error) => {
				console.error('게시글 등록 실패:', error);
				alert('게시글 등록에 실패했습니다.');
			});
	}

	return (
		<section className="write_container">
			<form className="editor-container">
				&nbsp;&nbsp;&nbsp; 끝나는 날짜 &nbsp; <input type="date" name="endDate" ref={endDateRef} />
				<input
					type="text"
					name="numberOfUsers"
					className="userNumber"
					placeholder="방 인원(숫자만)"
					value={numberOfUsers}
					onChange={handleNumberOfUsersChange}
				/>
				<input type="text" placeholder="제목을 입력하세요" className="write_title write_style" ref={titleRef} />
				<div />
				<div>
					<ReactQuill
						style={{ width: '830px', height: '400px' }}
						modules={modules}
						formats={formats}
						value={content}
						onChange={setContent}
						placeholder="내용을 입력해주세요."
					/>
				</div>
			</form>
			<input type="submit" className="write_post" value="글 등록" onClick={storySubmit} />
		</section>
	);
}
