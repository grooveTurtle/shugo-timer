import { useState, useEffect } from 'react';
import { TimerSettings } from '@/types';
import { DEFAULT_TIMER_SETTINGS, STORAGE_KEY } from '@/constants';

// 기존 설정을 새 형식으로 마이그레이션
const migrateSettings = (saved: any): TimerSettings => {
  // 기본 설정으로 시작
  const migrated: TimerSettings = {
    ...DEFAULT_TIMER_SETTINGS,
    advanceNotices: saved.advanceNotices || DEFAULT_TIMER_SETTINGS.advanceNotices,
    gameStartNotice: saved.gameStartNotice ?? DEFAULT_TIMER_SETTINGS.gameStartNotice,
    alarmSound: saved.alarmSound || DEFAULT_TIMER_SETTINGS.alarmSound,
    enabled: saved.enabled ?? DEFAULT_TIMER_SETTINGS.enabled,
  };

  // contentSettings가 있으면 마이그레이션
  if (saved.contentSettings) {
    // 기존 selectedContent 기반 형식에서 enabled 기반으로 마이그레이션
    if (saved.selectedContent && !saved.contentSettings.shugo?.hasOwnProperty('enabled')) {
      // 이전 형식: selectedContent로 단일 선택
      Object.keys(saved.contentSettings).forEach(key => {
        if (migrated.contentSettings[key as keyof typeof migrated.contentSettings]) {
          migrated.contentSettings[key as keyof typeof migrated.contentSettings] = {
            enabled: key === saved.selectedContent,
            options: saved.contentSettings[key]?.options || [],
          };
        }
      });
    } else {
      // 새 형식: enabled로 다중 선택
      Object.keys(saved.contentSettings).forEach(key => {
        if (migrated.contentSettings[key as keyof typeof migrated.contentSettings]) {
          migrated.contentSettings[key as keyof typeof migrated.contentSettings] = {
            enabled: saved.contentSettings[key]?.enabled ?? false,
            options: saved.contentSettings[key]?.options || [],
          };
        }
      });
    }
  }

  // 기존 alarmMinutes가 있으면 슈고 페스타 옵션으로 변환
  if (saved.alarmMinutes && Array.isArray(saved.alarmMinutes)) {
    const shugoOptions = saved.alarmMinutes.filter((m: number) => m === 15 || m === 45);
    if (shugoOptions.length > 0) {
      migrated.contentSettings.shugo.enabled = true;
      migrated.contentSettings.shugo.options = shugoOptions;
    }
  }

  return migrated;
};

export const useTimerSettings = () => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return migrateSettings(parsed);
      } catch {
        return DEFAULT_TIMER_SETTINGS;
      }
    }
    return DEFAULT_TIMER_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Electron에 타이머 활성화 상태 전송
    if (window.electronAPI) {
      window.electronAPI.setTimerEnabled(settings.enabled);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
};
