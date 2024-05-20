import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostById } from '../service/PostService'; 
import '../styles/Read.scss';

export default function Read() {
  return <ReadContent />;
}

function ReadContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    getPostById(id)
      .then(response => {
        setPost(response.data);
      })
      .catch(error => console.error('Error fetching post:', error));
  }, [id]);

  function handleEdit() {
    // 글 수정페이지로 이동
    navigate(`/Writing=${id}`);
  }

  function handleDelete() {
    // 글 삭제 기능
    if (window.confirm('삭제 하시겠습니까?')) {
      fetch(`https://elice-server.herokuapp.com/board/${id}`, {
        method: 'DELETE',
      })
      .then(() => {
        alert('삭제되었습니다.');
        navigate(`/page=1`);
      })
      .catch(error => {
        console.error('Error deleting post:', error);
        alert('삭제에 실패했습니다.');
      });
    } else {
      alert('삭제 취소');
    }
  }

  if (!post) return <div>Loading...</div>;

  return (
    <section className="read_container">
      {localStorage.getItem('id') === post.authorId ? (
        <div className="button_box">
          <input type="submit" className="read_button" value="수정" onClick={handleEdit} />
          <input type="submit" className="read_button delete_button" value="삭제" onClick={handleDelete} />
        </div>
      ) : null}
      <div className="read_title">{post.title}</div>
      <div className="read_info">
        <span className="read_name">{post.nickname}</span>
        <span className="read_day">{post.date}</span>
      </div>
      <div className="read_content">
        {post.content.split('\n').map((line, idx) => (
          <span key={idx}>
            {line}
            <br />
          </span>
        ))}
      </div>
      <Link to={`/chat/${id}`} className="btn btn-primary">채팅방으로 이동</Link>
    </section>
  );
}
