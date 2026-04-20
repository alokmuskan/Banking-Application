import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500" />,
  error:   <AlertCircle size={16} className="text-red-500" />,
  info:    <Info size={16} className="text-blue-500" />,
  warning: <AlertCircle size={16} className="text-amber-500" />,
};

const borders = {
  success: 'border-l-emerald-500',
  error:   'border-l-red-500',
  info:    'border-l-blue-500',
  warning: 'border-l-amber-500',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-full">
        {toasts.map(toast => (
          <div key={toast.id}
            className={`flex items-start gap-3 bg-white border-l-4 ${borders[toast.type] || borders.info} rounded-lg shadow-card-md p-4 animate-slide-in`}>
            <span className="mt-0.5 flex-shrink-0">{icons[toast.type] || icons.info}</span>
            <span className="text-sm text-slate-700 flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-slate-300 hover:text-slate-500 transition flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
