import React, { useState } from 'react';
import { TimerSettingsProps } from '@/types';
import {
  ALARM_SOUNDS,
  QUICK_ALARM_MINUTES,
  QUICK_ADVANCE_NOTICES,
} from '@/constants';
import { soundGenerator } from '@/utils/soundGenerator';
import './TimerSettings.css';

const TimerSettings: React.FC<TimerSettingsProps> = ({ settings, onUpdate }) => {
  const [showCustomAlarm, setShowCustomAlarm] = useState(false);
  const [showCustomAdvance, setShowCustomAdvance] = useState(false);
  const [customAlarmMinute, setCustomAlarmMinute] = useState('');
  const [customAdvanceNotice, setCustomAdvanceNotice] = useState('');

  const playTestSound = (soundValue: string) => {
    soundGenerator.play(soundValue, 0.5);
  };

  const toggleAlarmMinute = (minute: number) => {
    if (settings.alarmMinutes.includes(minute)) {
      onUpdate({ alarmMinutes: settings.alarmMinutes.filter((m) => m !== minute) });
    } else {
      onUpdate({ alarmMinutes: [...settings.alarmMinutes, minute].sort((a, b) => a - b) });
    }
  };

  const toggleAdvanceNotice = (advance: number) => {
    if (settings.advanceNotices.includes(advance)) {
      onUpdate({ advanceNotices: settings.advanceNotices.filter((a) => a !== advance) });
    } else {
      onUpdate({ advanceNotices: [...settings.advanceNotices, advance].sort((a, b) => a - b) });
    }
  };

  const addCustomAlarmMinute = () => {
    const minute = Number(customAlarmMinute);
    if (!isNaN(minute) && minute >= 0 && minute < 60 && !settings.alarmMinutes.includes(minute)) {
      onUpdate({ alarmMinutes: [...settings.alarmMinutes, minute].sort((a, b) => a - b) });
      setCustomAlarmMinute('');
      setShowCustomAlarm(false);
    }
  };

  const addCustomAdvanceNotice = () => {
    const notice = Number(customAdvanceNotice);
    if (!isNaN(notice) && notice > 0 && notice < 60 && !settings.advanceNotices.includes(notice)) {
      onUpdate({ advanceNotices: [...settings.advanceNotices, notice].sort((a, b) => a - b) });
      setCustomAdvanceNotice('');
      setShowCustomAdvance(false);
    }
  };

  const removeCustomAlarmMinute = (minute: number) => {
    if (!QUICK_ALARM_MINUTES.includes(minute)) {
      onUpdate({ alarmMinutes: settings.alarmMinutes.filter((m) => m !== minute) });
    }
  };

  const removeCustomAdvanceNotice = (advance: number) => {
    if (!QUICK_ADVANCE_NOTICES.includes(advance)) {
      onUpdate({ advanceNotices: settings.advanceNotices.filter((a) => a !== advance) });
    }
  };

  return (
    <div className={`timer-settings ${!settings.enabled ? 'disabled' : ''}`}>
      <div className="settings-header">
        <h2>타이머 설정</h2>
        <label className={`toggle-switch ${!settings.enabled ? 'inactive' : ''}`}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdate({ enabled: e.target.checked })}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            {settings.enabled ? '활성화' : '비활성화'}
          </span>
        </label>
      </div>

      {!settings.enabled && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">타이머가 비활성화되어 있습니다. 알람이 울리지 않습니다.</span>
        </div>
      )}

      <div className="setting-section">
        <div className="section-header">
          <h3>알람 시간</h3>
          <p className="section-description">매 시간마다 울릴 분을 선택하세요</p>
        </div>

        <div className="quick-select-grid">
          {QUICK_ALARM_MINUTES.map((minute) => (
            <button
              key={minute}
              className={`quick-select-btn ${settings.alarmMinutes.includes(minute) ? 'active' : ''}`}
              onClick={() => toggleAlarmMinute(minute)}
            >
              {minute}분
            </button>
          ))}
        </div>

        {settings.alarmMinutes.filter(m => !QUICK_ALARM_MINUTES.includes(m)).length > 0 && (
          <div className="custom-items">
            <span className="custom-label">커스텀:</span>
            {settings.alarmMinutes
              .filter(m => !QUICK_ALARM_MINUTES.includes(m))
              .map((minute) => (
                <div key={minute} className="custom-chip">
                  <span>{minute}분</span>
                  <button onClick={() => removeCustomAlarmMinute(minute)}>×</button>
                </div>
              ))}
          </div>
        )}

        {!showCustomAlarm ? (
          <button className="add-custom-btn" onClick={() => setShowCustomAlarm(true)}>
            + 다른 시간 추가
          </button>
        ) : (
          <div className="custom-input-row">
            <input
              type="number"
              min="0"
              max="59"
              value={customAlarmMinute}
              onChange={(e) => setCustomAlarmMinute(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomAlarmMinute();
                if (e.key === 'Escape') setShowCustomAlarm(false);
              }}
              placeholder="분 (0-59)"
              autoFocus
            />
            <button onClick={addCustomAlarmMinute} className="confirm-btn">추가</button>
            <button onClick={() => setShowCustomAlarm(false)} className="cancel-btn">취소</button>
          </div>
        )}
      </div>

      <div className="setting-section">
        <div className="section-header">
          <h3>사전 알림</h3>
          <p className="section-description">알람 전에 미리 알림을 받을 시간</p>
        </div>

        <div className="quick-select-grid">
          {QUICK_ADVANCE_NOTICES.map((advance) => (
            <button
              key={advance}
              className={`quick-select-btn ${settings.advanceNotices.includes(advance) ? 'active' : ''}`}
              onClick={() => toggleAdvanceNotice(advance)}
            >
              {advance}분 전
            </button>
          ))}
        </div>

        {settings.advanceNotices.filter(a => !QUICK_ADVANCE_NOTICES.includes(a)).length > 0 && (
          <div className="custom-items">
            <span className="custom-label">커스텀:</span>
            {settings.advanceNotices
              .filter(a => !QUICK_ADVANCE_NOTICES.includes(a))
              .map((advance) => (
                <div key={advance} className="custom-chip">
                  <span>{advance}분 전</span>
                  <button onClick={() => removeCustomAdvanceNotice(advance)}>×</button>
                </div>
              ))}
          </div>
        )}

        {!showCustomAdvance ? (
          <button className="add-custom-btn" onClick={() => setShowCustomAdvance(true)}>
            + 다른 시간 추가
          </button>
        ) : (
          <div className="custom-input-row">
            <input
              type="number"
              min="1"
              max="59"
              value={customAdvanceNotice}
              onChange={(e) => setCustomAdvanceNotice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomAdvanceNotice();
                if (e.key === 'Escape') setShowCustomAdvance(false);
              }}
              placeholder="분 (1-59)"
              autoFocus
            />
            <button onClick={addCustomAdvanceNotice} className="confirm-btn">추가</button>
            <button onClick={() => setShowCustomAdvance(false)} className="cancel-btn">취소</button>
          </div>
        )}
      </div>

      <div className="setting-section">
        <div className="section-header">
          <h3>경기 시작 알림</h3>
          <p className="section-description">경기 시작 10초 전 알림 기능</p>
        </div>

        <label className={`toggle-switch ${!settings.gameStartNotice ? 'inactive' : ''}`}>
          <input
            type="checkbox"
            checked={settings.gameStartNotice}
            onChange={(e) => onUpdate({ gameStartNotice: e.target.checked })}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            {settings.gameStartNotice ? '활성화' : '비활성화'}
          </span>
        </label>
      </div>

      <div className="setting-section">
        <div className="section-header">
          <h3>알람 사운드</h3>
          <p className="section-description">알람 소리를 선택하고 미리 들어보세요</p>
        </div>

        <div className="sound-selector">
          {ALARM_SOUNDS.map((sound) => (
            <button
              key={sound.value}
              className={`sound-option ${settings.alarmSound === sound.value ? 'active' : ''}`}
              onClick={() => onUpdate({ alarmSound: sound.value })}
            >
              <span className="sound-icon">{sound.icon}</span>
              <span className="sound-label">{sound.label}</span>
              <button
                className="play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  playTestSound(sound.value);
                }}
              ></button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerSettings;
