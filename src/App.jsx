import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Button,
  List,
  Typography,
  Space,
  message,
  ConfigProvider,
  theme as antdTheme,
  Switch,
} from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';

const { ipcRenderer } = window.require('electron');

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      const loadedTodos = await ipcRenderer.invoke('read-todos');
      setTodos(loadedTodos || []);
    };

    fetchTodos();
  }, []);

  const addTodo = useCallback(() => {
    if (!input.trim()) {
      message.warning('할 일을 입력해주세요.');
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: input,
      date: new Date().toISOString(),
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setInput('');
    ipcRenderer.invoke('write-todos', updatedTodos);
    message.success('할 일이 추가되었습니다.');
  }, [input, todos]);

  const removeTodo = useCallback((id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    ipcRenderer.invoke('write-todos', updatedTodos);
    message.info('할 일이 삭제되었습니다.');
  }, [todos]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: darkMode ? '#3a87ff' : '#1677ff',
          borderRadius: 8,
          fontFamily: 'Pretendard, sans-serif',
        },
      }}
    >
      <div
        style={{
          padding: 24,
          maxWidth: 600,
          margin: '0 auto',
          minHeight: '100vh',
          background: darkMode ? '#1f1f1f' : '#f5f5f5',
          color: darkMode ? '#fff' : '#000',
        }}
      >
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={2} style={{ color: darkMode ? '#fff' : '#000' }}>
            📝 Todo List
          </Typography.Title>
          <Switch
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
            onChange={toggleDarkMode}
            checked={darkMode}
          />
        </Space>

        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="할 일을 입력하세요"
            onPressEnter={addTodo}
          />
          <Button type="primary" onClick={addTodo}>
            추가
          </Button>
        </Space.Compact>

        <List
          bordered
          dataSource={todos}
          locale={{ emptyText: '할 일이 없습니다.' }}
          renderItem={(todo) => (
            <List.Item
              actions={[
                <Button danger size="small" onClick={() => removeTodo(todo.id)}>
                  삭제
                </Button>,
              ]}
            >
              <div style={{ width: '100%' }}>
                <Typography.Text>{todo.text}</Typography.Text>
                <div style={{ fontSize: 12, color: darkMode ? '#ccc' : '#888' }}>
                  {dayjs(todo.date).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </ConfigProvider>
  );
}

export default App;
