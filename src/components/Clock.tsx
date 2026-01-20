import React, { useState, useEffect, useMemo } from 'react';
import './Clock.css';

interface ClockProps {
  alarmMinutes: number[];
}

const Clock: React.FC<ClockProps> = ({ alarmMinutes }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextAlarms = useMemo(() => {
    const currentMinute = time.getMinutes();
    const currentHour = time.getHours();

    return alarmMinutes
      .map(minute => {
        let hour = currentHour;
        if (minute <= currentMinute) {
          hour = (currentHour + 1) % 24;
        }
        return `${hour}시 ${minute}분`;
      })
      .slice(0, 3);
  }, [time, alarmMinutes]);

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
              <li key={index}>{alarm}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Clock;
