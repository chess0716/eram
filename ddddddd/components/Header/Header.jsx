import React from 'react';
import styles from './Header.module.css'; // 모듈 CSS import
import images from '../../constants/images'; // `images` 객체에서 URL 가져오기

const Header = function Header() {
  return (
    <div
      className={styles.header}
      style={{
        background: `url(${images.eram}) center/cover no-repeat`,
        height: '50vh' // 이미지 높이를 절반으로 줄임
      }}
    >
      <div className={styles.headerContent}>
        <a href="/eram/posts/list" className="btn btn__blue">
          Community
        </a>
      </div>
    </div>
  );
};

export default Header;
