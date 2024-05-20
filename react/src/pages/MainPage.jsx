import React, { useEffect, useState } from 'react';
import MainProfile from '../components/Profile/MainProfile';
import Story from '../components/Story/Story';
import SideBar from '../components/SideBar';
import '../styles/Pages/MainPage.scss';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';

import store from '../store';
import { getPosts } from '../service/PostService'; // PostService에서 API 함수 import

function MainPage() {
	const { UserStore } = store();
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		async function fetchUserId() {
			await fetch(`https://elice-server.herokuapp.com/mypage/${localStorage.getItem('id')}`, {
				method: 'GET',
			})
				.then((res) => res.json())
				.then((result) => {
					UserStore.setNickname(result.data.nickname);
					UserStore.setEmail(result.data.id);
					if (result.data.profile !== null) {
						UserStore.setImgSrc(result.data.profile);
					}
				});
		}

		async function fetchPosts() {
			try {
				const response = await getPosts();
				setPosts(response.data.posts);
			} catch (error) {
				console.error('Failed to fetch posts:', error);
			}
		}

		fetchUserId();
		fetchPosts();
	}, [UserStore]);

	return (
		<div className="main_cpn">
			<Story />
			<div className="Mainpage__rightContainer">
				<MainProfile />
				<SearchBar />
				<SideBar />
				<ul>
					{posts.map(post => (
						<li key={post.id}>
							<Link to={`/posts/${post.id}`}>{post.title}</Link> - 작성일: {post.createdAt}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export default MainPage;
