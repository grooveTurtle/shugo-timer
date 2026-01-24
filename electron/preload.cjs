const { contextBridge, ipcRenderer } = require('electron');

// Electron API를 웹 페이지에 안전하게 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 타이머 활성화 상태 전송
  setTimerEnabled: (enabled) => ipcRenderer.send('set-timer-enabled', enabled),

  // 메인 프로세스로부터 타이머 토글 이벤트 수신
  onToggleTimer: (callback) => {
    ipcRenderer.on('toggle-timer', () => callback());
  },

  // 메인 프로세스로부터 알람 끄기 이벤트 수신
  onDismissAlarm: (callback) => {
    ipcRenderer.on('dismiss-alarm', () => callback());
  },

  // 단축키 설정 가져오기
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),

  // 단축키 설정 저장
  setShortcuts: (shortcuts) => ipcRenderer.invoke('set-shortcuts', shortcuts),

  // 단축키 유효성 검사
  validateShortcut: (shortcut) => ipcRenderer.invoke('validate-shortcut', shortcut),
});
