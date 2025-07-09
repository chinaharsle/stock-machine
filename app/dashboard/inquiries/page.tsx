"use client";

import { useState, useEffect } from "react";
import { FormattedInquiry } from "@/lib/supabase/inquiries";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<FormattedInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<FormattedInquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [productSpecs, setProductSpecs] = useState<Record<string, string> | null>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    replied: 0,
    closed: 0
  });

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

  const formatSpecificationLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      bendingTonnage: "Bending Tonnage",
      bendingLength: "Bending Length",
      operatingSystem: "Operating System",
      backgaugeAxis: "Backgauge Axis"
    };
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
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
        alert('更新失败，请重试');
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('更新失败，请重试');
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
    alert('回复功能正在开发中');
  };

  const handleDelete = async (inquiryId: string) => {
    if (confirm("确定要删除这条询盘吗？")) {
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
        } else {
          console.error('Failed to delete inquiry:', result.error);
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        alert('删除失败，请重试');
      }
    }
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
      <section className="section-header">
        <h2>客户询盘</h2>
        <p>管理客户询价和咨询</p>
      </section>

      <div className="inquiries-controls">
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="replied">已回复</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
        <div className="stats-summary">
          <span className="stat-item">
            总计: {stats.total}
          </span>
          <span className="stat-item">
            待处理: {stats.pending}
          </span>
        </div>
      </div>

      <div className="inquiries-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell">客户姓名</div>
            <div className="table-cell">联系方式</div>
            <div className="table-cell">产品型号</div>
            <div className="table-cell">状态</div>
            <div className="table-cell">创建时间</div>
            <div className="table-cell">操作</div>
          </div>
        </div>
        <div className="table-body">
          {filteredInquiries.map(inquiry => {
            const statusInfo = getStatusBadge(inquiry.status);
            return (
              <div key={inquiry.id} className="table-row">
                <div className="table-cell">
                  <div className="customer-info">
                    <div className="name">{inquiry.fullName}</div>
                    {inquiry.company && <div className="company">{inquiry.company}</div>}
                  </div>
                </div>
                <div className="table-cell">
                  <div className="contact-info">
                    <div>{inquiry.email}</div>
                    <div>{inquiry.phone}</div>
                  </div>
                </div>
                <div className="table-cell">
                  {inquiry.productModel || '-'}
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <div className="table-cell">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </div>
                <div className="table-cell">
                  <button
                    onClick={() => handleViewDetails(inquiry)}
                    className="view-btn"
                  >
                    📋 查看详情
                  </button>
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="replied">已回复</option>
                    <option value="closed">已关闭</option>
                  </select>
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {inquiries.length === 0 && !loading && (
        <div className="empty-state">
          <p>暂无{statusFilter === 'all' ? '' : getStatusBadge(statusFilter).text}询盘数据</p>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedInquiry && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>询盘详情 - {selectedInquiry.fullName}</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="close-btn">×</button>
            </div>
            
            <div className="inquiry-details">
              <div className="detail-section">
                <h4><strong>客户信息</strong></h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label><strong>姓名:</strong></label>
                    <span>{selectedInquiry.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label><strong>邮箱:</strong></label>
                    <span>{selectedInquiry.email}</span>
                  </div>
                  <div className="detail-item">
                    <label><strong>WhatsApp:</strong></label>
                    <span>{selectedInquiry.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label><strong>公司:</strong></label>
                    <span>{selectedInquiry.company || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label><strong>IP地址:</strong></label>
                    <span>{selectedInquiry.ipAddress || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label><strong>来源国家:</strong></label>
                    <span>{selectedInquiry.country || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><strong>询盘内容</strong></h4>
                <div className="detail-item">
                  <label><strong>产品型号:</strong></label>
                  <span>{selectedInquiry.productModel || '-'}</span>
                </div>
                
                {selectedInquiry.productModel && (
                  <div className="detail-item">
                    <label><strong>产品参数:</strong></label>
                    <div className="product-specs">
                      {loadingSpecs ? (
                        <span>正在加载产品参数...</span>
                      ) : productSpecs ? (
                        <div className="specs-grid">
                          {Object.entries(productSpecs).map(([key, value]) => (
                            <div key={key} className="spec-item">
                              <span className="spec-label">{formatSpecificationLabel(key)}:</span>
                              <span className="spec-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>无法获取产品参数</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="detail-item">
                  <label><strong>询盘消息:</strong></label>
                  <p className="message-content">{selectedInquiry.message}</p>
                </div>
                <div className="detail-item">
                  <label><strong>创建时间:</strong></label>
                  <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Reply Form */}
              <div className="detail-section">
                <h4><strong>发送回复</strong></h4>
                <div className="reply-form">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="输入回复内容..."
                    className="reply-textarea"
                    rows={4}
                  />
                  <div className="reply-actions">
                    <button onClick={handleSendReply} className="send-reply-btn">
                      发送回复
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 