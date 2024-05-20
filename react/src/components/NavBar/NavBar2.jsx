import React, { useEffect, useState } from 'react';
import '../../styles/NavBar/NavBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Logout from '../../utils/Logout';
import store from '../../store';

function NavBar2() {
  const { UserStore } = store();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const toggleMenu = () => {
    setShowMenu((showMenu) => !showMenu);
  };

  useEffect(() => {
    const userId = localStorage.getItem('id');
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    (async () => {
      try {
        const response = await fetch(`https://elice-server.herokuapp.com/mypage/${userId}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        UserStore.setNickname(result.data.nickname);
        UserStore.setEmail(result.data.id);
        UserStore.setDescription(result.data.intro);
        if (result.data.profile !== null) {
          UserStore.setImgSrc(result.data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
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
          <Link to="/page=1" style={{ textDecoration: 'none' }}>
            ERaM
          </Link>
        </div>
        <ul className="navItems">
          <li className="navItem">
            <div className="navItem__menu-container">
              <img
                src={UserStore.imgSrc}
                alt="profile"
                onClick={() => toggleMenu()}
                aria-hidden="true"
                className="navItem__trigger"
              />
              {showMenu ? (
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
                      <Link to="/auth/login" onClick={Logout} style={{ textDecoration: 'none' }}>
                        로그아웃
                      </Link>
                    </li>
                  </div>
                </nav>
              ) : null}
            </div>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

export default NavBar2;
