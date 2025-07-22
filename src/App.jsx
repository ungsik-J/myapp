import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Input,
  Button,
  List,
  Typography,
  Space,
  message,
  Upload,
  Switch,
  ConfigProvider,
  theme,
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
  const data = encodeURIComponent(JSON.stringify({ title: "Hello", pObj: param }));
  ipcRenderer.send("open-modal", data);
};

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [textarea, setTextarea] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [file, setFile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const inputRef = useRef(null);

  // ✅ 최초 마운트 시 처리
  useEffect(() => {
    inputRef.current?.focus();
    ipcRenderer.invoke("read-todos").then(setTodos);

    const onSuccess = (_, name) => message.success(`"${name}" 다운로드 완료`);
    const onFailure = (_, error) => message.error(`다운로드 실패: ${error}`);

    ipcRenderer.on("download-success", onSuccess);
    ipcRenderer.on("download-failure", onFailure);

    return () => {
      ipcRenderer.off("download-success", onSuccess);
      ipcRenderer.off("download-failure", onFailure);
    };
  }, []);

  // ✅ 다크 모드 전환
  const darkSwitch = (checked) => {
    setIsDarkMode(checked);
    const root = document.documentElement;
    root.style.backgroundColor = checked ? "rgb(31, 31, 31)" : "rgba(255, 255, 255, 1)";
  };

  // ✅ 할 일 추가 또는 수정
  const addTodo = useCallback(() => {
    if (!input.trim()) return message.warning("할 일을 입력해주세요.");

    const newTodo = {
      text: input,
      memo: textarea,
      date: new Date().toISOString(),
      ...(file && { file: { name: file.name, path: file.path } }),
    };

    let updatedTodos;
    if (editIndex !== null) {
      updatedTodos = todos.map((todo, i) => (i === editIndex ? { ...todo, ...newTodo } : todo));
      message.success("할 일이 수정되었습니다.");
    } else {
      updatedTodos = [...todos, newTodo];
      message.success("할 일이 추가되었습니다.");
    }

    setTodos(updatedTodos);
    ipcRenderer.invoke("write-todos", updatedTodos);
    setInput("");
    setTextarea("");
    setFile(null);
    setEditIndex(null);
  }, [input, textarea, file, todos, editIndex]);

  // ✅ 삭제
  const removeTodo = useCallback((index) => {
    const updated = todos.filter((_, i) => i !== index);
    setTodos(updated);
    ipcRenderer.invoke("write-todos", updated);
    message.success("삭제되었습니다.");
  }, [todos]);

  // ✅ 수정 시작
  const startEditTodo = useCallback((index) => {
    const todo = todos[index];
    modelPop(todo);
    setEditIndex(index);
    setInput(todo.text);
    setTextarea(todo.memo || "");
    setFile(todo.file || null);
  }, [todos]);

  // ✅ 렌더링 함수 분리
  const renderTodoItem = useCallback((todo, i) => (
    <div style={{ margin: "5px" }}>
      <Typography.Text strong style={{ color: isDarkMode ? "#fff" : undefined }}>
        {todo.text}
      </Typography.Text>
      {todo.memo && (
        <Typography.Paragraph style={{ margin: 0, color: isDarkMode ? "#aaa" : undefined }}>
          {todo.memo}
        </Typography.Paragraph>
      )}
      {todo.file && (
        <Button
          type="link"
          icon={<PaperClipOutlined />}
          onClick={() => ipcRenderer.send("download-file", todo.file.path)}
          style={{ padding: 0 }}
        >
          📎 {todo.file.name}
        </Button>
      )}
      <hr style={{ borderStyle: "dashed", borderColor: "#e6e6e6ff", borderWidth: "0.5px 0 0 0" }} />
      <div style={{ textAlign: "right" }}>
        <Button type="text" icon={<EditOutlined />} onClick={() => startEditTodo(i)}>수정</Button>
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeTodo(i)}>삭제</Button>
      </div>
    </div>
  ), [isDarkMode, startEditTodo, removeTodo]);

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <div
        style={{
          padding: 24,
          maxWidth: 600,
          margin: "0 auto",
          backgroundColor: isDarkMode ? "#1f1f1f" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
          minHeight: "100vh",
        }}
      >
        <Space style={{ justifyContent: "space-between", width: "100%", marginBottom: 16 }}>
          <Typography.Title level={2} style={{ color: isDarkMode ? "#fff" : "#000" }}>
            📝 Todo List
          </Typography.Title>
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            checked={isDarkMode}
            onChange={darkSwitch}
          />
        </Space>

        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Input
            ref={inputRef}
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
          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            fileList={file ? [file] : []}
            onRemove={() => setFile(null)}
            maxCount={1}
          >
            <Button icon={<PaperClipOutlined />}>첨부파일 선택</Button>
          </Upload>
          <Button
            style={{ width: "100%" }}
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
          renderItem={renderTodoItem}
        />
      </div>
    </ConfigProvider>
  );
}

export default App;
