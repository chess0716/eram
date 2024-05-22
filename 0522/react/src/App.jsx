import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';



import MyPage from './pages/MyPage';
import NavBar from './components/NavBar/NavBar';
import NavBar2 from './components/NavBar/NavBar2';
import MainPage from './pages/MainPage';
import AuthForm from './components/AuthForm/AuthForm';
import Read from './pages/Read';
import Writing from './pages/Writing';
import WritePut from './pages/WritePut';
import Places from './components/Places/Places';
import DetailPage from './components/Event/DetailPage';
import ChatRoom from './components/ChatRoom/ChatRoom'; // Correct import

function App() {
  const navigate = useNavigate();

  const isPc = useMediaQuery({ query: '(min-width:1224px)' });
  const isMobile = useMediaQuery({ query: '(max-width:1223px)' });

  useEffect(() => {
    // URL 변경
    if (window.location.pathname === '/eram' || window.location.pathname === '/eram/') {
      navigate('/main');
    }
  }, [navigate]);

  return (
    <div className="App">
      {isPc && (
        <Routes>
          <Route element={<NavBar />}>
            <Route path="/auth/join" element={<AuthForm />} />
            <Route path="/auth/login" element={<AuthForm />} />
            <Route path="/main" element={<Places />} />
            <Route path="/details/:index" element={<DetailPage />} />
            <Route path="/posts/list" element={<MainPage />} />
            <Route path="/posts/:id" element={<Read />} /> {/* Update Read route */}
            <Route path="/search=:keyword" element={<MainPage />} />
          </Route>
          <Route element={<NavBar2 />}>
            <Route path="/user/:name" element={<MyPage />} />
            <Route path="/page=:pageNum/Read=:id" element={<Read />} />
            <Route path="/Read=:id" element={<Read />} />
            <Route path="/Writing" element={<Writing />} />
            <Route path="/page=:pageNum/Writing=:id" element={<WritePut />} />
            <Route path="/Writing=:id" element={<WritePut />} />
            <Route path="/chat/:postId" element={<ChatRoom />} /> {/* Add ChatRoom route */}
          </Route>
        </Routes>
      )}
      {isMobile && (
        <div className="mobile_container">
          <h1>여긴 너무 작아요 (˘･_･˘)</h1>
          <h2>더 큰 화면으로 봐주세요 !</h2>
        </div>
      )}
    </div>
  );
}

export default App;
