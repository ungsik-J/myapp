import React, { useState, useEffect } from "react";
import { Input, Button, List, Typography, Space, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
} from "@ant-design/icons";
//
const { ipcRenderer } = window.require("electron");

const modelPop = (param) => {
  const data = encodeURIComponent(
    JSON.stringify({ title: "Hello", pObj: param })
  );
  ipcRenderer.send("open-modal", data);
};

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null); // 현재 수정 중인 항목의 index

  useEffect(() => {
    ipcRenderer.invoke("read-todos").then(setTodos);
  }, []);

  const addTodo = () => {
    if (!input.trim()) {
      message.warning("할 일을 입력해주세요.");
      return;
    }

    if (editIndex !== null) {
      // 수정 모드인 경우
      const updatedTodos = todos.map((todo, index) =>
        index === editIndex ? { ...todo, text: input } : todo
      );

      setTodos(updatedTodos);
      setEditIndex(null);
      ipcRenderer.invoke("write-todos", updatedTodos);
      message.success("할 일이 수정되었습니다.");
    } else {
      // 추가 모드인 경우
      const newTodos = [
        ...todos,
        { text: input, date: new Date().toISOString() },
      ];
      setTodos(newTodos);
      ipcRenderer.invoke("write-todos", newTodos);
      message.success("할 일이 추가되었습니다.");
    }

    setInput("");
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
    ipcRenderer.invoke("write-todos", newTodos);
    message.success("삭제되었습니다.");
  };

  const startEditTodo = (index) => {
    modelPop(todos[index]);

    setEditIndex(index);
    setInput(todos[index].text);
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Typography.Title level={2}>📝 Todo List</Typography.Title>

      <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요"
          onPressEnter={addTodo}
        />
        <Button
          type="primary"
          icon={editIndex !== null ? <CheckOutlined /> : <PlusOutlined />}
          onClick={addTodo}
        >
          {editIndex !== null ? "수정 완료" : "추가"}
        </Button>
      </Space.Compact>

      <List
        bordered
        dataSource={todos}
        renderItem={(todo, i) => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => startEditTodo(i)}
              >
                수정
              </Button>,
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeTodo(i)}
              >
                삭제
              </Button>,
            ]}
          >
            <Typography.Text>{todo.text}</Typography.Text>
          </List.Item>
        )}
      />
    </div>
  );
}

export default App;
