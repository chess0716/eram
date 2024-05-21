import React, { useEffect, useState } from 'react';
import '../../styles/NavBar/NavBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet, useLocation } from 'react-router-dom';

import store from '../../store';
import AuthService from '../Profile/AuthService';

function NavBar2() {
	const { UserStore } = store();
	const location = useLocation();
	const [showMenu, setShowMenu] = useState(false);
	const [refresh, setRefresh] = useState(false);

	const toggleMenu = () => {
		setShowMenu((prevShowMenu) => !prevShowMenu);
	};

	const handleLogout = async () => {
		try {
			await AuthService.logout(); // 로그아웃 처리
			setShowMenu(false); // 로그아웃 시 메뉴를 숨깁니다.
		} catch (error) {
			console.error('Failed to logout:', error);
		}
	};

	useEffect(() => {
		(async () => {
			const userId = localStorage.getItem('id');
			if (userId) {
				await fetch(`https://elice-server.herokuapp.com/mypage/${userId}`, {
					method: 'GET',
				})
					.then((res) => res.json())
					.then((result) => {
						UserStore.setNickname(result.data.nickname);
						UserStore.setEmail(result.data.id);
						UserStore.setDescription(result.data.intro);
						if (result.data.profile !== null) {
							UserStore.setImgSrc(result.data.profile);
						}
					});
			}
		})();
	}, []);

	useEffect(() => {
		if (location.pathname.includes('user')) {
			setRefresh(true);
		} else {
			setRefresh(false);
		}
	}, [location]);

	return (
		<>
			<nav className="navBar navBar2">
				<div className="navLogo">
					<Link to="/posts" style={{ textDecoration: 'none' }}>
						ERaM
					</Link>
				</div>
				<ul className="navItems">
					<li className="navItem">
						<div className="navItem__menu-container">
							<img
								src={UserStore.imgSrc}
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
											{refresh ? (
												<a href={`/circuit/user/${localStorage.getItem('id')}`} style={{ textDecoration: 'none' }}>
													마이 페이지
												</a>
											) : (
												<Link to={`/user/${localStorage.getItem('id')}`} style={{ textDecoration: 'none' }}>
													마이 페이지
												</Link>
											)}
										</li>
										<li>
											<FontAwesomeIcon icon={faRightFromBracket} className="menu__icon" />
											<Link to="/auth/login" onClick={handleLogout} style={{ textDecoration: 'none' }}>
												로그아웃
											</Link>
										</li>
									</div>
								</nav>
							)}
						</div>
					</li>
				</ul>
			</nav>
			<Outlet />
		</>
	);
}

export default NavBar2;
