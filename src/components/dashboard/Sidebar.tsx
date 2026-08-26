import { X } from "lucide-react";
import churchLogo from "@/assets/winners-logo.png";
import { getDashboardNav } from "@/lib/dashboardNav";
import type { Role } from "@/lib/permissions";

interface SidebarProps {
  role: Role;
  activeTab: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ role, activeTab, onSelect, collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const groups = getDashboardNav(role);

  const content = (
    <div className="flex h-full flex-col bg-[oklch(0.16_0.03_25)] text-white/90">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
        <img src={churchLogo} alt="" className="h-9 w-9 object-contain shrink-0" />
        <div className={collapsed ? "lg:hidden" : ""}>
          <div className="font-heading text-sm font-bold leading-tight tracking-wide text-white">WINNERS</div>
          <div className="font-heading text-sm font-bold leading-tight tracking-wide text-gold">CHURCH</div>
        </div>
      </div>

      {/* Mobile close */}
      <button
        onClick={onCloseMobile}
        className="absolute right-3 top-3 rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
        aria-label="Close navigation"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-5">
        {groups.map((g) => (
          <div key={g.group}>
            <div className={`px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 ${collapsed ? "lg:hidden" : ""}`}>
              {g.group}
            </div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      collapsed ? "lg:justify-center" : ""
                    } ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl animate-fade-in-up">{content}</div>
        </div>
      )}
    </>
  );
}
