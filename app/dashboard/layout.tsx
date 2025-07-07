import { LogoutButton } from "@/components/logout-button";
import { DashboardClient } from "@/components/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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
            <li className="nav-item active">
              <a href="#dashboard" className="nav-link" data-section="dashboard">
                📊 仪表盘
              </a>
            </li>
            <li className="nav-item">
              <a href="#machines" className="nav-link" data-section="machines">
                🏭 机器管理
              </a>
            </li>
            <li className="nav-item">
              <a href="#inquiries" className="nav-link" data-section="inquiries">
                💬 客户询盘
              </a>
            </li>
            <li className="nav-item">
              <a href="#banner" className="nav-link" data-section="banner">
                🖼️ 横幅管理
              </a>
            </li>
            <li className="nav-item">
              <a href="#account" className="nav-link" data-section="account">
                👤 账户管理
              </a>
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