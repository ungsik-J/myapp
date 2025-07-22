import React from 'react';
import { Button } from 'antd';

const ChildModal = ({ user, onClose }) => {
  return (
    <div>
      <p>이름: {user.name}</p>
      <p>나이: {user.age}</p>
      <Button onClick={onClose}>닫기</Button>
    </div>
  );
};

export default ChildModal;
