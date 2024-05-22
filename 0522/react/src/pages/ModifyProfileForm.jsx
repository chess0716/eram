import React, { useState, useEffect } from 'react';
import AuthService from 'components/Profile/AuthService';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import UserStore from 'store/UserStore';

const ModifyProfileFormBlock = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f0f0f0;
`;

const FormContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 20px;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
	text-align: center;
	font-size: 25px;
`;

const ButtonGroup = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
	gap: 20px; /* 버튼 사이 간격을 늘리기 위해 추가 */
`;

function ModifyProfileForm() {
	const [id, setId] = useState(0);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [mobile, setMobile] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const navigate = useNavigate();

	const fetchUserData = async () => {
		try {
			setLoading(true);
			const userData = await AuthService.fetchUserData();
			setId(userData.mno);
			setName(userData.name);
			setEmail(userData.email);
			setMobile(userData.mobile);
			UserStore.setId(userData.mno);
			UserStore.setNickname(userData.name);
			UserStore.setEmail(userData.email);
			UserStore.setDescription(userData.intro);
			UserStore.setMobile(userData.mobile);
			setLoading(false);
		} catch (error) {
			console.error('Failed to fetch user data:', error);
			setError('Failed to fetch user data');
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const handleProfileUpdate = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			await AuthService.updateProfile({
				mno: id,
				name,
				password: newPassword,
				mobile,
			});
			// Update UserStore immediately
			UserStore.setNickname(name);
			UserStore.setMobile(mobile);
			if (newPassword) {
				UserStore.setPassword(newPassword);
			}
			console.log('Profile updated successfully');
			navigate(`/user/${id}`); // Navigate to the user's page
		} catch (error) {
			console.error('Profile update failed:', error);
			setError('Profile update failed');
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate('/main');
	};

	return (
		<ModifyProfileFormBlock>
			<FormContainer>
				<Title>회원 정보 수정</Title>
				<form onSubmit={handleProfileUpdate}>
					<input type="number" placeholder="Id" value={id} readOnly />
					<input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
					<input type="email" placeholder="Email" value={email} readOnly />
					<input
						type="password"
						placeholder="New Password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
					/>
					<input type="text" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
					<ButtonGroup>
						<button type="submit" disabled={loading}>
							Update Profile
						</button>
						<button type="button" onClick={handleCancel}>
							Cancel
						</button>
					</ButtonGroup>
					{error && <p>{error}</p>}
				</form>
			</FormContainer>
		</ModifyProfileFormBlock>
	);
}

export default ModifyProfileForm;
