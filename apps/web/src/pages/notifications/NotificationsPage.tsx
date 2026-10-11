import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/Button.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  ListTodo 
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const response = await api.notifications.list({ page: currentPage, unreadOnly: filter === 'unread' });
      setNotifications(response.notifications || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page, filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <ListTodo className="h-5 w-5 text-brand-600" />;
      case 'comment_added':
        return <MessageSquare className="h-5 w-5 text-brand-600" />;
      case 'user_joined':
        return <UserPlus className="h-5 w-5 text-brand-600" />;
      default:
        return <Bell className="h-5 w-5 text-brand-600" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your workspace activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4 flex space-x-6">
          <button
            onClick={() => { setFilter('all'); setPage(1); }}
            className={`text-sm font-medium pb-4 -mb-4 ${filter === 'all' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => { setFilter('unread'); setPage(1); }}
            className={`text-sm font-medium pb-4 -mb-4 ${filter === 'unread' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Unread
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description={filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
              />
            </div>
          ) : (
            notifications.map((notification) => {
              const isRead = !!notification.readAt;
              return (
                <div 
                  key={notification.id} 
                  className={`p-6 flex items-start space-x-4 transition-colors ${isRead ? 'bg-white' : 'bg-brand-50/50'}`}
                >
                  <div className={`p-2 rounded-full ${isRead ? 'bg-gray-100' : 'bg-brand-100'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notification.title}: {notification.body}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                  </div>
                  {!isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {!isLoading && total > 20 && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <Button
              variant="outline"
              disabled={page * 20 >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
