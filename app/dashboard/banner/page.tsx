"use client";

import { useState, useEffect } from "react";
import { 
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  uploadBannerImage, 
  getCurrentUserId,
  getBackgroundStyles,
  Banner 
} from "@/lib/supabase/banners";

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
  onCancel 
}: {
  isOpen: boolean;
  title: string;
  message: string;
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
            <button onClick={onConfirm} className="confirm-btn">确认</button>
            <button onClick={onCancel} className="cancel-btn">取消</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // 通知函数
  const showNotification = (type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, title, message };
    setNotifications(prev => [...prev, notification]);
    
    // 3秒后自动关闭
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('error', '获取失败', '无法加载横幅数据，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const newBanner: Banner = {
      id: '',
      title: "",
      subtitle: "",
      background_image_url: '',
      background_style: "slide-bg-1",
      is_active: true,
      display_order: banners.length + 1,
      created_at: '',
      updated_at: ''
    };
    setSelectedBanner(newBanner);
    setIsModalOpen(true);
  };

  const handleSave = async (bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        showNotification('error', '权限错误', '无法获取用户信息，请重新登录');
        return;
      }

      const bannerWithUser = { ...bannerData, created_by: userId };

      if (selectedBanner && selectedBanner.id) {
        // Update existing banner
        const updated = await updateBanner(selectedBanner.id, bannerWithUser);
        if (updated) {
          setBanners(banners.map(b => 
            b.id === selectedBanner.id ? updated : b
          ));
          showNotification('success', '更新成功', '横幅已成功更新');
        } else {
          showNotification('error', '更新失败', '更新横幅时发生错误，请重试');
        }
      } else {
        // Create new banner
        const created = await createBanner(bannerWithUser);
        if (created) {
          setBanners([...banners, created]);
          showNotification('success', '创建成功', '新横幅已成功创建');
        } else {
          showNotification('error', '创建失败', '创建横幅时发生错误，请重试');
        }
      }
      
      setIsModalOpen(false);
      setSelectedBanner(null);
    } catch (error) {
      console.error('Error saving banner:', error);
      showNotification('error', '保存失败', '保存横幅时发生错误：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDelete = async (bannerId: string) => {
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;

    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确定要删除横幅 "${banner.title}" 吗？此操作不可恢复。`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        try {
          const success = await deleteBanner(bannerId);
          if (success) {
            setBanners(banners.filter(b => b.id !== bannerId));
            showNotification('success', '删除成功', '横幅已成功删除');
          } else {
            showNotification('error', '删除失败', '删除横幅时发生错误，可能由于权限限制或数据依赖');
          }
        } catch (error) {
          console.error('Error deleting banner:', error);
          showNotification('error', '删除失败', '删除横幅时发生错误：' + (error instanceof Error ? error.message : '未知错误'));
        }
      }
    });
  };

  const handleToggleActive = async (bannerId: string) => {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
      const updated = await updateBanner(bannerId, { is_active: !banner.is_active });
      if (updated) {
        setBanners(banners.map(b =>
          b.id === bannerId ? updated : b
        ));
        showNotification('success', '状态更新', `横幅已${updated.is_active ? '启用' : '禁用'}`);
      } else {
        showNotification('error', '更新失败', '更新横幅状态时发生错误');
      }
    }
  };

  const handleOrderChange = async (bannerId: string, newOrder: number) => {
    if (newOrder <= 0 || newOrder > banners.length) {
      showNotification('warning', '排序错误', `排序号必须在1-${banners.length}之间`);
      return;
    }

    try {
      const updated = await updateBanner(bannerId, { display_order: newOrder });
      if (updated) {
        // 重新获取数据以更新排序
        await fetchBanners();
        showNotification('success', '排序更新', '横幅排序已成功更新');
      } else {
        showNotification('error', '排序失败', '更新横幅排序时发生错误');
      }
    } catch (error) {
      console.error('Error updating banner order:', error);
      showNotification('error', '排序失败', '更新横幅排序时发生错误：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  if (loading) {
    return (
      <div className="banner-page">
        <section className="section-header">
          <h2>横幅管理</h2>
          <p>管理首页轮播横幅内容</p>
        </section>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="banner-page">
      <NotificationContainer notifications={notifications} onClose={closeNotification} />
      
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <section className="section-header">
        <h2>横幅管理</h2>
        <p>管理首页轮播横幅内容</p>
      </section>

      <div className="banner-controls">
        <button onClick={handleAddNew} className="add-btn">
          ➕ 添加新横幅
        </button>
        <div className="info-text">
          <span>💡 提示：横幅将按照顺序在首页显示，可以在顺序列中输入数字来调整顺序</span>
        </div>
      </div>

      <div className="banner-preview">
        <h3>预览效果</h3>
        <div className="hero-preview">
          {banners.filter(b => b.is_active).map((banner, index) => (
            <div 
              key={banner.id} 
              className={`preview-slide ${index === 0 ? 'active' : ''}`}
            >
              <div 
                className={`preview-bg ${banner.background_style}`}
                style={banner.background_image_url ? {
                  backgroundImage: `url(${banner.background_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : undefined}
              ></div>
              <div className="preview-text">
                <h1>{banner.title}</h1>
                <p>{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="banners-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell">顺序</div>
            <div className="table-cell">标题</div>
            <div className="table-cell">副标题</div>
            <div className="table-cell">背景</div>
            <div className="table-cell">状态</div>
            <div className="table-cell">操作</div>
          </div>
        </div>
        <div className="table-body">
          {banners.map((banner) => (
            <div key={banner.id} className="table-row">
              <div className="table-cell">
                <div className="order-controls">
                  <input
                    type="number"
                    value={banner.display_order}
                    onChange={(e) => {
                      const newOrder = parseInt(e.target.value);
                      if (!isNaN(newOrder) && newOrder !== banner.display_order) {
                        handleOrderChange(banner.id, newOrder);
                      }
                    }}
                    className="order-input"
                    min="1"
                    max={banners.length}
                    title="设置排序位置"
                  />
                </div>
              </div>
              <div className="table-cell">
                <div className="title-cell">{banner.title}</div>
              </div>
              <div className="table-cell">
                <div className="subtitle-cell">{banner.subtitle}</div>
              </div>
              <div className="table-cell">
                <div 
                  className={`bg-preview ${banner.background_style}`}
                  style={banner.background_image_url ? {
                    backgroundImage: `url(${banner.background_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : undefined}
                ></div>
              </div>
              <div className="table-cell">
                <button
                  onClick={() => handleToggleActive(banner.id)}
                  className={`status-toggle ${banner.is_active ? 'active' : 'inactive'}`}
                >
                  {banner.is_active ? '启用' : '禁用'}
                </button>
              </div>
              <div className="table-cell">
                <button 
                  onClick={() => handleEdit(banner)}
                  className="edit-btn"
                >
                  ✏️ 编辑
                </button>
                <button 
                  onClick={() => handleDelete(banner.id)}
                  className="delete-btn"
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedBanner && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{selectedBanner.id ? '编辑横幅' : '添加新横幅'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <BannerForm 
              banner={selectedBanner}
              onSave={handleSave}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BannerForm({
  banner,
  onSave,
  onCancel
}: {
  banner: Banner;
  onSave: (banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: banner.title,
    subtitle: banner.subtitle || '',
    background_style: banner.background_style,
    background_image_url: banner.background_image_url || '',
    is_active: banner.is_active,
    display_order: banner.display_order
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const backgroundStyles = getBackgroundStyles();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      ...formData,
      created_by: banner.created_by
    };

    onSave(bannerData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        alert('无法获取用户信息');
        return;
      }

      const url = await uploadBannerImage(file, userId);
      if (url) {
        setFormData(prev => ({
          ...prev,
          background_image_url: url,
          background_style: 'custom'
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('图片上传失败');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCustomImage = () => {
    setFormData(prev => ({
      ...prev,
      background_image_url: '',
      background_style: 'slide-bg-1'
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="banner-form">
      <div className="form-group">
        <label>标题 *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>副标题</label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>显示顺序</label>
        <input
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>背景样式</label>
        <div className="background-options">
          {backgroundStyles.map(style => (
            <div 
              key={style.value} 
              className={`bg-option ${formData.background_style === style.value ? 'selected' : ''}`}
              onClick={() => {
                if (style.value !== 'custom') {
                  setFormData({
                    ...formData, 
                    background_style: style.value,
                    background_image_url: ''
                  });
                }
              }}
            >
              <div 
                className="bg-preview-large"
                style={style.preview ? { background: style.preview } : {}}
              ></div>
              <span>{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>自定义背景图片</label>
        <div className="file-upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="file-input"
          />
          {uploadingImage && <div className="upload-progress">上传中...</div>}
          
          {formData.background_image_url && (
            <div className="uploaded-image">
              <div className="image-preview-large">
                <img src={formData.background_image_url} alt="Background preview" />
              </div>
              <button 
                type="button" 
                onClick={removeCustomImage}
                className="remove-image-btn"
              >
                移除自定义背景
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          />
          启用此横幅
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">保存</button>
        <button type="button" onClick={onCancel} className="cancel-btn">取消</button>
      </div>
    </form>
  );
} 