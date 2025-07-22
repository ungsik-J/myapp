const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { screen } = require("electron");
let mainWindow;

const dataPath = path.join(app.getPath("userData"), "todos.json");

ipcMain.on("open-modal", (event, data) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 800;
  const winHeight = 600;

  const modal = new BrowserWindow({
    winWidth: width,
    winHeight: height,
    x: Math.round((width - winWidth) / 2),
    y: Math.round((height - winHeight) / 2),
    center: true,
    modal: true,
    parent: BrowserWindow.getFocusedWindow(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  modal.loadURL(
    `file://D:/DevHome/React/HelloWorld/myapp/modal.html?data=${data}`
  );
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, // 보안 주의: 실제 앱 배포시 preload로 우회 필요
    },
  });

  mainWindow.loadURL("http://localhost:3000"); // React dev server
}

app.whenReady().then(createWindow);

ipcMain.handle("read-todos", async () => {
  try {
    const data = fs.existsSync(dataPath)
      ? fs.readFileSync(dataPath, "utf-8")
      : "[]";
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle("write-todos", async (event, todos) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
    return { status: "success" };
  } catch (err) {
    console.error(err);
    return { status: "error" };
  }
});
