const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let timerEnabled = true; // 타이머 활성화 상태

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    icon: path.join(__dirname, '../build/icon.ico'),
    title: '슈고 페스타 타이머',
    autoHideMenuBar: true, // F10이나 Alt 키로 메뉴 표시 가능
  });

  // 메뉴바 완전히 제거 (주석 해제하면 메뉴바 완전 제거)
  // mainWindow.setMenuBarVisibility(false);

  // 커스텀 메뉴 설정 (주석 해제하면 원하는 메뉴만 표시)
  // const customMenu = Menu.buildFromTemplate([
  //   {
  //     label: '파일',
  //     submenu: [
  //       { role: 'quit', label: '종료' }
  //     ]
  //   },
  //   {
  //     label: '보기',
  //     submenu: [
  //       { role: 'reload', label: '새로고침' },
  //       { role: 'toggleDevTools', label: '개발자 도구' },
  //       { type: 'separator' },
  //       { role: 'resetZoom', label: '확대/축소 재설정' },
  //       { role: 'zoomIn', label: '확대' },
  //       { role: 'zoomOut', label: '축소' },
  //       { type: 'separator' },
  //       { role: 'togglefullscreen', label: '전체 화면' }
  //     ]
  //   }
  // ]);
  // Menu.setApplicationMenu(customMenu);

  // 개발 모드와 프로덕션 모드 구분
  if (app.isPackaged) {
    // 프로덕션: 빌드된 파일 로드
    const indexPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  } else {
    // 개발: Vite 개발 서버
    mainWindow.loadURL('http://localhost:5173');
  }

  // 윈도우가 닫힐 때 시스템 트레이로 최소화
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // 트레이 아이콘 생성
  let iconPath;
  const fs = require('fs');

  if (app.isPackaged) {
    // 프로덕션: 여러 경로 시도
    // extraResources로 복사된 icon.ico를 우선 사용
    const possiblePaths = [
      path.join(process.resourcesPath, 'icon.ico'), // extraResources 위치
      path.join(process.resourcesPath, 'app.asar', 'build', 'icon.ico'),
      path.join(process.resourcesPath, 'build', 'icon.ico'),
      path.join(__dirname, '../build/icon.ico'),
      path.join(app.getAppPath(), 'build', 'icon.ico'),
    ];

    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('__dirname:', __dirname);
    console.log('app.getAppPath():', app.getAppPath());

    // 존재하는 첫 번째 경로 찾기
    for (const testPath of possiblePaths) {
      console.log('시도 중:', testPath, '존재:', fs.existsSync(testPath));
      if (fs.existsSync(testPath)) {
        iconPath = testPath;
        console.log('✓ 트레이 아이콘 로드:', iconPath);
        break;
      }
    }

    if (!iconPath) {
      console.error('✗ 트레이 아이콘을 찾을 수 없습니다.');
    }
  } else {
    // 개발: 프로젝트 루트 기준
    iconPath = path.join(__dirname, '../build/icon.ico');
    console.log('개발 모드 - 트레이 아이콘:', iconPath);
  }

  if (!iconPath) {
    console.warn('빈 트레이 아이콘 사용');
    tray = new Tray(nativeImage.createEmpty());
  } else {
    const icon = nativeImage.createFromPath(iconPath);

    // 아이콘이 제대로 로드되었는지 확인
    if (icon.isEmpty()) {
      console.error('트레이 아이콘 로드 실패:', iconPath);
      tray = new Tray(nativeImage.createEmpty());
    } else {
      console.log('트레이 아이콘 크기:', icon.getSize());
      tray = new Tray(icon.resize({ width: 16, height: 16 }));
    }
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '열기',
      click: () => {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: timerEnabled ? '타이머 비활성화' : '타이머 활성화',
      click: () => {
        toggleTimer();
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('슈고 페스타 타이머');
  tray.setContextMenu(contextMenu);

  // 트레이 아이콘 클릭 시 창 표시
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// 트레이 메뉴 업데이트 함수
function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '열기',
      click: () => {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: timerEnabled ? '타이머 비활성화' : '타이머 활성화',
      click: () => {
        toggleTimer();
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

// 트레이 아이콘 업데이트 함수 (활성화/비활성화 상태에 따라)
function updateTrayIcon() {
  if (!tray) return;

  const fs = require('fs');
  let iconPath;
  let grayIconPath;

  if (app.isPackaged) {
    const possiblePaths = [
      path.join(process.resourcesPath, 'icon.ico'),
      path.join(process.resourcesPath, 'app.asar', 'build', 'icon.ico'),
      path.join(process.resourcesPath, 'build', 'icon.ico'),
      path.join(__dirname, '../build/icon.ico'),
      path.join(app.getAppPath(), 'build', 'icon.ico'),
    ];

    const grayPossiblePaths = [
      path.join(process.resourcesPath, 'icon-gray.ico'),
      path.join(process.resourcesPath, 'app.asar', 'build', 'icon-gray.ico'),
      path.join(process.resourcesPath, 'build', 'icon-gray.ico'),
      path.join(__dirname, '../build/icon-gray.ico'),
      path.join(app.getAppPath(), 'build', 'icon-gray.ico'),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        iconPath = testPath;
        break;
      }
    }

    for (const testPath of grayPossiblePaths) {
      if (fs.existsSync(testPath)) {
        grayIconPath = testPath;
        break;
      }
    }
  } else {
    iconPath = path.join(__dirname, '../build/icon.ico');
    grayIconPath = path.join(__dirname, '../build/icon-gray.ico');
  }

  if (!iconPath) {
    return;
  }

  // 비활성화 상태일 때 회색 아이콘 사용 (있으면)
  const activeIconPath = !timerEnabled && grayIconPath && fs.existsSync(grayIconPath)
    ? grayIconPath
    : iconPath;

  let icon = nativeImage.createFromPath(activeIconPath);

  if (!icon.isEmpty()) {
    tray.setImage(icon.resize({ width: 16, height: 16 }));
    tray.setToolTip(timerEnabled ? '슈고 페스타 타이머' : '슈고 페스타 타이머 (비활성화)');
  }
}

// 타이머 토글 함수
function toggleTimer() {
  timerEnabled = !timerEnabled;
  console.log('타이머 상태 변경:', timerEnabled ? '활성화' : '비활성화');

  // 웹 페이지에 이벤트 전송
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('toggle-timer');
  }

  // 트레이 메뉴와 아이콘 업데이트
  updateTrayMenu();
  updateTrayIcon();
}

// IPC 핸들러 설정
ipcMain.on('set-timer-enabled', (_event, enabled) => {
  console.log('웹에서 타이머 상태 수신:', enabled);
  timerEnabled = enabled;
  updateTrayMenu();
  updateTrayIcon();
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// macOS를 제외한 모든 플랫폼에서 창이 모두 닫히면 앱 종료
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱이 종료되기 전
app.on('before-quit', () => {
  app.isQuitting = true;
});
