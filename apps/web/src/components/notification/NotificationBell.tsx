import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCount = async () => {
    try {
      const data = await api.notifications.unreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const data = await api.notifications.list({ limit: 8 });
      setNotifications(data.notifications || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 20000); // Poll unread count every 20s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchList();
      fetchCount();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (n: any) => {
    setIsOpen(false);
    if (!n.readAt) {
      api.notifications.markRead(n.id).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.resourceType === 'task') {
      navigate('/app/tasks');
    } else if (n.resourceType === 'project' && n.resourceId) {
      navigate(`/app/projects/${n.resourceId}`);
    } else {
      navigate('/app/notifications');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">You're completely up to date!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start justify-between gap-3 p-3.5 cursor-pointer transition-colors ${
                      n.readAt ? 'hover:bg-slate-50' : 'bg-brand-50/40 hover:bg-brand-50/70'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${n.readAt ? 'text-slate-800' : 'text-slate-900'}`}>
                          {n.title}
                        </span>
                        {!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-brand-600 shrink-0" />}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{n.body}</p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {!n.readAt && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 shrink-0"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/notifications');
                }}
                className="text-xs font-medium text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
              >
                View all notifications
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
