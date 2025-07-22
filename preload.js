// electron/preload.js

const { contextBridge, ipcRenderer } = require('electron')

// 안전하게 브라우저에 API 제공
contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg) => ipcRenderer.send('toMain', msg),
    onMessage: (callback) => ipcRenderer.on('fromMain', (event, data) => callback(data)),
})
