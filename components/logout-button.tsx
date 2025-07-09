"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button 
      onClick={logout}
      className="logout-btn"
      style={{
        background: '#E4600A',
        color: '#FFFFFF',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        fontSize: '0.9rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#d55309';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#E4600A';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      退出登录
    </button>
  );
}
