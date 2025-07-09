"use client";

import { useState, useEffect } from "react";
import { FormattedInquiry } from "@/lib/supabase/inquiries";
import "./inquiries.css";

// 通知类型
interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

// 通知组件
function NotificationContainer({ notifications, onClose }: {
  notifications: NotificationItem[];
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
  type = 'default',
  onConfirm, 
  onCancel 
}: {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<FormattedInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<FormattedInquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [productSpecs, setProductSpecs] = useState<Record<string, string> | null>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'default' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    replied: 0,
    closed: 0
  });

  const showNotification = (type: NotificationItem['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const notification: NotificationItem = { id, type, title, message };
    setNotifications(prev => [...prev, notification]);
    
    // 4秒后自动关闭
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 获取询盘数据
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "all" 
        ? '/api/inquiries/list'
        : `/api/inquiries/list?status=${statusFilter}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setInquiries(result.data);
      } else {
        console.error('Failed to fetch inquiries:', result.error);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inquiries/list?statsOnly=true');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps



  const filteredInquiries = inquiries;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: "待处理", class: "status-pending" },
      processing: { text: "处理中", class: "status-processing" },
      replied: { text: "已回复", class: "status-replied" },
      closed: { text: "已关闭", class: "status-closed" }
    };
    return statusMap[status as keyof typeof statusMap] || { text: status, class: "" };
  };



  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      
      if (result.success) {
        // 更新本地状态
                 setInquiries(inquiries.map(inquiry =>
           inquiry.id === inquiryId ? { ...inquiry, status: newStatus as FormattedInquiry['status'] } : inquiry
         ));
        
        // 更新统计数据
        fetchStats();
      } else {
        console.error('Failed to update inquiry:', result.error);
        showNotification('error', '更新失败', result.error || '更新失败，请重试');
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      showNotification('error', '更新失败', '更新失败，请重试');
    }
  };

  const fetchProductSpecs = async (productModel: string) => {
    if (!productModel) return;
    
    setLoadingSpecs(true);
    try {
      const response = await fetch(`/api/machines/by-model?model=${encodeURIComponent(productModel)}`);
      const result = await response.json();
      
      if (result.success) {
        setProductSpecs(result.data.specifications);
      } else {
        console.error('Failed to fetch product specs:', result.error);
        setProductSpecs(null);
      }
    } catch (error) {
      console.error('Error fetching product specs:', error);
      setProductSpecs(null);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const handleViewDetails = (inquiry: FormattedInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailModalOpen(true);
    
    // 如果有产品型号，获取产品参数
    if (inquiry.productModel) {
      fetchProductSpecs(inquiry.productModel);
    } else {
      setProductSpecs(null);
    }
  };

  const handleSendReply = () => {
    if (!selectedInquiry || !replyMessage.trim()) return;

    // 这里应该调用API保存回复到数据库
    // 目前暂时只更新本地状态
    
    setReplyMessage("");
    showNotification('info', '功能开发中', '回复功能正在开发中');
  };

  const handleDelete = async (inquiryId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这条询盘吗？此操作不可撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/inquiries/${inquiryId}`, {
            method: 'DELETE'
          });

          const result = await response.json();
          
          if (result.success) {
            // 从本地状态中移除
            setInquiries(inquiries.filter(inquiry => inquiry.id !== inquiryId));
            
            // 更新统计数据
            fetchStats();
            showNotification('success', '删除成功', '询盘已成功删除');
          } else {
            console.error('Failed to delete inquiry:', result.error);
            showNotification('error', '删除失败', result.error || '删除失败，请重试');
          }
        } catch (error) {
          console.error('Error deleting inquiry:', error);
          showNotification('error', '删除失败', '删除失败，请重试');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  if (loading) {
    return (
      <div className="inquiries-page">
        <section className="section-header">
          <h2>客户询盘</h2>
          <p>管理客户询价和咨询</p>
        </section>
        <div className="loading-container">
          <p>正在加载询盘数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inquiries-page">
      {/* 通知容器 */}
      <NotificationContainer 
        notifications={notifications}
        onClose={closeNotification}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
      />

      <section className="section-header">
        <h2>客户询盘</h2>
        <p>管理客户询价和咨询</p>
      </section>

      {/* 统计数据 */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>总询盘数</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>待处理</p>
        </div>
        <div className="stat-card">
          <h3>{stats.processing}</h3>
          <p>处理中</p>
        </div>
        <div className="stat-card">
          <h3>{stats.replied}</h3>
          <p>已回复</p>
        </div>
        <div className="stat-card">
          <h3>{stats.closed}</h3>
          <p>已关闭</p>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="filters">
        <label>
          状态过滤：
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="replied">已回复</option>
            <option value="closed">已关闭</option>
          </select>
        </label>
      </div>

      {/* 询盘列表 */}
      <div className="inquiries-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="empty-state">暂无询盘数据</div>
        ) : (
          <div className="inquiry-grid">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="inquiry-card">
                <div className="inquiry-header">
                  <h3>{inquiry.fullName}</h3>
                  <span className={`status-badge ${getStatusBadge(inquiry.status).class}`}>
                    {getStatusBadge(inquiry.status).text}
                  </span>
                </div>
                
                <div className="inquiry-info">
                  <p><strong>邮箱:</strong> {inquiry.email}</p>
                  <p><strong>电话:</strong> {inquiry.phone}</p>
                  <p><strong>公司:</strong> {inquiry.company}</p>
                  <p><strong>国家:</strong> {inquiry.country}</p>
                  <p><strong>产品型号:</strong> {inquiry.productModel}</p>
                  <p><strong>提交时间:</strong> {new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>

                <div className="inquiry-actions">
                  <button 
                    onClick={() => handleViewDetails(inquiry)}
                    className="view-btn"
                  >
                    查看详情
                  </button>
                  <button 
                    onClick={() => handleDelete(inquiry.id)}
                    className="delete-btn"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {isDetailModalOpen && selectedInquiry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>询盘详情</h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="inquiry-details">
                <div className="detail-section">
                  <h4>客户信息</h4>
                  <p><strong>姓名:</strong> {selectedInquiry.fullName}</p>
                  <p><strong>邮箱:</strong> {selectedInquiry.email}</p>
                  <p><strong>电话:</strong> {selectedInquiry.phone}</p>
                  <p><strong>公司:</strong> {selectedInquiry.company}</p>
                  <p><strong>国家:</strong> {selectedInquiry.country}</p>
                </div>

                <div className="detail-section">
                  <h4>产品信息</h4>
                  <p><strong>产品型号:</strong> {selectedInquiry.productModel}</p>
                </div>

                <div className="detail-section">
                  <h4>询盘内容</h4>
                  <p>{selectedInquiry.message}</p>
                </div>

                {/* 产品参数信息 */}
                {selectedInquiry.productModel && (
                  <div className="detail-section">
                    <h4>产品参数</h4>
                    {loadingSpecs ? (
                      <p>正在加载产品参数...</p>
                    ) : productSpecs && Object.keys(productSpecs).length > 0 ? (
                      <div className="specs-grid">
                        {Object.entries(productSpecs).map(([key, value]) => (
                          <div key={key} className="spec-item">
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>暂无产品参数信息</p>
                    )}
                  </div>
                )}
              </div>

              <div className="status-section">
                <h4>状态管理</h4>
                <div className="status-controls">
                  <label>
                    当前状态：
                    <select 
                      value={selectedInquiry.status} 
                      onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                    >
                      <option value="pending">待处理</option>
                      <option value="processing">处理中</option>
                      <option value="replied">已回复</option>
                      <option value="closed">已关闭</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="reply-section">
                <h4>回复客户</h4>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="输入回复内容..."
                  rows={4}
                />
                <button 
                  onClick={handleSendReply}
                  className="send-reply-btn"
                  disabled={!replyMessage.trim()}
                >
                  发送回复
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 