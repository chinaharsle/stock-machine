import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <>
      {/* Dashboard Section */}
      <section className="section-header">
        <h2>数据概览</h2>
        <p>系统运营状态总览</p>
      </section>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <h3>0</h3>
            <p>库存机器总数</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>0</h3>
            <p>本周新增机器</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>0</h3>
            <p>待处理询盘</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>-</h3>
            <p>热门机器型号</p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="activity-section">
        <h3>最近活动</h3>
        <div className="activity-timeline">
          <div className="timeline-item">
            <div className="timeline-content">
              <div className="timeline-title">新机器添加</div>
              <div className="timeline-text">MasterBend 11025 已添加到库存</div>
              <div className="timeline-time">2 小时前</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-content">
              <div className="timeline-title">客户询盘</div>
              <div className="timeline-text">来自 ABC Company 的新询盘</div>
              <div className="timeline-time">4 小时前</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-content">
              <div className="timeline-title">库存更新</div>
              <div className="timeline-text">PowerPress 16030 库存已更新</div>
              <div className="timeline-time">6 小时前</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-content">
              <div className="timeline-title">系统更新</div>
              <div className="timeline-text">管理系统已成功更新</div>
              <div className="timeline-time">1 天前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 