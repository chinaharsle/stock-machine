import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  // 创建撒花效果
  const createConfetti = useCallback(() => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    // 创建多个撒花片
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
      confetti.style.backgroundColor = getRandomColor();
      confettiContainer.appendChild(confetti);
    }

    // 3秒后清除撒花效果
    setTimeout(() => {
      confettiContainer.remove();
    }, 3000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    
    // 如果是成功提示，添加撒花效果
    if (type === 'success') {
      createConfetti();
    }
    
    return () => clearTimeout(timer);
  }, [onClose, duration, type, createConfetti]);

  const getRandomColor = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#e17055'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
          {type === 'warning' && '⚠'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
} 