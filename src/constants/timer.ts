import { TimerSettings } from '@/types';

// 기본 타이머 설정
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  alarmMinutes: [15, 45],
  advanceNotices: [3, 5],
  gameStartNotice: true,
  alarmSound: 'urgent',
  enabled: true,
};

// 경기 시작 알림 시간 (초 단위) - 알람 시간 기준 2분 50초 후 (3분 중 10초 전)
export const GAME_START_NOTICE_SECONDS = 170; // 2분 50초 = 170초

// 로컬 스토리지 키
export const STORAGE_KEY = 'shugo-timer-settings';

// 빠른 선택 옵션
export const QUICK_ALARM_MINUTES = [0, 15, 30, 45];
export const QUICK_ADVANCE_NOTICES = [1, 3, 5, 10];

// 알람 사운드 옵션
export interface AlarmSoundOption {
  value: string;
  label: string;
  icon: string;
}

export const ALARM_SOUNDS: AlarmSoundOption[] = [
  { value: 'urgent', label: '긴급 알람', icon: '🚨' },
  { value: 'cheerful', label: '명랑한 비프', icon: '🎵' },
  { value: 'classic', label: '클래식 벨', icon: '⏰' },
  { value: 'gentle', label: '부드러운 종', icon: '🔔' },
];
