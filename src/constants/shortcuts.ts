import { Shortcuts } from '@/types';

export const DEFAULT_SHORTCUTS: Shortcuts = {
  dismissAlarm: 'CommandOrControl+Shift+Z',
  toggleTimer: 'CommandOrControl+Shift+W',
  showWindow: 'CommandOrControl+Shift+Q',
};

export const SHORTCUT_LABELS: Record<keyof Shortcuts, string> = {
  dismissAlarm: '알람 끄기',
  toggleTimer: '타이머 기능 토글',
  showWindow: '창 표시/숨기기',
};

export const SHORTCUT_DESCRIPTIONS: Record<keyof Shortcuts, string> = {
  dismissAlarm: '알람이 울렸을 경우 즉시 알람을 끕니다.',
  toggleTimer: '타이머 기능을 활성화/비활성화합니다',
  showWindow: '창을 표시하거나 숨깁니다',
};
