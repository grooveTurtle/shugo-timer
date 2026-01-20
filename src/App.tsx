import { useCallback, useEffect, useState } from 'react';
import Clock from './components/Clock';
import TimerSettings from './components/TimerSettings';
import ShortcutSettings from './components/ShortcutSettings';
import AlarmModal from './components/AlarmModal';
import { useTimerSettings } from './hooks/useTimerSettings';
import { useNotification } from './hooks/useNotification';
import { useAlarmScheduler } from './hooks/useAlarmScheduler';
import './App.css';

interface AlarmState {
  isOpen: boolean;
  title: string;
  message: string;
}

function App() {
  const { settings, updateSettings } = useTimerSettings();
  const { permission, requestPermission, showNotification } = useNotification();
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleAlarm = useCallback((message: string, isAdvance: boolean) => {
    console.log('Alarm triggered:', message);
    const title = isAdvance ? '사전 알림' : '알람';

    // 브라우저 알림 표시
    showNotification(title, message, settings.alarmSound, 0.5);

    // 모달 표시
    setAlarmState({
      isOpen: true,
      title,
      message,
    });
  }, [showNotification, settings.alarmSound]);

  const handleDismissAlarm = useCallback(() => {
    setAlarmState({
      isOpen: false,
      title: '',
      message: '',
    });
  }, []);

  useAlarmScheduler({ settings, onAlarm: handleAlarm });

  // Electron에서 토글 이벤트 수신
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onToggleTimer(() => {
        console.log('Electron에서 타이머 토글 이벤트 수신');
        updateSettings({ enabled: !settings.enabled });
      });
    }
  }, [settings.enabled, updateSettings]);

  return (
    <div className="app">
      <header>
        <h1>슈고 페스타 타이머</h1>
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
        <Clock alarmMinutes={settings.alarmMinutes} />
        <TimerSettings settings={settings} onUpdate={updateSettings} />
        <ShortcutSettings />
      </main>

      <AlarmModal
        isOpen={alarmState.isOpen}
        title={alarmState.title}
        message={alarmState.message}
        soundType={settings.alarmSound}
        onDismiss={handleDismissAlarm}
      />
    </div>
  );
}

export default App;
