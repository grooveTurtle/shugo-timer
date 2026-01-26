import { useEffect, useRef } from 'react';
import { AlarmSchedulerProps, ContentType } from '@/types';
import { GAME_START_NOTICE_SECONDS, CONTENT_LIST } from '@/constants';

export const useAlarmScheduler = ({ settings, onAlarm, onGameStartNotice }: AlarmSchedulerProps) => {
  const intervalRef = useRef<number | null>(null);
  const notifiedAlarmsRef = useRef<Set<string>>(new Set());
  const onAlarmRef = useRef(onAlarm);
  const onGameStartNoticeRef = useRef(onGameStartNotice);

  // 콜백이 변경되면 ref 업데이트
  useEffect(() => {
    onAlarmRef.current = onAlarm;
  }, [onAlarm]);

  useEffect(() => {
    onGameStartNoticeRef.current = onGameStartNotice;
  }, [onGameStartNotice]);

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

      // 모든 활성화된 컨텐츠를 순회
      (Object.keys(settings.contentSettings) as ContentType[]).forEach(contentId => {
        const contentConfig = settings.contentSettings[contentId];
        const contentInfo = CONTENT_LIST.find(c => c.id === contentId);

        // 비활성화되었거나 옵션이 선택되지 않은 컨텐츠는 스킵
        if (!contentConfig.enabled || contentConfig.options.length === 0 || !contentInfo) {
          return;
        }

        // 컨텐츠별 알람 시간 계산
        const alarmTimes = contentInfo.getAlarmTimes(contentConfig.options);

        alarmTimes.forEach(({ hour: alarmHour, minute: alarmMinute }) => {
          // 슈고 페스타: 매 시간 해당 분에 알람 (hour는 무시)
          // 시공의 균열: 특정 시간에만 알람 (hour 체크)
          const isTimeMatch = contentId === 'shugo'
            ? currentMinute === alarmMinute
            : currentHour === alarmHour && currentMinute === alarmMinute;

          // 메인 알람 체크 (해당 분의 처음 5초 이내에 체크)
          if (isTimeMatch && currentSecond < 5) {
            const alarmKey = `${currentHour}:${alarmMinute}:${contentId}:main`;
            if (!notifiedAlarmsRef.current.has(alarmKey)) {
              notifiedAlarmsRef.current.add(alarmKey);

              const message = contentId === 'shugo'
                ? `${currentHour}시 ${alarmMinute}분 슈고 페스타가 열렸습니다!`
                : `${currentHour}시 시공의 균열이 열렸습니다!`;

              onAlarmRef.current(message, false);

              setTimeout(() => {
                notifiedAlarmsRef.current.delete(alarmKey);
              }, 60000);
            }
          }

          // 사전 알림 체크
          settings.advanceNotices.forEach((advance) => {
            let advanceHour = alarmHour;
            let advanceMinute = alarmMinute - advance;

            // 분이 음수인 경우 시간 조정
            if (advanceMinute < 0) {
              advanceMinute += 60;
              advanceHour = (advanceHour - 1 + 24) % 24;
            }

            const isAdvanceTimeMatch = contentId === 'shugo'
              ? currentMinute === advanceMinute
              : currentHour === advanceHour && currentMinute === advanceMinute;

            // 사전 알림도 해당 분의 처음 5초 이내에 체크
            if (isAdvanceTimeMatch && currentSecond < 5) {
              const advanceKey = `${currentHour}:${advanceMinute}:${contentId}:advance${advance}`;
              if (!notifiedAlarmsRef.current.has(advanceKey)) {
                notifiedAlarmsRef.current.add(advanceKey);

                const contentName = contentInfo.name;
                onAlarmRef.current(`${advance}분 후 ${contentName} 예정`, true);

                setTimeout(() => {
                  notifiedAlarmsRef.current.delete(advanceKey);
                }, 60000);
              }
            }
          });

          // 경기 시작 알림 체크 (슈고 페스타 전용, 선택된 시간에만)
          if (contentId === 'shugo' && settings.gameStartNotice && onGameStartNoticeRef.current) {
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
              // alarmMinute을 키에 포함하여 15분/45분 알림을 구분
              const gameStartKey = `${currentHour}:${alarmMinute}:gamestart`;
              if (!notifiedAlarmsRef.current.has(gameStartKey)) {
                notifiedAlarmsRef.current.add(gameStartKey);
                onGameStartNoticeRef.current?.('10초 후 경기 시작! 준비하세요!');

                setTimeout(() => {
                  notifiedAlarmsRef.current.delete(gameStartKey);
                }, 60000);
              }
            }
          }
        });
      });
    };

    checkAlarms();

    intervalRef.current = window.setInterval(checkAlarms, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings]);
};
