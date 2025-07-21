const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

const dataPath = path.join(app.getPath('userData'), 'todos.json');


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, // 보안 주의: 실제 앱 배포시 preload로 우회 필요
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // React dev server
}

app.whenReady().then(createWindow);

ipcMain.handle('read-todos', async () => {
  try {
    const data = fs.existsSync(dataPath)
      ? fs.readFileSync(dataPath, 'utf-8')
      : '[]';
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('write-todos', async (event, todos) => {
  try {
    
    fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
    return { status: 'success' };
  } catch (err) {
    console.error(err);
    return { status: 'error' };
  }
});
