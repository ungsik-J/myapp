// electron/preload.js

const { contextBridge, ipcRenderer } = require('electron');

// 안전하게 브라우저에 API 제공
contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg) => ipcRenderer.send('toMain', msg),

    // 콜백을 등록하고, 해제할 수 있는 구조로 변경 (메모리 누수 방지)
    onMessage: (callback) => {
        const handler = (event, data) => callback(data);
        ipcRenderer.on('fromMain', handler);

        // 리스너 해제 함수 반환
        return () => ipcRenderer.removeListener('fromMain', handler);
    },

});

