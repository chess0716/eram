import axios from 'axios';
import UserStore from '../../store/UserStore';

const API_URL = 'http://localhost:8089';

const AuthService = {
	login: async (data) => {
		try {
			const response = await axios.post(`${API_URL}/auth/login`, data);
			console.log('Response data:', response.data); // 응답 데이터 구조 확인
			if (response.data.token) {
				localStorage.setItem('accessToken', response.data.token);
				localStorage.setItem('user', JSON.stringify(response.data.user));

				// 로그인한 사용자 정보 UserStore에 저장
				if (response.data.user) {
					UserStore.setId(response.data.user.mno); // user 객체의 필드명을 확인하세요
					UserStore.setNickname(response.data.user.name); // user 객체의 필드명을 확인하세요
					UserStore.setEmail(response.data.user.email);
					UserStore.setDescription(response.data.user.description);
					UserStore.setImgSrc(response.data.user.profile);
				} else {
					console.error('User data is missing in the response');
				}
			} else {
				console.error('No access token received');
			}
			return response.data;
		} catch (error) {
			console.error('Error during login:', error.response ? error.response.data : error.message);
			throw new Error('Login failed');
		}
	},

	signup: async (data) => {
		try {
			const response = await axios.post(`${API_URL}/auth/join`, data);
			return response.data;
		} catch (error) {
			throw new Error('Signup failed');
		}
	},

	fetchUserData: async () => {
		try {
			const accessToken = localStorage.getItem('accessToken');
			const response = await axios.get(`${API_URL}/members/me`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new Error('Failed to fetch user data');
		}
	},

	updateProfile: async (data) => {
		try {
			const accessToken = localStorage.getItem('accessToken');
			const response = await axios.put(`${API_URL}/members/update`, data, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new Error('Profile update failed');
		}
	},

	logout: async () => {
		try {
			const accessToken = localStorage.getItem('accessToken');
			await axios.post(
				`${API_URL}/auth/logout`,
				{},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			localStorage.removeItem('accessToken');
			localStorage.removeItem('user');
			UserStore.reset(); // UserStore 리셋 (필요에 따라 구현)
		} catch (error) {
			console.error('Failed to logout:', error);
			throw error;
		}
	},

	deleteAccount: async () => {
		try {
			const accessToken = localStorage.getItem('accessToken');
			await axios.delete(`${API_URL}/members/me`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			localStorage.removeItem('accessToken');
			localStorage.removeItem('user');
			UserStore.reset(); // UserStore 리셋 (필요에 따라 구현)
		} catch (error) {
			console.error('Failed to delete account:', error);
			throw error;
		}
	},
};

export default AuthService;
