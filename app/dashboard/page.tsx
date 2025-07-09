import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface DashboardStats {
  totalMachines: number;
  weeklyNewMachines: number;
  pendingInquiries: number;
  popularMachine: string;
  recentActivities: Array<{
    id: string;
    type: 'machine' | 'inquiry' | 'update';
    title: string;
    description: string;
    time: string;
  }>;
}

async function getDashboardStats(): Promise<DashboardStats> {
  // 使用服务器端客户端来确保有足够权限查询inquiries
  const { createClient: createServiceClient } = await import('@supabase/supabase-js');
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Get total machines count
  const { count: totalMachines } = await supabase
    .from('machines')
    .select('*', { count: 'exact', head: true });

  // Get weekly new machines count
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weeklyNewMachines } = await supabase
    .from('machines')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  // Get pending inquiries count
  const { count: pendingInquiries } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .or('status.eq.pending,status.is.null');

  // Get most popular machine (most inquired about)
  const { data: inquiriesData } = await supabase
    .from('inquiries')
    .select('message')
    .not('message', 'is', null);

  let popularMachine = '-';
  if (inquiriesData && inquiriesData.length > 0) {
    // Get all machine models from database
    const { data: machinesData } = await supabase
      .from('machines')
      .select('model');

    if (machinesData && machinesData.length > 0) {
      const modelCounts: Record<string, number> = {};
      
      // Initialize counts for all models
      machinesData.forEach(machine => {
        modelCounts[machine.model] = 0;
      });

      // Count mentions in inquiry messages
      inquiriesData.forEach(inquiry => {
        if (inquiry.message) {
          const message = inquiry.message.toLowerCase();
          machinesData.forEach(machine => {
            const model = machine.model.toLowerCase();
            // Check if model is mentioned in the message
            if (message.includes(model)) {
              modelCounts[machine.model]++;
            }
          });
        }
      });

      // Find the most mentioned model
      const entries = Object.entries(modelCounts);
      if (entries.length > 0) {
        const maxEntry = entries.reduce((a, b) => 
          a[1] > b[1] ? a : b
        );
        
        // Only show if there are actual mentions
        popularMachine = maxEntry[1] > 0 ? maxEntry[0] : '-';
      }
    }
  }

  // Get recent activities
  const recentActivities: Array<{
    id: string;
    type: 'machine' | 'inquiry' | 'update';
    title: string;
    description: string;
    time: string;
  }> = [];
  
  // Recent machines
  const { data: recentMachines } = await supabase
    .from('machines')
    .select('model, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Recent inquiries
  const { data: recentInquiries } = await supabase
    .from('inquiries')
    .select('full_name, company, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentMachines) {
    recentMachines.forEach((machine, index) => {
      const timeAgo = getTimeAgo(new Date(machine.created_at));
      recentActivities.push({
        id: `machine-${index}`,
        type: 'machine' as const,
        title: '新机器添加',
        description: `${machine.model} 已添加到库存`,
        time: timeAgo
      });
    });
  }

  if (recentInquiries) {
    recentInquiries.forEach((inquiry, index) => {
      const timeAgo = getTimeAgo(new Date(inquiry.created_at));
      const company = inquiry.company ? `来自 ${inquiry.company}` : `来自 ${inquiry.full_name}`;
      recentActivities.push({
        id: `inquiry-${index}`,
        type: 'inquiry' as const,
        title: '客户询盘',
        description: `${company} 的新询盘`,
        time: timeAgo
      });
    });
  }

  // Sort activities by time and limit to 8
  recentActivities.sort((a, b) => {
    const timeA = getTimeValue(a.time);
    const timeB = getTimeValue(b.time);
    return timeA - timeB;
  });

  return {
    totalMachines: totalMachines || 0,
    weeklyNewMachines: weeklyNewMachines || 0,
    pendingInquiries: pendingInquiries || 0,
    popularMachine,
    recentActivities: recentActivities.slice(0, 8)
  };
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`;
  return `${Math.floor(diffInSeconds / 604800)} 周前`;
}

function getTimeValue(timeString: string): number {
  if (timeString === '刚刚') return 0;
  const match = timeString.match(/(\d+)/);
  if (!match) return 999999;
  const value = parseInt(match[1]);
  if (timeString.includes('分钟')) return value;
  if (timeString.includes('小时')) return value * 60;
  if (timeString.includes('天')) return value * 1440;
  if (timeString.includes('周')) return value * 10080;
  return value;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const stats = await getDashboardStats();

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
            <h3>{stats.totalMachines}</h3>
            <p>库存机器总数</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.weeklyNewMachines}</h3>
            <p>本周新增机器</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{stats.pendingInquiries}</h3>
            <p>待处理询盘</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats.popularMachine}</h3>
            <p>热门机器型号</p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="activity-section">
        <h3>最近活动</h3>
        <div className="activity-timeline">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-content">
                  <div className="timeline-title">{activity.title}</div>
                  <div className="timeline-text">{activity.description}</div>
                  <div className="timeline-time">{activity.time}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-title">暂无活动</div>
                <div className="timeline-text">系统尚未记录任何活动</div>
                <div className="timeline-time">-</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 