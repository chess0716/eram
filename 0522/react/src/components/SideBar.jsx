import React from 'react';
import '../styles/SideBar.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function SideBar() {
	return (
		<div className="Sidebar__container">
			<h2>바로가기</h2>
			<div className="link">
				<p id="link1">
					<a href="http://localhost:3000/eram/chat">채팅방가기</a>
				</p>
				<p id="link2">
					<a href="http://localhost:3000/eram/posts">SideBar1</a>
				</p>
				<p id="link3">
					<a href="http://localhost:3000/eram/posts">SideBar1 &rarr;</a>
				</p>
				<div className="git">
					{/* <FontAwesomeIcon icon={faGithub} className="gitIcon" /> */}
					<a href="http://localhost:3000/eram">Main</a>
				</div>
				<div className="footer">
					<p>© 2024 ERaM</p>
				</div>
			</div>
		</div>
	);
}

export default SideBar;
