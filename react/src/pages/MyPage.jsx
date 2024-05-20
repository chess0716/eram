import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import MyPageProfile from '../components/Profile/MyPageProfile';
import MyStory from '../components/Story/MyStory';

function MyPage() {
  const { id } = useParams();
  const [userId, setUserId] = useState(id);

  return (
    <>
      <MyPageProfile userId={userId} />
      <MyStory userId={userId} />
    </>
  );
}

export default MyPage;
