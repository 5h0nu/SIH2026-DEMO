import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        let bgStyle = 'bg-slate-900/95 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 shadow-emerald-900/20';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-900/20';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-950/95 text-amber-100 border-amber-500/50 shadow-amber-900/20';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start space-x-2.5 p-3.5 rounded-2xl border text-xs shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-auto transform translate-y-0 ${bgStyle}`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
};
