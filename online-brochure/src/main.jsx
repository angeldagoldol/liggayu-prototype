import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { BrochureProvider } from './context/BrochureContext.jsx';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* reducedMotion="user": honour the OS "reduce motion" setting everywhere. */}
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ToastProvider>
          <BrochureProvider>
            <App />
          </BrochureProvider>
        </ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>,
);
