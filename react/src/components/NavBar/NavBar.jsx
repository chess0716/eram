import React, { useEffect, useState } from 'react';
import '../../styles/NavBar/NavBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faRightFromBracket, faRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import store from '../../store';
import defaultImage from '../../assets/images/default-profile.png';
import AuthService from '../Profile/AuthService';

function NavBar() {
	const { UserStore } = store();
	const [showMenu, setShowMenu] = useState(false);
	const navigate = useNavigate(); // useNavigate 훅 사용

	const toggleMenu = () => {
		setShowMenu((prevShowMenu) => !prevShowMenu);
	};

	useEffect(() => {
		const userId = localStorage.getItem('id');
		if (userId) {
			(async function fetchUserId() {
				const accessToken = localStorage.getItem('accessToken');
				if (!accessToken) {
					return;
				}
				const response = await fetch(`http://localhost:8089/members/${userId}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				const result = await response.json();
				UserStore.setId(result.data.id);
				UserStore.setNickname(result.data.nickname);
				UserStore.setEmail(result.data.email);
				UserStore.setDescription(result.data.description);
				if (result.data.profile !== null) {
					UserStore.setImgSrc(result.data.profile);
				}
			})();
		}
	}, []);

	const handleLogout = async () => {
		try {
			await AuthService.logout(); // 로그아웃 처리
			setShowMenu(false); // 로그아웃 시 메뉴를 숨깁니다.
			navigate('/main'); // 메인 페이지로 이동
		} catch (error) {
			console.error('Failed to logout:', error);
		}
	};

	return (
		<>
			<nav className="navBar navBar1">
				<div className="navLogo">
					<Link to="/posts" style={{ textDecoration: 'none' }}>
						ERaM
					</Link>
				</div>
				<ul className="navItems">
					<li className="navItem">
						<Link to="/auth/login" style={{ textDecoration: 'none' }}>
							<FontAwesomeIcon icon={faRightToBracket} className="menu__icon" />
							로그인
						</Link>
					</li>
					<li className="navItem">
						<Link to="/auth/join" style={{ textDecoration: 'none' }}>
							<FontAwesomeIcon icon={faUserPlus} className="menu__icon" />
							회원가입
						</Link>
					</li>
					<li className="navItem__menu-container">
						<img
							src={UserStore.imgSrc || defaultImage} // defaultImage를 사용하여 기본 프로필 이미지 설정
							alt="profile"
							onClick={toggleMenu}
							aria-hidden="true"
							className="navItem__trigger"
						/>
						{showMenu && (
							<nav className="menu">
								<div className="menu__square" />
								<div className="menu__lists">
									<li className="menu__mypage">
										<FontAwesomeIcon icon={faCircleUser} className="menu__icon" />
										<Link to={`/user/${UserStore.nickname}`} style={{ textDecoration: 'none' }}>
											마이 페이지
										</Link>
									</li>
									<li>
										<FontAwesomeIcon icon={faRightFromBracket} className="menu__icon" />
										<a href="/main" onClick={handleLogout} style={{ textDecoration: 'none' }}>
											로그아웃
										</a>
									</li>
								</div>
							</nav>
						)}
					</li>
				</ul>
			</nav>
			<Outlet />
		</>
	);
}

export default NavBar;
