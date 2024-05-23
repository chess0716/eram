import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import * as DOMPurify from 'dompurify';
import '../styles/Pages/Writing.scss';
import { getPostById, updatePost } from '../service/PostService';
import { formats, modules } from '../constants/editor';

export default function WritiePut() {
	return <WriteContent />;
}

function WriteContent() {
	const { id: writingParam } = useParams(); // board/숫자 값에 넣을 id 값
	const navigate = useNavigate();
	const titleRef = useRef(null);
	const quillRef = useRef(null); // Quill 에디터의 참조를 설정
	const endDateRef = useRef(null);
	const [titleText, setTitleText] = useState(''); // 기존에 있던 글 제목
	const [content, setContent] = useState(''); // 기존에 있던 글 내용
	const [endDate, setEndDate] = useState(''); // 기존에 있던 끝나는 날짜

	useEffect(() => {
		console.log('포스트 아이디: ', writingParam);

		getPostById(writingParam)
			.then((data) => {
				console.log('포스트 데이터(수정 할): ', data);
				const el = data.data;
				setTitleText(el.title || '');
				setContent(el.content || '');
				setEndDate(el.endDate || ''); // 끝나는 날짜 초기화

				// Quill 에디터의 내용을 업데이트
				if (quillRef.current) {
					const quill = quillRef.current.getEditor();
					quill.clipboard.dangerouslyPasteHTML(DOMPurify.sanitize(el.content || ''));
				}
			})
			.catch((error) => console.error('Error fetching post:', error));
	}, [writingParam]);

	function storyPut(e) {
		// 글 작성 게시 버튼 누르면 동작
		e.preventDefault();
		if (endDateRef.current.value === '') {
			alert('끝나는 날짜를 선택해주세요.');
			return;
		}
		if (titleRef.current.value.length === 0) {
			alert('제목을 입력해주세요.');
			return;
		}
		if (content.length === 0) {
			alert('내용을 입력해주세요.');
			return;
		}

		// content 길이 확인 (65535 바이트 이하로 제한)
		if (new Blob([content]).size > 65535) {
			alert('내용이 너무 깁니다. 내용을 줄여주세요.');
			return;
		}

		const postData = {
			title: titleRef.current.value,
			content,
			endDate: endDateRef.current.value,
		};
		console.log('수정 데이터', postData);

		updatePost(writingParam, postData)
			.then((res) => {
				console.log('상태: ', res.status);
				navigate(`/Read/${writingParam}`);
			})
			.catch((error) => {
				console.error('게시글 수정 실패:', error);
				alert('게시글 수정에 실패했습니다.');
			});
	}

	return (
		<section className="write_container">
			<form className="editor-container">
				&nbsp;&nbsp;&nbsp; 끝나는 날짜 &nbsp;
				<input
					type="date"
					name="endDate"
					ref={endDateRef}
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
				/>
				{/* <input
					type="text"
					name="numberOfUsers"
					className="userNumber"
					placeholder="방 인원(숫자만)"
					value={numberOfUsers}
					onChange={handleNumberOfUsersChange}
				/> */}
				<input
					type="text"
					placeholder="제목을 입력하세요"
					className="write_title write_style"
					onChange={(e) => setTitleText(e.target.value)}
					ref={titleRef}
					value={titleText}
				/>
				<div>
					<ReactQuill
						style={{ width: '830px', height: '500px' }}
						modules={modules}
						formats={formats}
						value={content}
						ref={quillRef}
						onChange={(value) => setContent(value)}
						placeholder="내용을 입력해주세요."
					/>
				</div>
			</form>
			<input type="submit" className="write_post" value="게시" onClick={storyPut} />
		</section>
	);
}
