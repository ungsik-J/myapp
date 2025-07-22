const { app, BrowserWindow, Menu, ipcMain, dialog, screen } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

const dataPath = path.join(app.getPath("userData"), "todos.json");
const isDev = process.env.NODE_ENV === "development";
const REACT_DEV_URL = "http://localhost:3000";
const MODAL_HTML_PATH = path.resolve(__dirname, "modal.html"); // 상대경로로 변경 권장

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    frame: true,
    transparent: 80,
    show: true,
    title: 'TODO-LIST',
    alwaysOnTop: true,
    webPreferences: true,
    nodeIntegration: false,      // 노드 모듈 사용 여부 (보안상 false 권장)
    contextIsolation: true,      // context 분리 (보안 향상)
    preload: './preload.js',     // preload 스크립트 경로
    devTools: true,              // 개발자 도구 사용 가능 여부
    sandbox: false,              // 샌드박스 사용 여부
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, // 보안 이슈 주의
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL(REACT_DEV_URL);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

}

function createModalWindow(data) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalWidth = 800;
  const modalHeight = 600;

  const modal = new BrowserWindow({
    width: modalWidth,
    height: modalHeight,
    x: Math.round((width - modalWidth) / 2),
    y: Math.round((height - modalHeight) / 2),
    modal: true,
    parent: BrowserWindow.getFocusedWindow(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  modal.loadURL(`file://${MODAL_HTML_PATH}?data=${encodeURIComponent(data)}`);
}

// 앱 초기화
app.whenReady().then(createMainWindow);

// 모달 열기 이벤트
ipcMain.on("open-modal", (event, data) => {
  createModalWindow(data);
});

// 할 일 읽기
ipcMain.handle("read-todos", async () => {
  try {
    if (!fs.existsSync(dataPath)) return [];
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("읽기 오류:", err);
    return [];
  }
});

// 할 일 저장
ipcMain.handle("write-todos", async (event, todos) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
    return { status: "success" };
  } catch (err) {
    console.error("쓰기 오류:", err);
    return { status: "error", message: err.message };
  }
});

// 파일 다운로드
ipcMain.on("download-file", async (event, filePath) => {
  const fileName = path.basename(filePath);
  try {
    const { canceled, filePath: savePath } = await dialog.showSaveDialog({
      defaultPath: fileName,
      title: "파일 저장",
    });

    if (!canceled && savePath) {
      fs.copyFileSync(filePath, savePath);
      event.sender.send("download-success", fileName);
    }
  } catch (err) {
    console.error("다운로드 실패:", err);
    event.sender.send("download-failure", err.message);
  }
});