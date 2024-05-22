import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../styles/Story/Story.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';

function Story({ posts, searchKeyword, searchWritings, setSearchWritings }) {
  return <StoryContent posts={posts} searchKeyword={searchKeyword} searchWritings={searchWritings} setSearchWritings={setSearchWritings} />;
}

function StoryContent({ posts, searchKeyword, searchWritings, setSearchWritings }) {
  const [board, setBoard] = useState(posts);
  const [page, setPage] = useState([]);
  const [boardCount, setBoardCount] = useState(0);
  const navigate = useNavigate();
  const { pageNum } = useParams();

  useEffect(() => {
    if (!pageNum) return;

    fetch(`https://elice-server.herokuapp.com/board/?page=${pageNum}`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((data) => {
        setBoard(data.data || []);
        setBoardCount(data.pageCount?.[0]?.count || 0);
        const totalPage = Math.ceil((data.pageCount?.[0]?.count || 0) / 10);
        const pageNumArray = Array.from({ length: totalPage }, (_, i) => i + 1);
        setPage(pageNumArray);
      });
  }, [pageNum]);

  useEffect(() => {
    setBoard(posts);
  }, [posts]);

  function storyPagination(e) {
    const pageNumber = Number(e.target.innerHTML);
    fetch(`https://elice-server.herokuapp.com/board/?page=${pageNumber}`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((data) => {
        setBoard(data.data || []);
      });
    navigate(`/page=${pageNumber}`);
  }

  return searchWritings === undefined ? (
    <section className="story_parent">
      <div className="story_container">
        <div className="story_length">
          <span>{boardCount}개의 게시글</span>
          <FontAwesomeIcon
            icon={faArrowRotateRight}
            className="refresh__icon"
            onClick={async () => {
              await fetch(`https://elice-server.herokuapp.com/board/?page=1`, {
                method: 'GET',
              })
                .then((res) => res.json())
                .then((data) => {
                  setBoard(data.data || []);
                });
            }}
          />
        </div>
        <StoryInfo />
        {board.map((el) => (
          <div className="story" key={el.id}>
            <span className="story_number story_child">{el.id}</span>
            <span className="story_name story_child">{el.user ? el.user.id : 'Unknown User'}</span>
            <Link to={`/posts/${el.id}`}>
              <span className="story_title story_child">
                {el.title.length < 25 ? el.title : `${el.title.slice(0, 25)}...`}
              </span>
            </Link>
            <span className="story_time story_child">{el.createdAt ? el.createdAt.slice(0, 10) : 'Unknown Date'}</span>
          </div>
        ))}
      </div>
      <Link className="writeBtn" to="/Writing">
        글쓰기
      </Link>
      <div className="pageNav">
        &lt;
        {page.map((el) => (
          <button type="submit" className="pageNav_btn" onClick={storyPagination} key={el}>
            {el}
          </button>
        ))}
        &gt;
      </div>
    </section>
  ) : (
    <section className="story_parent">
      <div className="story_container">
        <div className="story_length">
          <span>
            &apos;{searchKeyword}&apos; - {searchWritings.length}개의 게시글
          </span>
          <FontAwesomeIcon
            icon={faArrowRotateRight}
            className="refresh__icon"
            onClick={async () => {
              await fetch(`https://elice-server.herokuapp.com/board/?page=1`, {
                method: 'GET',
              })
                .then((res) => res.json())
                .then((data) => {
                  setSearchWritings(data.data || []);
                  setSearchWritings(undefined);
                });
              navigate('/page=1');
            }}
          />
        </div>
        <StoryInfo />
        {searchWritings.map((el) => (
          <div className="story" key={el.id}>
            <span className="story_number story_child">{el.id}</span>
            <span className="story_name story_child">{el.user ? el.user.id : 'Unknown User'}</span>
            <Link to={`/posts/${el.id}`}>
              <span className="story_title story_child">{el.title}</span>
            </Link>
            <span className="story_time story_child">{el.createdAt ? el.createdAt.slice(0, 10) : 'Unknown Date'}</span>
          </div>
        ))}
      </div>
      <Link className="writeBtn" to="/Writing">
        글쓰기
      </Link>
    </section>
  );
}

function StoryInfo() {
  return (
    <div className="story storyInfo">
      <span className="story_number story_child">번호</span>
      <span className="story_title story_child">제목</span>
      <span className="story_name story_child">작성자</span>
      <span className="story_time story_child">작성일</span>
    </div>
  );
}

export default StoryContent;
