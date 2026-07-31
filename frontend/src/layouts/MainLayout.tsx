import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { parseDate } from '../utils/date';
import { LayoutDashboard, 
  Building2, 
  Users, 
  ClipboardList, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Check,
  X
} from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, activeToast, setActiveToast } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Assignments', path: '/assignments', icon: ClipboardList },
    { name: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xl font-bold tracking-wider text-sky-400">CRM Live</span>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-950 text-sky-300 border border-sky-800 uppercase">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-sky-500 text-white font-medium shadow-lg shadow-sky-500/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-sky-600' : 'bg-rose-500 text-white'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl mb-3 border border-slate-800/80">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-bold border border-slate-600">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-900/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-100 capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-6 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800/60 transition-all border border-slate-800 hover:border-slate-700 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900 transform translate-x-1.5 -translate-y-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                      <span className="font-semibold text-slate-100">Recent Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-medium">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 transition-colors flex gap-3 items-start ${
                              notif.is_read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/30 text-slate-200'
                            }`}
                          >
                            <div className="flex-1 text-xs leading-relaxed">
                              {notif.message}
                              <p className="text-[10px] text-slate-500 mt-1">
                                {parseDate(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="p-1 rounded bg-sky-950 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-800/60 transition-all shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="block p-3 border-t border-slate-800 text-center text-xs font-semibold text-sky-400 hover:bg-slate-800/40 hover:text-sky-300 transition-colors"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden md:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Real-time Toast Notification Alert */}
        {activeToast && (
          <div className="fixed top-6 right-6 z-[100] max-w-sm w-full bg-slate-900 border border-sky-500/40 shadow-2xl shadow-sky-500/10 rounded-2xl p-4 flex gap-4 items-start animate-slide-in backdrop-blur-md">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="font-bold text-sm text-sky-400 block mb-0.5">New Assignment Notification</span>
              <p className="text-xs text-slate-200 leading-relaxed truncate-2-lines">{activeToast.message}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
