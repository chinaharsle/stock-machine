import "./homepage.css";
import { AuthButton } from "@/components/auth-button";
import { HomepageClient } from "@/components/homepage-client";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="homepage">
      {/* Admin Button for authenticated users */}
      {user && (
        <div className="top-admin">
          <Link href="/dashboard" className="admin-btn">
            管理后台
          </Link>
        </div>
      )}

      {/* Header Banner with Auto Rotation */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-slides">
            <div className="hero-slide active">
              <div className="hero-bg slide-bg-1"></div>
              <div className="hero-text">
                <h1>HARSLE Inventory Machines</h1>
                <p>Professional Press Brake Solutions Ready For Delivery</p>
              </div>
            </div>
            <div className="hero-slide">
              <div className="hero-bg slide-bg-2"></div>
              <div className="hero-text">
                <h1>Advanced Manufacturing Excellence</h1>
                <p>Cutting-Edge Industrial Equipment for Modern Production</p>
              </div>
            </div>
            <div className="hero-slide">
              <div className="hero-bg slide-bg-3"></div>
              <div className="hero-text">
                <h1>Precision Engineering Solutions</h1>
                <p>High-Performance Bending Machines for Superior Results</p>
              </div>
            </div>
          </div>
          <div className="slide-indicators">
            <span className="indicator active" data-slide="0"></span>
            <span className="indicator" data-slide="1"></span>
            <span className="indicator" data-slide="2"></span>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Link href="/">HARSLE</Link>
          </div>
          <div className="nav-actions">
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="machines-grid" id="machinesGrid">
            {/* Machine cards will be dynamically loaded here */}
            <div className="loading">正在加载机器数据...</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="company-footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2024 HARSLE. All rights reserved. | Professional Press Brake Manufacturing Excellence</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button id="backToTop" className="back-to-top" title="Back to Top">
        ⬆️
      </button>

      {/* Client-side functionality */}
      <HomepageClient />
    </div>
  );
}
