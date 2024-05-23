import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import { getPosts } from '../../service/PostService';
import '../../styles/Story/Story.scss';

function Story({ searchKeyword, searchWritings, setSearchWritings, pageNum }) {
	return (
		<StoryContent
			searchKeyword={searchKeyword}
			searchWritings={searchWritings}
			setSearchWritings={setSearchWritings}
			pageNum={pageNum}
		/>
	);
}

function StoryContent({ searchKeyword, searchWritings, setSearchWritings, pageNum }) {
	const [board, setBoard] = useState([]);
	const [currentPage, setCurrentPage] = useState(parseInt(pageNum, 10) || 1);
	const [postsPerPage] = useState(10);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await getPosts();
				setBoard(response.data);
			} catch (error) {
				console.error('Error fetching posts:', error);
			}
		};

		fetchPosts();
	}, []);

	useEffect(() => {
		if (pageNum) {
			setCurrentPage(parseInt(pageNum, 10));
		}
	}, [pageNum]);

	// Calculate the current posts
	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPosts = board.slice(indexOfFirstPost, indexOfLastPost);

	const totalPages = Math.ceil(board.length / postsPerPage);
	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

	const handleClick = (event) => {
		const pageNumber = parseInt(event.target.id, 10);
		setCurrentPage(pageNumber);
		navigate(`/posts/page/${pageNumber}`);
	};

	const renderPageNumbers = pageNumbers.map((number) => (
		<button key={number} id={number} onClick={handleClick} className="pageNav_btn" type="button">
			{number}
		</button>
	));

	return searchWritings === undefined ? (
		<section className="story_parent">
			<div className="story_container">
				<div className="story_length">
					<span>{board.length}개의 게시글</span>
					<FontAwesomeIcon icon={faArrowRotateRight} className="refresh__icon" onClick={() => setCurrentPage(1)} />
				</div>
				<StoryInfo />

				{currentPosts.map((el) => (
					<div className="story" key={el.id}>
						<span className="story_number story_child">{el.id}</span>
						<span className="story_name story_child">{el.name ? el.name : 'Unknown User'}</span>
						<Link to={`/posts/${el.id}`}>
							<span className="story_title story_child">
								{el.title.length < 25 ? el.title : `${el.title.slice(0, 25)}...`}
							</span>
						</Link>
						<span className="story_time story_child">{el.regdate ? el.regdate.slice(0, 10) : 'Unknown Date'}</span>
					</div>
				))}
			</div>
			<Link className="writeBtn" to="/Writing">
				글쓰기
			</Link>
			<div className="pageNav">
				&lt;
				{renderPageNumbers}
				&gt;
			</div>
		</section>
	) : (
		<section className="story_parent">
			<div className="story_container">
				<div className="story_length">
					<span>
						&apos;{searchKeyword}&apos; - {searchWritings.length}개의 게시글
					</span>
					<FontAwesomeIcon icon={faArrowRotateRight} className="refresh__icon" onClick={() => setCurrentPage(1)} />
				</div>
				<StoryInfo />
				{searchWritings.map((el) => (
					<div className="story" key={el.id}>
						<span className="story_number story_child">{el.id}</span>
						<span className="story_name story_child">{el.user ? el.user.id : 'Unknown User'}</span>
						<Link to={`/posts/${el.id}`}>
							<span className="story_title story_child">{el.title}</span>
						</Link>
						<span className="story_time story_child">{el.createdAt ? el.createdAt.slice(0, 10) : 'Unknown Date'}</span>
					</div>
				))}
			</div>
			<Link className="writeBtn" to="/Writing">
				글쓰기
			</Link>
		</section>
	);
}

function StoryInfo() {
	return (
		<div className="story storyInfo">
			<span className="story_number story_child">번호</span>
			<span className="story_title story_child">제목</span>
			<span className="story_name story_child">작성자</span>
			<span className="story_time story_child">작성일</span>
		</div>
	);
}

export default StoryContent;
