import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import UserStore from '../../store';
import AuthService from './AuthService';
import defaultProfileImage from '../../assets/images/default-profile.png';
import postImage from '../../assets/images/post.png';
import chatImage from '../../assets/images/chat.png';
import ImgModal from '../ImgModal'; // 경로 수정
import '../../styles/Profile/MyPageProfile.scss'; 

function MyPageProfile({ userId }) {
	const [edit, setEdit] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [mouseEnter, setMouseEnter] = useState(false);

	const [otherUserProfile, setOtherUserProfile] = useState(defaultProfileImage);
	const [otherUserNickname, setOtherUserNickname] = useState('');
	const [otherUserIntro, setOtherUserIntro] = useState('');

	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserData = async () => {
			if (userId === UserStore.id) {
				setIsAdmin(true);
			} else {
				try {
					const accessToken = localStorage.getItem('accessToken');
					if (!accessToken) {
						throw new Error('No access token found');
					}
					const response = await fetch(`/members/${userId}`, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					});
					const contentType = response.headers.get('content-type');
					if (!response.ok || !contentType || !contentType.includes('application/json')) {
						throw new Error(`Failed to fetch user data, received: ${contentType}`);
					}
					const result = await response.json();
					setOtherUserProfile(result.data.profile || defaultProfileImage);
					setOtherUserNickname(result.data.nickname);
					setOtherUserIntro(result.data.intro);
				} catch (error) {
					console.error('Failed to fetch user data:', error);
				}
			}
		};

		fetchUserData();
	}, [userId]);

	const openModal = () => {
		setModalOpen(true);
	};
	const closeModal = () => {
		setModalOpen(false);
	};

	const handleNickname = (e) => {
		UserStore.setNickname(e.target.value);
	};

	const handleDescription = (e) => {
		UserStore.setDescription(e.target.value);
	};

	const toggleEdit = () => {
		setEdit((prevEdit) => !prevEdit);
	};

	const onMouseEnter = () => {
		setMouseEnter(true);
	};

	const onMouseLeave = () => {
		setMouseEnter(false);
	};

	const profileImage = UserStore.imgSrc || defaultProfileImage;

	const handleDeleteAccount = async () => {
		if (window.confirm('정말 탈퇴하시겠습니까?')) {
			try {
				await AuthService.deleteAccount();
				alert('계정이 성공적으로 삭제되었습니다.');
				navigate('/main');
			} catch (error) {
				console.error('Failed to delete account:', error);
				alert('계정 삭제에 실패했습니다.');
			}
		}
	};

	return (
		<div className="MyPageProfile__profile">
			<div className="MyPageProfile__container__left" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
				{isAdmin ? (
					<>
						<img src={profileImage} alt="profile" onClick={openModal} className="AdminProfile" />
						{mouseEnter && <FontAwesomeIcon icon={faPen} className="Profile__icon" />}
					</>
				) : (
					<img src={otherUserProfile} alt="profile" />
				)}
			</div>
			<ImgModal
				open={modalOpen}
				close={closeModal}
				imgSrc={UserStore.imgSrc}
				setImgSrc={UserStore.setImgSrc}
				nickname={UserStore.nickname}
				description={UserStore.description}
			/>
			<div className="MyPageProfile__container__right">
				<div className="description">
					<span>{UserStore.nickname || '닉네임'} 회원</span>
					{isAdmin ? (
						edit ? (
							<textarea
								onChange={handleDescription}
								placeholder={UserStore.description}
								value={UserStore.description}
							/>
						) : (
							<p>{UserStore.description}</p>
						)
					) : (
						<p>{otherUserIntro}</p>
					)}
					<div className="button-group">
						<button type="button">충전하기</button>
						<Link to={`/modify/${userId}`}>
							<button type="button">회원수정</button>
						</Link>
						<button type="button" onClick={handleDeleteAccount}>
							회원탈퇴
						</button>
					</div>
				</div>
			</div>
			<div className="MyPageProfile__container__right2">
				<div className="items">
					<img src={postImage} alt="mylist" className="iconImage" />
					<button type="button">게시글</button>
				</div>
			</div>
			<div className="MyPageProfile__container__right2">
				<div className="items">
					<img src={chatImage} alt="mychat" className="iconImage" />
					<button type="button">채팅방</button>
				</div>
			</div>
		</div>
	);
}

export default MyPageProfile;
