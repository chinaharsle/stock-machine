import { LogoutButton } from "@/components/logout-button";
import { DashboardClient } from "@/components/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isUserAdmin, hasAdminUsers, bootstrapFirstAdmin, updateLastLogin } from "@/lib/supabase/admin";
import "./dashboard.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if any admin users exist in the system
  const adminUsersExist = await hasAdminUsers();
  
  // If no admin users exist, bootstrap the first admin
  if (!adminUsersExist) {
    console.log('🔧 No admin users found, bootstrapping first admin...');
    if (user.email) {
      await bootstrapFirstAdmin({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      });
    }
  }

  // Check if current user is admin
  const isAdmin = await isUserAdmin(user.id);
  
  if (!isAdmin) {
    // Redirect to unauthorized page
    redirect("/auth/login?message=Unauthorized access - Admin privileges required");
  }

  // Update last login time
  await updateLastLogin(user.id);

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
      <button id="mobileMenuToggle" className="mobile-menu-toggle">☰</button>

      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="logo">
            <h1>HARSLE 管理后台</h1>
          </div>
          <div className="header-actions">
            <Link href="/" className="home-btn" target="_blank" title="查看首页">
              🏠 首页
            </Link>
            <span className="welcome-text">欢迎，{user.email?.split('@')[0]}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li className="nav-item">
              <Link href="/dashboard" className="nav-link">
                📊 数据总览
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dashboard/machines" className="nav-link">
                🏭 库存机器管理
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dashboard/inquiries" className="nav-link">
                💬 客户询盘管理
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dashboard/banner" className="nav-link">
                🖼️ 首页横幅管理
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dashboard/account" className="nav-link">
                👤 账户设置
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dashboard/users" className="nav-link">
                👥 用户权限管理
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Client-side functionality */}
      <DashboardClient />
    </div>
  );
} 