import React, { useState, useEffect, useCallback } from 'react';
import './ShortcutSettings.css';

interface Shortcuts {
  toggleTimer: string;
  showWindow: string;
}

const ShortcutSettings: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<Shortcuts>({
    toggleTimer: 'CommandOrControl+Shift+W',
    showWindow: 'CommandOrControl+Shift+Q',
  });
  const [isEditing, setIsEditing] = useState<keyof Shortcuts | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const [isElectron, setIsElectron] = useState(false);

  // Electron 환경인지 확인하고 단축키 로드
  useEffect(() => {
    const loadShortcuts = async () => {
      if (window.electronAPI) {
        setIsElectron(true);
        try {
          const loaded = await window.electronAPI.getShortcuts();
          setShortcuts(loaded);
        } catch (error) {
          console.error('단축키 로드 실패:', error);
        }
      }
    };

    loadShortcuts();
  }, []);

  const startEditing = (key: keyof Shortcuts) => {
    setIsEditing(key);
    setEditValue(shortcuts[key]);
    setError('');
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditValue('');
    setError('');
  };

  const saveShortcut = useCallback(async (key: keyof Shortcuts) => {
    if (!window.electronAPI || !editValue.trim()) {
      return;
    }

    try {
      // 유효성 검사
      const validation = await window.electronAPI.validateShortcut(editValue);

      if (!validation.valid) {
        setError(validation.error || '유효하지 않은 단축키입니다.');
        return;
      }

      // 단축키 저장
      const newShortcuts = { ...shortcuts, [key]: editValue };
      const result = await window.electronAPI.setShortcuts(newShortcuts);

      if (result.success) {
        setShortcuts(newShortcuts);
        setIsEditing(null);
        setEditValue('');
        setError('');
      }
    } catch (error) {
      console.error('단축키 저장 실패:', error);
      setError('단축키 저장에 실패했습니다.');
    }
  }, [editValue, shortcuts]);

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof Shortcuts) => {
    e.preventDefault();

    console.log('key:::', key);

    const keys: string[] = [];

    if (e.ctrlKey || e.metaKey) keys.push('CommandOrControl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');

    // 특수 키가 아닌 경우에만 키 추가
    if (e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Shift') {
      keys.push(e.key.toUpperCase());
    }

    if (keys.length > 1) {
      const shortcut = keys.join('+');
      setEditValue(shortcut);
    }
  };

  if (!isElectron) {
    return null; // 브라우저 환경에서는 표시하지 않음
  }

  const shortcutLabels = {
    toggleTimer: '타이머 토글',
    showWindow: '창 표시/숨김',
  };

  const shortcutDescriptions = {
    toggleTimer: '타이머를 활성화/비활성화합니다',
    showWindow: '앱 창을 표시하거나 숨깁니다',
  };

  // 단축키를 사용자 친화적으로 표시
  const formatShortcut = (shortcut: string) => {
    return shortcut.replace('CommandOrControl', 'Ctrl');
  };

  return (
    <div className="shortcut-settings">
      <div className="settings-header">
        <h2>단축키</h2>
      </div>

      <div className="shortcut-list">
        {(Object.keys(shortcuts) as Array<keyof Shortcuts>).map((key) => (
          <div key={key} className="shortcut-item">
            <div className="shortcut-info">
              <div className="shortcut-label">{shortcutLabels[key]}</div>
              <div className="shortcut-description">{shortcutDescriptions[key]}</div>
            </div>

            <div className="shortcut-input-container">
              {isEditing === key ? (
                <>
                  <input
                    type="text"
                    className="shortcut-input"
                    value={formatShortcut(editValue)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    placeholder="단축키를 입력하세요"
                    autoFocus
                    readOnly
                  />
                  <button
                    className="shortcut-btn save-btn"
                    onClick={() => saveShortcut(key)}
                  >
                    저장
                  </button>
                  <button
                    className="shortcut-btn cancel-btn"
                    onClick={cancelEditing}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <div className="shortcut-display">{formatShortcut(shortcuts[key])}</div>
                  <button
                    className="shortcut-btn edit-btn"
                    onClick={() => startEditing(key)}
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="shortcut-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ShortcutSettings;
