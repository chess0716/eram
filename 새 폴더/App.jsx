import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import MyPage from './pages/MyPage';
import NavBar from './components/NavBar/NavBar';
import NavBar2 from './components/NavBar/NavBar2';
import MainPage from './pages/MainPage';
import AuthForm from './pages/AuthForm';
import Read from './pages/Read';
import Writing from './pages/Writing';
import WritePut from './pages/WritePut';
import Places from './components/Places/Places';
import DetailPage from './components/Event/DetailPage';
import ChatRoom from './components/ChatRoom/ChatRoom';
import Modify from './pages/ModifyProfileForm';
import { SearchProvider } from './utils/SearchContext';
import PrivateRoute from './components/PrivateRoute';

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
    <SearchProvider>
      <div className="App">
        {isPc && (
          <Routes>
            <Route element={<NavBar />}>
              <Route path="/auth/join" element={<AuthForm />} />
              <Route path="/auth/login" element={<AuthForm />} />
              <Route path="/main" element={<Places />} />
              <Route path="/details/:index" element={<DetailPage />} />
              <Route path="/posts/page/:pageNum" element={<MainPage />} />
              <Route path="/posts/read/:id" element={<PrivateRoute><Read /></PrivateRoute>} /> {/* Update Read route */}
              <Route path="/search/:keyword" element={<MainPage />} />
            </Route>
            <Route element={<NavBar2 />}>
              <Route path="/posts/writing" element={<PrivateRoute><Writing /></PrivateRoute>} /> {/* Protect Writing route */}
              <Route path="/posts/writingPut/:id" element={<PrivateRoute><WritePut /></PrivateRoute>} /> {/* Protect WritePut route */}
              <Route path="/chat/:postId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} /> {/* Protect ChatRoom route */}
              <Route path="/members/get/:id" element={<PrivateRoute><MyPage /></PrivateRoute>} /> {/* Protect MyPage route */}
              <Route path="/modify/:id" element={<PrivateRoute><Modify /></PrivateRoute>} /> {/* Protect Modify route */}
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
    </SearchProvider>
  );
}

export default App;
