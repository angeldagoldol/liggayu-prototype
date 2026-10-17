import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import { spring } from '../lib/motion.js';
import styles from './Toast.module.css';

const ToastContext = createContext(null);
const ICONS = { success: Check, error: CircleAlert, default: Info };

/**
 * App-wide toasts.
 *   const toast = useToast();
 *   toast({ title: 'Saved', description: 'Your brochure is live.', tone: 'success' });
 * tone: 'default' | 'success' | 'error'; duration in ms (default 4200, 0 = sticky)
 * action: optional { label, onClick } button inside the toast. Returns the toast id.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  // Toasts render into the fullscreen element while one is active (the
  // reader's fullscreen mode); anything portalled to <body> would be hidden.
  const [host, setHost] = useState(() => document.fullscreenElement ?? document.body);

  useEffect(() => {
    const onChange = () => setHost(document.fullscreenElement ?? document.webkitFullscreenElement ?? document.body);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ title, description, tone = 'default', duration = 4200, action }) => {
      const id = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((list) => [...list.slice(-3), { id, title, description, tone, action }]);
      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className={styles.viewport} role="region" aria-label="Notifications" data-print="hide">
          <ol className={styles.list} aria-live="polite">
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const Icon = ICONS[t.tone] ?? Info;
                return (
                  <motion.li
                    key={t.id}
                    layout
                    className={styles.toast}
                    data-tone={t.tone}
                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: spring.snappy }}
                    exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                    role={t.tone === 'error' ? 'alert' : 'status'}
                  >
                    <span className={styles.icon} aria-hidden="true">
                      <Icon size={16} strokeWidth={2.25} />
                    </span>
                    <div className={styles.body}>
                      <p className={styles.title}>{t.title}</p>
                      {t.description && <p className={styles.description}>{t.description}</p>}
                      {t.action && (
                        <button
                          type="button"
                          className={styles.action}
                          onClick={() => {
                            t.action.onClick();
                            dismiss(t.id);
                          }}
                        >
                          {t.action.label}
                        </button>
                      )}
                    </div>
                    <button type="button" className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
                      <X size={14} />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </div>,
        host,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
