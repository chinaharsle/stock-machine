"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  lastLogin?: string;
  createdAt: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'admin'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock user data - in real app, this would come from Supabase auth
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    email: 'jimmy@harsle.com',
    name: '管理员',
    role: 'admin',
    lastLogin: '2024-01-15 10:30:00',
    createdAt: '2024-01-01 00:00:00'
  });

  const [profileForm, setProfileForm] = useState({
    name: userProfile.name || '',
    email: userProfile.email
  });

  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: '',
    password: ''
  });

  const [isEmailChangeModalOpen, setIsEmailChangeModalOpen] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically update the profile in Supabase
      setUserProfile({
        ...userProfile,
        name: profileForm.name
      });
      alert('个人资料已更新');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailChangeForm.newEmail)) {
        alert('请输入有效的邮箱地址');
        return;
      }

      // 这里应该调用 Supabase 的邮箱更新API
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: emailChangeForm.newEmail
      });

      if (error) throw error;

      // 更新本地状态
      setUserProfile({
        ...userProfile,
        email: emailChangeForm.newEmail
      });
      
      setProfileForm({
        ...profileForm,
        email: emailChangeForm.newEmail
      });

      setIsEmailChangeModalOpen(false);
      setEmailChangeForm({ newEmail: '', password: '' });
      alert('邮箱已成功更新，请检查新邮箱中的验证邮件');
    } catch (error) {
      console.error('Email change error:', error);
      alert('邮箱更新失败：' + (error instanceof Error ? error.message : '请重试'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新密码与确认密码不匹配');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('新密码至少需要6位字符');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      alert('密码已成功更新');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      alert('密码更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Mock data export
    const data = {
      profile: userProfile,
      exportDate: new Date().toISOString(),
      machines: [], // Would be actual data
      inquiries: [] // Would be actual data
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harsle-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('确定要清除所有缓存数据吗？这将登出当前会话。')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="account-page">
      <section className="section-header">
        <h2>账户管理</h2>
        <p>管理您的账户设置和安全选项</p>
      </section>

      <div className="account-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 个人资料
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 安全设置
        </button>
        <button
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          ⚙️ 系统管理
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="profile-card">
              <h3>基本信息</h3>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>用户ID</label>
                  <input
                    type="text"
                    value={userProfile.id}
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-group">
                  <label>邮箱地址</label>
                  <div className="email-input-group">
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="readonly-input"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEmailChangeModalOpen(true)}
                      className="change-email-btn"
                    >
                      修改邮箱
                    </button>
                  </div>
                  <small>点击"修改邮箱"按钮来更改邮箱地址</small>
                </div>

                <div className="form-group">
                  <label>显示名称</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      name: e.target.value
                    })}
                    placeholder="输入显示名称"
                  />
                </div>

                <div className="form-group">
                  <label>角色</label>
                  <input
                    type="text"
                    value={userProfile.role}
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-group">
                  <label>最后登录</label>
                  <input
                    type="text"
                    value={userProfile.lastLogin || '-'}
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-group">
                  <label>注册时间</label>
                  <input
                    type="text"
                    value={userProfile.createdAt}
                    disabled
                    className="readonly-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="update-btn"
                >
                  {isLoading ? '更新中...' : '更新资料'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="security-card">
              <h3>修改密码</h3>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label>当前密码</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>新密码</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })}
                    minLength={6}
                    required
                  />
                  <small>密码至少需要6位字符</small>
                </div>

                <div className="form-group">
                  <label>确认新密码</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="update-btn"
                >
                  {isLoading ? '更新中...' : '更新密码'}
                </button>
              </form>
            </div>

            <div className="security-card">
              <h3>账户安全</h3>
              <div className="security-options">
                <div className="security-item">
                  <div className="security-info">
                    <h4>两步验证</h4>
                    <p>为您的账户添加额外的安全保护</p>
                  </div>
                  <button className="security-btn disabled">
                    即将推出
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>登录设备管理</h4>
                    <p>查看和管理已登录的设备</p>
                  </div>
                  <button className="security-btn disabled">
                    即将推出
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>登出所有设备</h4>
                    <p>强制登出所有已登录的设备</p>
                  </div>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="admin-tab">
            <div className="admin-card">
              <h3>数据管理</h3>
              <div className="admin-options">
                <div className="admin-item">
                  <div className="admin-info">
                    <h4>导出数据</h4>
                    <p>导出所有系统数据为JSON格式</p>
                  </div>
                  <button onClick={handleExportData} className="admin-btn">
                    📁 导出数据
                  </button>
                </div>

                <div className="admin-item">
                  <div className="admin-info">
                    <h4>清除缓存</h4>
                    <p>清除浏览器缓存和本地存储</p>
                  </div>
                  <button onClick={handleClearCache} className="admin-btn warning">
                    🗑️ 清除缓存
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3>系统信息</h3>
              <div className="system-info">
                <div className="info-item">
                  <label>系统版本:</label>
                  <span>HARSLE Management v2.2.3</span>
                </div>
                <div className="info-item">
                  <label>框架版本:</label>
                  <span>Next.js 15.3.5</span>
                </div>
                <div className="info-item">
                  <label>部署环境:</label>
                  <span>Production</span>
                </div>
                <div className="info-item">
                  <label>最后更新:</label>
                  <span>2024-01-15</span>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3>危险操作</h3>
              <div className="danger-zone">
                <div className="danger-item">
                  <div className="danger-info">
                    <h4>重置系统</h4>
                    <p>⚠️ 这将删除所有数据并重置系统到初始状态</p>
                  </div>
                  <button className="danger-btn" disabled>
                    🚨 重置系统
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Change Modal */}
      {isEmailChangeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>修改邮箱地址</h3>
              <button 
                onClick={() => setIsEmailChangeModalOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEmailChange} className="email-change-form">
              <div className="form-group">
                <label>当前邮箱地址</label>
                <input
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>新邮箱地址</label>
                <input
                  type="email"
                  value={emailChangeForm.newEmail}
                  onChange={(e) => setEmailChangeForm({
                    ...emailChangeForm,
                    newEmail: e.target.value
                  })}
                  placeholder="输入新的邮箱地址"
                  required
                />
              </div>

              <div className="form-group">
                <label>确认密码</label>
                <input
                  type="password"
                  value={emailChangeForm.password}
                  onChange={(e) => setEmailChangeForm({
                    ...emailChangeForm,
                    password: e.target.value
                  })}
                  placeholder="输入当前密码以确认更改"
                  required
                />
                <small>出于安全考虑，需要输入当前密码确认身份</small>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="update-btn"
                >
                  {isLoading ? '更新中...' : '确认修改'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmailChangeModalOpen(false)}
                  className="cancel-btn"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 