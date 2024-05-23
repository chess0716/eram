import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import ImgModal from '../ImgModal';
import UserStore from '../../store/UserStore';
import AuthService from '../../service/AuthService';
import defaultProfileImage from '../../assets/images/default-profile.png';
import postImage from '../../assets/images/post.png';
import chatImage from '../../assets/images/chat.png';
import '../../styles/Profile/MyPageProfile.scss';

const MyPageProfile = observer(({ onComponentChange }) => {
	const [edit, setEdit] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [mouseEnter, setMouseEnter] = useState(false);

	const navigate = useNavigate();
	const userId = UserStore.id; // UserStore에서 id 값을 가져옵니다.

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				if (userId === UserStore.id) {
					setIsAdmin(true);
				} else {
					const accessToken = localStorage.getItem('accessToken');
					if (!accessToken) {
						throw new Error('No access token found');
					}
					const response = await fetch(`/members/get/${userId}`, {
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
					UserStore.setName(result.data.name);
					UserStore.setDescription(result.data.intro);
				}
			} catch (error) {
				console.error('Failed to fetch user data:', error);
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

	const handleName = (e) => {
		UserStore.setName(e.target.value);
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

	const handleButtonClick = (component) => {
		console.log(`Button clicked: ${component}`);
		if (typeof onComponentChange === 'function') {
			onComponentChange(component);
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
					<img src={UserStore.imgSrc || defaultProfileImage} alt="profile" />
				)}
			</div>
			<ImgModal
				open={modalOpen}
				close={closeModal}
				imgSrc={UserStore.imgSrc}
				setImgSrc={UserStore.setImgSrc}
				name={UserStore.name}
				description={UserStore.description}
			/>
			<div className="MyPageProfile__container__right">
				<div className="description">
					<span>{UserStore.name || '닉네임'} 님</span>
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
						<p>{UserStore.description}</p>
					)}
					<div className="button-group">
						<button type="button" onClick={() => handleButtonClick('Credit')}>
							충전하기
						</button>
						<Link to={`/modify/${UserStore.id}`}>
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
					<button type="button" onClick={() => handleButtonClick('MyStory')}>
						게시글
					</button>
				</div>
			</div>
			<div className="MyPageProfile__container__right2">
				<div className="items">
					<img src={chatImage} alt="mychat" className="iconImage" />
					<button type="button" onClick={() => handleButtonClick('MyChat')}>
						채팅방
					</button>
				</div>
			</div>
		</div>
	);
});

export default MyPageProfile;
