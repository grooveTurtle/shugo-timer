import React, { useEffect, useRef } from 'react';
import { AlarmModalProps } from '@/types';
import './AlarmModal.css';

const AlarmModal: React.FC<AlarmModalProps> = ({ isOpen, title, message, soundType, duration, onDismiss }) => {
  const intervalRef = useRef<number | null>(null);
  const autoDismissRef = useRef<number | null>(null);
  const onDismissRef = useRef(onDismiss);

  // onDismiss가 변경되면 ref 업데이트
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
        autoDismissRef.current = null;
      }
      return;
    }

    // 사운드 재생 함수를 동적으로 import
    import('../utils/soundGenerator').then(({ soundGenerator }) => {
      // 즉시 한 번 재생
      soundGenerator.play(soundType, 0.7);

      // 3초마다 반복 재생
      intervalRef.current = window.setInterval(() => {
        soundGenerator.play(soundType, 0.7);
      }, 3000);
    });

    // 설정된 시간 후 자동 종료 (초 단위를 밀리초로 변환)
    autoDismissRef.current = window.setTimeout(() => {
      onDismissRef.current();
    }, duration * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
        autoDismissRef.current = null;
      }
    };
  }, [isOpen, soundType, duration]);

  if (!isOpen) return null;

  return (
    <div className="alarm-modal-overlay" onClick={onDismiss}>
      <div className="alarm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alarm-modal-icon">
          {title.includes('사전') ? '⏰' : '🔔'}
        </div>
        <h2 className="alarm-modal-title">{title}</h2>
        <p className="alarm-modal-message">{message}</p>
        <button className="alarm-modal-dismiss" onClick={onDismiss}>
          확인
        </button>
      </div>
    </div>
  );
};

export default AlarmModal;
