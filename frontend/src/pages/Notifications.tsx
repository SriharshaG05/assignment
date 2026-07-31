import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { parseDate } from '../utils/date';
import { Bell, Check } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Notifications</h1>
        <p className="text-slate-400 text-xs font-medium">History of assignment alerts and background reminders</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Bell className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm font-medium">No alerts received yet</p>
            <p className="text-xs text-slate-600">Assign a contact to receive instant WebSocket updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  notif.is_read
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                    : 'bg-slate-800/40 border-sky-500/20 text-slate-200 shadow-lg shadow-sky-500/[0.01]'
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  notif.is_read
                    ? 'bg-slate-850 border-slate-800 text-slate-500'
                    : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {parseDate(notif.created_at).toLocaleString()}
                  </p>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/25 rounded-xl text-xs font-bold hover:bg-sky-500 hover:text-white transition-all shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
