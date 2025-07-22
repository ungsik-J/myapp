import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import ChildModal from './ChildModal';

const Parent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: '홍길동',
        age: 30
    });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                모달 열기
            </Button>
            <Modal
                title="자식 모달"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null} // 자식에게 제어권을 넘기기 위해 footer 제거
            >
                <ChildModal user={userData} onClose={handleCancel} />
            </Modal>
        </>
    );
};

export default Parent;
