"use client";

import { useState, useEffect, useCallback } from 'react';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'drawing' | 'attachment';
  source: string;
  created_at: string;
}

interface MediaLibraryProps {
  type: 'image' | 'drawing' | 'attachment';
  onSelect: (file: MediaFile) => void;
  onClose: () => void;
  multiple?: boolean;
  selectedFiles?: MediaFile[];
}

export default function MediaLibrary({ 
  type, 
  onSelect, 
  onClose, 
  multiple = false,
  selectedFiles = []
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedFiles.map(f => f.id))
  );

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 MediaLibrary: 开始获取文件列表，类型:', type);
      console.log('🔍 MediaLibrary: 当前URL:', window.location.href);
      console.log('🔍 MediaLibrary: 检查cookies:', document.cookie);
      
      const response = await fetch(`/api/admin/media?type=${type}&limit=100`, {
        method: 'GET',
        credentials: 'include', // 确保包含cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 MediaLibrary: API响应状态:', response.status, response.statusText);
      console.log('📡 MediaLibrary: API响应头:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ MediaLibrary: API响应错误:', errorData);
        
        if (response.status === 401) {
          throw new Error('用户未登录或认证已过期，请重新登录后台管理系统');
        } else if (response.status === 403) {
          throw new Error('没有权限访问媒体库');
        } else if (response.status === 500) {
          throw new Error('服务器内部错误，请稍后再试');
        } else {
          throw new Error(errorData?.error || errorData?.message || `请求失败 (状态码: ${response.status})`);
        }
      }
      
      const data = await response.json();
      console.log('✅ MediaLibrary: 获取到数据:', data);
      console.log('📊 MediaLibrary: 文件数量:', data.files?.length || 0);
      
      // 检查响应是否成功
      if (data.success === false) {
        throw new Error(data.error || data.message || '获取文件失败');
      }
      
      setFiles(data.files || []);
      
      if (data.files && data.files.length > 0) {
        console.log('🖼️ MediaLibrary: 第一个文件示例:', data.files[0]);
        console.log('🖼️ MediaLibrary: 所有文件:', data.files);
      } else {
        console.log('⚠️ MediaLibrary: 没有找到文件');
      }
      
    } catch (err) {
      console.error('❌ MediaLibrary: 获取文件失败:', err);
      setError(err instanceof Error ? err.message : '获取文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else {
        newSelected.add(file.id);
      }
      setSelectedIds(newSelected);
    } else {
      onSelect(file);
    }
  };

  const handleConfirmSelection = () => {
    if (multiple) {
      const selectedFiles = files.filter(f => selectedIds.has(f.id));
      selectedFiles.forEach(file => onSelect(file));
    }
    onClose();
  };

  const getFileIcon = (type: string, url: string) => {
    if (type === 'image') {
      return <img src={url} alt="预览" className="file-preview-image" />;
    } else if (type === 'drawing') {
      return <div className="file-icon">📄</div>;
    } else {
      return <div className="file-icon">📎</div>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return '图片';
      case 'drawing': return '图纸';
      case 'attachment': return '附件';
      default: return '文件';
    }
  };

  if (loading) {
    return (
      <div className="media-library-modal">
        <div className="media-library-content">
          <div className="media-library-header">
            <h3>选择{getTypeLabel(type)}</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <div className="loading-message">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="media-library-modal">
        <div className="media-library-content">
          <div className="media-library-header">
            <h3>选择{getTypeLabel(type)}</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={fetchFiles}
              className="retry-btn"
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="media-library-modal">
      <div className="media-library-content">
        <div className="media-library-header">
          <h3>选择{getTypeLabel(type)} ({files.length} 个文件)</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        {files.length === 0 ? (
          <div className="empty-state">
            <p>暂无已上传的{getTypeLabel(type)}</p>
            <small>请先上传一些文件后再使用此功能</small>
          </div>
        ) : (
          <>
            <div className="files-grid">
              {files.map((file) => (
                <div 
                  key={file.id}
                  className={`file-item ${selectedIds.has(file.id) ? 'selected' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="file-preview">
                    {getFileIcon(file.type, file.url)}
                  </div>
                  <div className="file-info">
                    <div className="file-name" title={file.name}>{file.name}</div>
                    <div className="file-date">
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {selectedIds.has(file.id) && (
                    <div className="selection-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
            
            {multiple && selectedIds.size > 0 && (
              <div className="selection-actions">
                <button 
                  onClick={handleConfirmSelection}
                  className="confirm-btn"
                >
                  确认选择 ({selectedIds.size} 个)
                </button>
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="clear-btn"
                >
                  清空选择
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 