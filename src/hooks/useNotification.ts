import { useEffect, useState, useCallback, useRef } from 'react';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const onDismissRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  // onDismiss 콜백 등록
  const setOnDismiss = useCallback((callback: () => void) => {
    onDismissRef.current = callback;
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'shugo-timer',
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        // 알림 클릭 시 모달도 닫기
        if (onDismissRef.current) {
          onDismissRef.current();
        }
      };

      setTimeout(() => notification.close(), 10000);
    }
  }, [permission]);

  return { permission, requestPermission, showNotification, setOnDismiss };
};
