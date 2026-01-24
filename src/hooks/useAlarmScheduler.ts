import { useEffect, useRef } from 'react';
import { AlarmSchedulerProps } from '@/types';
import { GAME_START_NOTICE_SECONDS } from '@/constants';

export const useAlarmScheduler = ({ settings, onAlarm, onGameStartNotice }: AlarmSchedulerProps) => {
  const intervalRef = useRef<number | null>(null);
  const notifiedAlarmsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      settings.alarmMinutes.forEach((alarmMinute) => {
        // 메인 알람 체크
        if (currentMinute === alarmMinute && currentSecond === 0) {
          const alarmKey = `${currentHour}:${currentMinute}:main`;
          if (!notifiedAlarmsRef.current.has(alarmKey)) {
            notifiedAlarmsRef.current.add(alarmKey);
            onAlarm(`${currentHour}시 ${alarmMinute}분 슈고 페스타가 열렸습니다!`, false);

            setTimeout(() => {
              notifiedAlarmsRef.current.delete(alarmKey);
            }, 60000);
          }
        }

        // 사전 알림 체크
        settings.advanceNotices.forEach((advance) => {
          const advanceMinute = (alarmMinute - advance + 60) % 60;

          if (currentMinute === advanceMinute && currentSecond === 0) {
            const advanceKey = `${currentHour}:${currentMinute}:advance${advance}`;
            if (!notifiedAlarmsRef.current.has(advanceKey)) {
              notifiedAlarmsRef.current.add(advanceKey);
              onAlarm(`${advance}분 후 슈고 페스타 예정`, true);

              setTimeout(() => {
                notifiedAlarmsRef.current.delete(advanceKey);
              }, 60000);
            }
          }
        });

        // 경기 시작 알림 체크
        if (settings.gameStartNotice && onGameStartNotice) {
          // 알람 시간으로부터 170초 후 시간 계산
          const alarmTimeInSeconds = alarmMinute * 60;
          const gameStartNoticeTime = alarmTimeInSeconds + GAME_START_NOTICE_SECONDS;

          // 60분을 넘어갈 경우 다음 시간대로 조정
          const adjustedNoticeTime = gameStartNoticeTime >= 3600
            ? gameStartNoticeTime - 3600
            : gameStartNoticeTime;

          const noticeMinute = Math.floor(adjustedNoticeTime / 60);
          const noticeSecond = adjustedNoticeTime % 60;

          if (currentMinute === noticeMinute && currentSecond === noticeSecond) {
            const gameStartKey = `${currentHour}:${currentMinute}:${currentSecond}:gamestart`;
            if (!notifiedAlarmsRef.current.has(gameStartKey)) {
              notifiedAlarmsRef.current.add(gameStartKey);
              onGameStartNotice('10초 후 경기 시작! 준비하세요!');

              setTimeout(() => {
                notifiedAlarmsRef.current.delete(gameStartKey);
              }, 60000);
            }
          }
        }
      });
    };

    checkAlarms();

    intervalRef.current = window.setInterval(checkAlarms, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings, onAlarm, onGameStartNotice]);
};
