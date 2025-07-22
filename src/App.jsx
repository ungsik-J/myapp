import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  List,
  Typography,
  Space,
  message,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";


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
  const [textarea, setTextarea] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {

    ipcRenderer.invoke("read-todos").then(setTodos);

    ipcRenderer.on("download-success", (_, name) => {
      message.success(`"${name}" 다운로드 완료`);
    });

    ipcRenderer.on("download-failure", (_, error) => {
      message.error(`다운로드 실패: ${error}`);
    });

    return () => {
      ipcRenderer.removeAllListeners("download-success");
      ipcRenderer.removeAllListeners("download-failure");
    };
  }, []);

  const addTodo = () => {
    if (!input.trim()) {
      message.warning("할 일을 입력해주세요.");
      return;
    }

    const newTodo = {
      text: input,
      memo: textarea,
      date: new Date().toISOString(),
    };

    if (file) {
      newTodo.file = {
        name: file.name,
        path: file.path, // Electron에서 local 경로 사용
      };
    }

    if (editIndex !== null) {
      const updatedTodos = todos.map((todo, index) =>
        index === editIndex ? { ...todo, ...newTodo } : todo
      );
      setTodos(updatedTodos);
      ipcRenderer.invoke("write-todos", updatedTodos);
      setEditIndex(null);
      message.success("할 일이 수정되었습니다.");
    } else {
      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      ipcRenderer.invoke("write-todos", newTodos);
      message.success("할 일이 추가되었습니다.");
    }

    setInput("");
    setTextarea("");
    setFile(null);
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
    setTextarea(todos[index].memo || "");
    setFile(todos[index].file || null);
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Typography.Title level={2}>📝 Todo List</Typography.Title>

      <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요"
          onPressEnter={addTodo}
        />
        <Input.TextArea
          value={textarea}
          onChange={(e) => setTextarea(e.target.value)}
          placeholder="추가 메모 (선택 사항)"
          rows={4}
        />

        {/* 첨부파일 선택 */}
        <Upload
          beforeUpload={(file) => {
            setFile(file);
            return false; // 자동 업로드 방지
          }}
          fileList={file ? [file] : []}
          onRemove={() => setFile(null)}
          maxCount={1}
        >
          <Button icon={<PaperClipOutlined />}>첨부파일 선택</Button>
        </Upload>

        <Button
          style={{ width: 600 }}
          type="primary"
          icon={editIndex !== null ? <CheckOutlined /> : <PlusOutlined />}
          onClick={addTodo}
        >
          {editIndex !== null ? "수정 완료" : "추가"}
        </Button>
      </Space>

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
            <div>
              <Typography.Text strong>{todo.text}</Typography.Text>
              {todo.memo && (
                <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                  {todo.memo}
                </Typography.Paragraph>
              )}
              {todo.file && (
                <Button
                  type="link"
                  icon={<PaperClipOutlined />}
                  onClick={() => {
                    ipcRenderer.send("download-file", todo.file.path);
                  }}
                  style={{ padding: 0 }}
                >
                  📎 {todo.file.name}
                </Button>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

if (window.opener && !window.opener.closed) {
  window.opener.close(); // 부모창 닫기
}

export default App;
