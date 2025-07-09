"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  AdminUser, 
  getAllAdminUsers, 
  toggleAdminStatus as toggleAdminStatusService, 
  deleteAdminUser as deleteAdminUserService 
} from "@/lib/supabase/admin";

// 通知类型
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

// 通知组件
function NotificationContainer({ notifications, onClose }: {
  notifications: Notification[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
          </div>
          <button 
            onClick={() => onClose(notification.id)}
            className="notification-close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// 确认对话框组件
function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  type = 'default'
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'default' | 'danger';
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-dialog">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-content">
          <p>{message}</p>
          <div className="confirm-actions">
            <button 
              onClick={onConfirm} 
              className={`confirm-btn ${type === 'danger' ? 'danger' : ''}`}
            >
              确认
            </button>
            <button onClick={onCancel} className="cancel-btn">取消</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'default' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'default',
    onConfirm: () => {}
  });

  // 通知函数
  const showNotification = (type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, title, message };
    setNotifications(prev => [...prev, notification]);
    
    // 4秒后自动关闭
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAdminUsers();
      setUsers(data);
      if (data.length === 0) {
        showNotification('info', '空白状态', '系统中暂无用户数据');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('error', '获取失败', '无法获取用户列表，请检查网络连接或联系管理员');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdminStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? '撤销' : '授予';
    const newStatus = !currentStatus;
    
    setConfirmDialog({
      isOpen: true,
      title: `${action}管理员权限`,
      message: `确定要${action}用户 "${userName}" 的管理员权限吗？`,
      type: currentStatus ? 'danger' : 'default',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        try {
          const success = await toggleAdminStatusService(userId, newStatus);
          if (success) {
            // Update local state
            setUsers(users.map(user => 
              user.user_id === userId 
                ? { ...user, is_admin: newStatus }
                : user
            ));
            showNotification('success', '权限更新成功', `用户 "${userName}" 的管理员权限已${action}`);
          } else {
            showNotification('error', '权限更新失败', '更新用户权限时发生错误，请重试');
          }
        } catch (error) {
          console.error('Error toggling admin status:', error);
          showNotification('error', '权限更新失败', '更新用户权限时发生错误：' + (error instanceof Error ? error.message : '未知错误'));
        }
      }
    });
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除用户',
      message: `确定要删除用户 "${userName}" 吗？此操作不可逆转，将永久删除用户的所有数据。`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        try {
          const success = await deleteAdminUserService(userId);
          if (success) {
            // Update local state
            setUsers(users.filter(user => user.user_id !== userId));
            showNotification('success', '删除成功', `用户 "${userName}" 已成功删除`);
          } else {
            showNotification('error', '删除失败', '删除用户时发生错误，可能由于权限限制或数据依赖');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          showNotification('error', '删除失败', '删除用户时发生错误：' + (error instanceof Error ? error.message : '未知错误'));
        }
      }
    });
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="users-page">
        <section className="section-header">
          <h2>用户管理</h2>
          <p>管理系统用户和权限</p>
        </section>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>正在加载用户数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <NotificationContainer notifications={notifications} onClose={closeNotification} />
      
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <section className="section-header">
        <h2>用户管理</h2>
        <p>管理系统用户和权限</p>
      </section>

      <div className="users-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索用户姓名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchUsers} className="refresh-btn" title="刷新用户列表">
            🔄
          </button>
        </div>
        <div className="stats-summary">
          <span className="stat-item">
            <strong>总用户:</strong> {users.length}
          </span>
          <span className="stat-item">
            <strong>管理员:</strong> {users.filter(u => u.is_admin).length}
          </span>
          <span className="stat-item">
            <strong>普通用户:</strong> {users.filter(u => !u.is_admin).length}
          </span>
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell">用户信息</div>
            <div className="table-cell">邮箱</div>
            <div className="table-cell">权限</div>
            <div className="table-cell">最后登录</div>
            <div className="table-cell">注册时间</div>
            <div className="table-cell">操作</div>
          </div>
        </div>
        <div className="table-body">
          {filteredUsers.map(user => {
            const userName = user.name || user.email.split('@')[0];
            return (
              <div key={user.id} className="table-row">
                <div className="table-cell" data-label="用户信息">
                  <div className="user-info">
                    <div className="name">{userName}</div>
                    <div className="user-id">ID: {user.user_id.substring(0, 8)}...</div>
                  </div>
                </div>
                <div className="table-cell" data-label="邮箱">
                  <div className="email">{user.email}</div>
                </div>
                <div className="table-cell" data-label="权限">
                  <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                    {user.is_admin ? '管理员' : '普通用户'}
                  </span>
                </div>
                <div className="table-cell" data-label="最后登录">
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleString()
                    : '从未登录'
                  }
                </div>
                <div className="table-cell" data-label="注册时间">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div className="table-cell" data-label="操作">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleToggleAdminStatus(user.user_id, user.is_admin, userName)}
                      className={`role-btn ${user.is_admin ? 'revoke' : 'grant'}`}
                    >
                      {user.is_admin ? '撤销管理员' : '授予管理员'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.user_id, userName)}
                      className="delete-btn"
                    >
                      删除用户
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="empty-state">
          <p>😔 没有找到符合条件的用户</p>
          <p>请尝试修改搜索条件或清空搜索框</p>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="empty-state">
          <p>🎉 系统中暂无用户数据</p>
          <p>当有用户注册时，他们将在此处显示</p>
        </div>
      )}
    </div>
  );
} 