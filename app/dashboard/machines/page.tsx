"use client";

import { useState, useEffect, useCallback } from "react";
import MediaLibrary from "@/components/media-library";
import "./machines.css";

export interface Machine {
  id: string;
  model: string;
  stock: number;
  production_date: string;
  specifications: Record<string, string>;
  tooling_drawing_url?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  sort_order?: number;
}

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

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/machines');
      const result = await response.json();
      
      if (result.success) {
        setMachines(result.data);
      } else {
        showNotification('error', '获取数据失败', result.error || '获取机器数据失败');
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      showNotification('error', '获取数据失败', '获取机器数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const filteredMachines = machines.filter(machine =>
    machine.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleDelete = async (machineId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这台机器吗？此操作不可撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/machines?id=${machineId}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          
          if (result.success) {
            setMachines(machines.filter(m => m.id !== machineId));
            showNotification('success', '删除成功', '机器已成功删除');
          } else {
            showNotification('error', '删除失败', result.error || '删除机器失败');
          }
        } catch (error) {
          console.error('Error deleting machine:', error);
          showNotification('error', '删除失败', '删除机器失败');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleSave = async (machineData: Omit<Machine, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const isUpdate = selectedMachine && selectedMachine.id;
      const url = '/api/admin/machines';
      const method = isUpdate ? 'PUT' : 'POST';
      const body = isUpdate 
        ? { id: selectedMachine.id, ...machineData }
        : machineData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        if (isUpdate) {
          setMachines(machines.map(m => 
            m.id === selectedMachine.id ? result.data : m
          ));
          showNotification('success', '更新成功', '机器更新成功');
        } else {
          // 重新获取数据以保持正确的排序
          await fetchMachines();
          showNotification('success', '创建成功', '机器创建成功');
        }
        
        setIsModalOpen(false);
        setSelectedMachine(null);
      } else {
        showNotification('error', '保存失败', result.error || '保存机器失败');
      }
    } catch (error: unknown) {
      console.error('Error saving machine:', error);
      showNotification('error', '保存失败', '保存机器失败');
    }
  };

  const handleSortOrderChange = async (machineId: string, newOrder: number) => {
    if (newOrder <= 0) {
      showNotification('error', '排序无效', '排序号必须大于0');
      return;
    }

    try {
      const response = await fetch('/api/admin/machines/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ machineId, sortOrder: newOrder })
      });

      const result = await response.json();

      if (result.success) {
        // 重新获取数据以刷新排序
        await fetchMachines();
        showNotification('success', '排序更新', '排序更新成功');
      } else {
        showNotification('error', '排序失败', result.error || '排序更新失败');
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
      showNotification('error', '排序失败', '排序更新失败');
    }
  };

  const handleAddNew = () => {
    const newMachine: Machine = {
      id: '',
      model: "",
      stock: 0,
      production_date: new Date().toISOString().split('T')[0],
      specifications: {},
      tooling_drawing_url: "",
      image_urls: [],
      created_at: '',
      updated_at: ''
    };
    setSelectedMachine(newMachine);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="machines-page">
        <section className="section-header">
          <h2>机器管理</h2>
          <p>管理库存机器信息</p>
        </section>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="machines-page">
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
        <h2>机器管理</h2>
        <p>管理库存机器信息</p>
      </section>

      <div className="machines-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索机器型号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={handleAddNew} className="add-btn">
          ➕ 添加新机器
        </button>
      </div>

      <div className="machines-table">
        <div className="table-header">
          <div className="table-row machine-row">
            <div className="table-cell sort-cell">排序</div>
            <div className="table-cell content-cell">产品信息</div>
            <div className="table-cell actions-cell">操作</div>
          </div>
        </div>
        <div className="table-body">
          {filteredMachines.map((machine, index) => (
            <div key={machine.id} className="table-row machine-row">
              <div className="table-cell sort-cell">
                <div className="sort-controls">
                  <input
                    type="number"
                    value={machine.sort_order || index + 1}
                    onChange={(e) => {
                      const newOrder = parseInt(e.target.value);
                      if (!isNaN(newOrder) && newOrder !== (machine.sort_order || index + 1)) {
                        handleSortOrderChange(machine.id, newOrder);
                      }
                    }}
                    className="sort-input"
                    min="1"
                    title="设置排序位置"
                  />
                </div>
              </div>
              <div className="table-cell content-cell">
                <div className="machine-info">
                  <div className="machine-header">
                    <h3 className="machine-model">{machine.model}</h3>
                    <span className={`stock-badge ${machine.stock < 5 ? 'low-stock' : ''}`}>
                      库存: {machine.stock}
                    </span>
                  </div>
                  <div className="machine-details">
                    <span className="detail-item">
                      <strong>生产日期:</strong> {new Date(machine.production_date).toLocaleDateString()}
                    </span>
                    <span className="detail-item">
                      <strong>图片:</strong> {machine.image_urls.length} 张
                    </span>
                    <span className="detail-item">
                      <strong>创建时间:</strong> {new Date(machine.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="table-cell actions-cell">
                <div className="action-buttons">
                  <button 
                    onClick={() => handleEdit(machine)}
                    className="edit-btn"
                  >
                    ✏️ 编辑
                  </button>
                  <button 
                    onClick={() => handleDelete(machine.id)}
                    className="delete-btn"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedMachine && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedMachine.id ? '编辑机器' : '添加新机器'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <MachineForm 
              machine={selectedMachine}
              onSave={handleSave}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MachineForm({ 
  machine, 
  onSave, 
  onCancel 
}: {
  machine: Machine;
  onSave: (machine: Omit<Machine, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    model: machine.model,
    stock: machine.stock,
    production_date: machine.production_date,
    specifications: machine.specifications,
    tooling_drawing_url: machine.tooling_drawing_url || '',
    image_urls: machine.image_urls || []
  });

  const [customSpecs, setCustomSpecs] = useState(() => {
    const existing = Object.entries(machine.specifications || {});
    const specs = existing.length > 0 ? existing : [['', '']];
    return specs.slice(0, 5); // Max 5 specifications
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDrawing, setUploadingDrawing] = useState(false);
  
  // 媒体库状态
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaLibraryType, setMediaLibraryType] = useState<'image' | 'drawing'>('image');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert custom specs to object
    const specifications: Record<string, string> = {};
    customSpecs.forEach(([key, value]) => {
      if (key.trim() && value.trim()) {
        specifications[key.trim()] = value.trim();
      }
    });

    const machineData = {
      ...formData,
      specifications,
      created_by: machine.created_by
    };

    onSave(machineData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        }
      }

      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('图片上传失败');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDrawingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDrawing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'drawing');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success && result.url) {
        setFormData(prev => ({
          ...prev,
          tooling_drawing_url: result.url
        }));
      }
    } catch (error) {
      console.error('Error uploading drawing:', error);
      alert('模具图纸上传失败');
    } finally {
      setUploadingDrawing(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const addCustomSpec = () => {
    if (customSpecs.length < 5) {
      setCustomSpecs([...customSpecs, ['', '']]);
    }
  };

  const removeCustomSpec = (index: number) => {
    setCustomSpecs(customSpecs.filter((_, i) => i !== index));
  };

  const updateCustomSpec = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...customSpecs];
    if (field === 'key') {
      newSpecs[index][0] = value;
    } else {
      newSpecs[index][1] = value;
    }
    setCustomSpecs(newSpecs);
  };



  const openMediaLibrary = (type: 'image' | 'drawing') => {
    setMediaLibraryType(type);
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (file: { url: string; name: string }) => {
    if (mediaLibraryType === 'image') {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, file.url]
      }));
    } else if (mediaLibraryType === 'drawing') {
      setFormData(prev => ({
        ...prev,
        tooling_drawing_url: file.url
      }));
    }
    setMediaLibraryOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="machine-form">
      <div className="form-group">
        <label>机器型号 *</label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => setFormData({...formData, model: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>库存数量 *</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
          required
          min="0"
        />
      </div>

      <div className="form-group">
        <label>生产日期 *</label>
        <input
          type="date"
          value={formData.production_date}
          onChange={(e) => setFormData({...formData, production_date: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>规格参数 (最多5项)</label>
        <div className="custom-specs">
          {customSpecs.map((spec, index) => (
            <div key={index} className="spec-row">
              <input
                type="text"
                placeholder="参数名称"
                value={spec[0]}
                onChange={(e) => updateCustomSpec(index, 'key', e.target.value)}
                className="spec-key"
              />
              <input
                type="text"
                placeholder="参数值"
                value={spec[1]}
                onChange={(e) => updateCustomSpec(index, 'value', e.target.value)}
                className="spec-value"
              />
              <button 
                type="button" 
                onClick={() => removeCustomSpec(index)}
                className="remove-spec-btn"
              >
                ×
              </button>
            </div>
          ))}
          {customSpecs.length < 5 && (
            <button 
              type="button" 
              onClick={addCustomSpec}
              className="add-spec-btn"
            >
              + 添加规格参数
            </button>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>机器图片</label>
        <div className="file-upload-section">
          <div className="upload-options">
            <button 
              type="button" 
              className="upload-tab active"
              onClick={() => {}}
            >
              上传新图片
            </button>
            <button 
              type="button" 
              className="upload-tab"
              onClick={() => openMediaLibrary('image')}
            >
              从资料库选择
            </button>
          </div>
          
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImages}
            className="file-input"
          />
          {uploadingImages && <div className="upload-progress">上传中...</div>}
          
          <div className="uploaded-images">
            {formData.image_urls.map((url, index) => (
              <div key={index} className="image-preview">
                <img src={url} alt={`Machine ${index + 1}`} className="preview-img" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="remove-image-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>模具图纸</label>
        <div className="file-upload-section">
          <div className="upload-options">
            <button 
              type="button" 
              className="upload-tab active"
              onClick={() => {}}
            >
              上传新图纸
            </button>
            <button 
              type="button" 
              className="upload-tab"
              onClick={() => openMediaLibrary('drawing')}
            >
              从资料库选择
            </button>
          </div>
          
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleDrawingUpload}
            disabled={uploadingDrawing}
            className="file-input"
          />
          {uploadingDrawing && <div className="upload-progress">上传中...</div>}
          
          {formData.tooling_drawing_url && (
            <div className="uploaded-file">
              <a 
                href={formData.tooling_drawing_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="file-preview"
              >
                📄 查看模具图纸
              </a>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({...prev, tooling_drawing_url: ''}))}
                className="remove-file-btn"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>



      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={uploadingImages || uploadingDrawing}
        >
          {uploadingImages || uploadingDrawing ? '上传中...' : '保存'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-secondary"
        >
          取消
        </button>
      </div>
      
      {/* 媒体库模态框 */}
      {mediaLibraryOpen && (
        <MediaLibrary
          type={mediaLibraryType}
          onSelect={handleMediaSelect}
          onClose={() => setMediaLibraryOpen(false)}
          multiple={mediaLibraryType === 'image'}
        />
      )}
    </form>
  );
} 