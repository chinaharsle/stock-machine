"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminUser } from "@/lib/supabase/admin";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('admin_users')
        .update({ is_admin: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, is_admin: !currentStatus }
          : user
      ));

      alert(`用户管理员权限已${!currentStatus ? '授予' : '撤销'}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('更新用户权限失败');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？此操作不可逆。')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.filter(user => user.user_id !== userId));
      alert('用户已删除');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('删除用户失败');
    }
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
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <section className="section-header">
        <h2>用户管理</h2>
        <p>管理系统用户和权限</p>
      </section>

      <div className="users-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="stats-summary">
          <span className="stat-item">
            总用户: {users.length}
          </span>
          <span className="stat-item">
            管理员: {users.filter(u => u.is_admin).length}
          </span>
          <span className="stat-item">
            普通用户: {users.filter(u => !u.is_admin).length}
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
          {filteredUsers.map(user => (
            <div key={user.id} className="table-row">
              <div className="table-cell">
                <div className="user-info">
                  <div className="name">{user.name || user.email.split('@')[0]}</div>
                  <div className="user-id">ID: {user.user_id.substring(0, 8)}...</div>
                </div>
              </div>
              <div className="table-cell">
                <div className="email">{user.email}</div>
              </div>
              <div className="table-cell">
                <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                  {user.is_admin ? '管理员' : '普通用户'}
                </span>
              </div>
              <div className="table-cell">
                {user.last_login 
                  ? new Date(user.last_login).toLocaleString()
                  : '从未登录'
                }
              </div>
              <div className="table-cell">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <div className="table-cell">
                <button
                  onClick={() => toggleAdminStatus(user.user_id, user.is_admin)}
                  className={`role-btn ${user.is_admin ? 'revoke' : 'grant'}`}
                >
                  {user.is_admin ? '撤销管理员' : '授予管理员'}
                </button>
                <button
                  onClick={() => deleteUser(user.user_id)}
                  className="delete-btn"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <p>没有找到符合条件的用户</p>
        </div>
      )}
    </div>
  );
} 