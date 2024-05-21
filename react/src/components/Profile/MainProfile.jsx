import React from 'react';
import '../../styles/Profile/MainProfile.scss';
import { Link } from 'react-router-dom';
import store from '../../store';
import defaultProfileImage from '../../assets/images/default-profile.png'; // 기본 이미지 경로

function MainProfile({ imgSrc, email }) {
	const { UserStore } = store();
	const profileImage = imgSrc || defaultProfileImage; // imgSrc가 없으면 기본 이미지 사용

	return (
		<div className="MainProfile">
			<Link to={`/user/${localStorage.getItem('id')}`}>
				<img src={profileImage} alt="Profile" />
			</Link>
			<h2>{UserStore.nickname}</h2>
			<span>{email}</span>
		</div>
	);
}

export default MainProfile;
