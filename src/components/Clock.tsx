import React, { useState, useEffect, useMemo } from 'react';
import { ClockProps, ContentType } from '@/types';
import { CONTENT_LIST } from '@/constants';
import './Clock.css';

const Clock: React.FC<ClockProps> = ({ settings }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextAlarms = useMemo(() => {
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    const currentSecond = time.getSeconds();
    const currentTotalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

    const upcomingAlarms: { hour: number; minute: number; totalSeconds: number; contentId: ContentType; contentName: string }[] = [];

    // 모든 활성화된 컨텐츠 순회
    (Object.keys(settings.contentSettings) as ContentType[]).forEach(contentId => {
      const contentConfig = settings.contentSettings[contentId];
      const contentInfo = CONTENT_LIST.find(c => c.id === contentId);

      if (!contentConfig.enabled || contentConfig.options.length === 0 || !contentInfo) {
        return;
      }

      const alarmTimes = contentInfo.getAlarmTimes(contentConfig.options);

      if (contentId === 'shugo') {
        // 슈고 페스타: 매 시간마다 해당 분에 알람
        contentConfig.options.forEach(minute => {
          // 현재 시간 기준으로 다음 알람
          let nextHour = currentHour;
          if (minute <= currentMinute) {
            nextHour = (currentHour + 1) % 24;
          }
          let totalSeconds = nextHour * 3600 + minute * 60;
          // 자정 넘어가면 조정
          if (totalSeconds <= currentTotalSeconds) {
            totalSeconds += 86400;
          }
          upcomingAlarms.push({ hour: nextHour, minute, totalSeconds, contentId, contentName: contentInfo.name });

          // 그 다음 시간 알람도 추가
          const afterNextHour = (nextHour + 1) % 24;
          let afterTotalSeconds = afterNextHour * 3600 + minute * 60;
          if (afterTotalSeconds <= currentTotalSeconds) {
            afterTotalSeconds += 86400;
          }
          upcomingAlarms.push({ hour: afterNextHour, minute, totalSeconds: afterTotalSeconds, contentId, contentName: contentInfo.name });
        });
      } else {
        // 시공의 균열: 특정 시간에만 알람
        alarmTimes.forEach(({ hour, minute }) => {
          let totalSeconds = hour * 3600 + minute * 60;
          // 오늘 지나지 않은 알람
          if (totalSeconds > currentTotalSeconds) {
            upcomingAlarms.push({ hour, minute, totalSeconds, contentId, contentName: contentInfo.name });
          }
          // 내일 알람도 추가 (24시간 추가)
          upcomingAlarms.push({ hour, minute, totalSeconds: totalSeconds + 86400, contentId, contentName: contentInfo.name });
        });
      }
    });

    // 정렬 및 중복 제거 후 상위 5개 반환
    return upcomingAlarms
      .sort((a, b) => a.totalSeconds - b.totalSeconds)
      .filter((alarm, index, self) =>
        index === self.findIndex(a => a.hour === alarm.hour && a.minute === alarm.minute && a.contentName === alarm.contentName)
      )
      .slice(0, 5)
      .map(alarm => ({
        time: `${alarm.hour}시 ${String(alarm.minute).padStart(2, '0')}분`,
        contentId: alarm.contentId,
        contentName: alarm.contentName,
      }));
  }, [time, settings]);

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="clock">
      <div className="time">{formatTime(time)}</div>
      <div className="date">{formatDate(time)}</div>
      {nextAlarms.length > 0 && (
        <div className="next-alarms">
          <h4>다음 알람</h4>
          <ul>
            {nextAlarms.map((alarm, index) => (
              <li key={index}>
                <span className="alarm-time">{alarm.time}</span>
                <span className={`alarm-content ${alarm.contentId}`}>{alarm.contentName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {nextAlarms.length === 0 && (
        <div className="next-alarms empty">
          <h4>알람 없음</h4>
          <p>컨텐츠와 시간을 선택해주세요</p>
        </div>
      )}
    </div>
  );
};

export default Clock;
