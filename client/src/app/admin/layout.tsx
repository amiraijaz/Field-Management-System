"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// Professional Solid Icons (FontAwesome 6)
import {
  FaHouse,
  FaBriefcase,
  FaUsers,
  FaUserGear,
  FaGear,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaWrench, // For logo
  FaChevronRight
} from "react-icons/fa6";

// Keep Sparkles for accent
import { HiOutlineSparkles } from "react-icons/hi2";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Overview", href: "/admin", icon: FaHouse },
  { name: "Jobs", href: "/admin/jobs", icon: FaBriefcase },
  { name: "Customers", href: "/admin/customers", icon: FaUsers },
  { name: "Users", href: "/admin/users", icon: FaUserGear },
  { name: "Statuses", href: "/admin/statuses", icon: FaGear },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HiOutlineSparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sidebar-gradient border-r border-white/5 transform transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <FaWrench className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                FieldMgmt
              </h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
            <button
              className="ml-auto lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <FaXmark className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main Menu
            </p>
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${active
                      ? "nav-active bg-primary/10 text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 ${active
                        ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium flex-1">{item.name}</span>
                  <FaChevronRight
                    className={`w-3 h-3 transition-all duration-200 ${active
                        ? "opacity-100 text-primary translate-x-0"
                        : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                      }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-white">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/20"
            >
              <FaRightFromBracket className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <FaWrench className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold">FieldMgmt</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 min-h-[calc(100vh-73px)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
