import { useCallback, useEffect, useState } from 'react';
import { AlarmState } from '@/types';
import Clock from '@/components/Clock';
import TimerSettings from '@/components/TimerSettings';
import ShortcutSettings from '@/components/ShortcutSettings';
import AlarmModal from '@/components/AlarmModal';
import { useTimerSettings } from '@/hooks/useTimerSettings';
import { useNotification } from '@/hooks/useNotification';
import { useAlarmScheduler } from '@/hooks/useAlarmScheduler';
import { soundGenerator } from '@/utils/soundGenerator';
import './App.css';


function App() {
  const { settings, updateSettings } = useTimerSettings();
  const { permission, requestPermission, showNotification, setOnDismiss } = useNotification();
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // 테마 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleDismissAlarm = useCallback(() => {
    setAlarmState({
      isOpen: false,
      title: '',
      message: '',
    });
  }, []);

  // 알림 클릭 시 모달도 닫히도록 콜백 등록
  useEffect(() => {
    setOnDismiss(handleDismissAlarm);
  }, [setOnDismiss, handleDismissAlarm]);

  const handleAlarm = useCallback((message: string, isAdvance: boolean) => {
    console.log('Alarm triggered:', message);
    const title = isAdvance ? '사전 알림' : '알람';

    // 브라우저 알림 표시
    showNotification(title, message);

    // 모달 표시
    setAlarmState({
      isOpen: true,
      title,
      message,
    });
  }, [showNotification]);

  // 경기 시작 알림 (시스템 알림 + 짧은 효과음, 모달 없음)
  const handleGameStartNotice = useCallback((message: string) => {
    console.log('Game start notice:', message);
    showNotification('경기 시작 알림', message, 'shugo-gamestart');
    soundGenerator.play('gamestart', 0.5);
  }, [showNotification]);

  useAlarmScheduler({ settings, onAlarm: handleAlarm, onGameStartNotice: handleGameStartNotice });

  // Electron에서 토글 이벤트 수신
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onToggleTimer(() => {
        console.log('Electron에서 타이머 토글 이벤트 수신');
        updateSettings({ enabled: !settings.enabled });
      });
    }
  }, [settings.enabled, updateSettings]);

  // Electron에서 알람 끄기 이벤트 수신
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onDismissAlarm(() => {
        console.log('Electron에서 알람 끄기 이벤트 수신');
        handleDismissAlarm();
      });
    }
  }, [handleDismissAlarm]);

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <h1>아이온2 컨텐츠 타이머</h1>
          <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        {permission !== 'granted' && (
          <div className="notification-banner">
            <p>브라우저 알림을 허용하면 백그라운드에서도 알람을 받을 수 있습니다.</p>
            <button onClick={requestPermission}>알림 허용하기</button>
          </div>
        )}
        {permission === 'granted' && (
          <div className="notification-status">
            알림 허용됨
          </div>
        )}
      </header>

      <main>
        <Clock settings={settings} />
        <TimerSettings settings={settings} onUpdate={updateSettings} />
        <ShortcutSettings />
      </main>

      <AlarmModal
        isOpen={alarmState.isOpen}
        title={alarmState.title}
        message={alarmState.message}
        soundType={settings.alarmSound}
        duration={settings.alarmDuration}
        onDismiss={handleDismissAlarm}
      />
    </div>
  );
}

export default App;
