// Timer 관련 타입 정의

// 컨텐츠 타입 정의
export type ContentType = 'shugo' | 'sigong';

// 컨텐츠별 설정
export interface ContentSettings {
  enabled: boolean;
  options: number[]; // 컨텐츠별 선택 가능한 옵션 (슈고: 15분/45분 선택, 시공: 특정 시간대 선택 등)
}

export interface TimerSettings {
  // 컨텐츠별 설정 (다중 선택 가능 - enabled로 활성화 여부 결정)
  contentSettings: Record<ContentType, ContentSettings>;
  // 공통 설정
  advanceNotices: number[];
  gameStartNotice: boolean;
  alarmSound: string;
  enabled: boolean;
}

export interface TimerSettingsProps {
  settings: TimerSettings;
  onUpdate: (settings: Partial<TimerSettings>) => void;
}

export interface AlarmSchedulerProps {
  settings: TimerSettings;
  onAlarm: (message: string, isAdvance: boolean) => void;
  onGameStartNotice?: (message: string) => void;
}

// 컨텐츠 정보 타입
export interface ContentInfo {
  id: ContentType;
  name: string;
  description: string;
  // 알람이 울릴 시간들을 반환하는 함수 (현재 시간 기준)
  getAlarmTimes: (options: number[]) => { hour: number; minute: number }[];
}
