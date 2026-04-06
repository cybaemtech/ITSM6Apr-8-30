import { useAuth } from '../contexts/AuthContext';
import { useCompanyBranding } from '../contexts/CompanyBrandingContext';
import { LogOut, User, Home, ChevronRight, Shield } from 'lucide-react';
import { useLocation } from 'wouter';

interface HeaderProps {
  currentRole: string;
  userName: string;
  onProfileClick?: () => void;
}

export default function Header({ currentRole, userName, onProfileClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { branding } = useCompanyBranding();

  function handleSignOut() {
    signOut();
  }

  const normalizedRole = currentRole.toLowerCase().trim();

  const roleConfig: Record<string, { gradient: string; badge: string; label: string }> = {
    admin:    { gradient: 'from-rose-500 to-red-600',     badge: 'bg-red-500/10 text-red-400 border-red-500/20',       label: 'Administrator' },
    engineer: { gradient: 'from-blue-500 to-indigo-600',  badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',   label: 'Field Engineer' },
    hr:       { gradient: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'HR Manager' },
    client:   { gradient: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Client' },
  };

  const config = roleConfig[normalizedRole] || roleConfig.engineer;

  return (
    <header className="bg-[#0A0A0A]/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={onProfileClick}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xl bg-gradient-to-br ${config.gradient} ring-1 ring-white/20`}
                style={branding ? {
                  background: `linear-gradient(135deg, ${branding.primary_color}, ${branding.secondary_color})`,
                } : undefined}
              >
                <span className="text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="font-bold text-white leading-none text-sm group-hover:text-blue-400 transition-colors">{userName}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${config.badge}`}>
                    {config.label}
                  </span>
                  {user?.portalRole && user.portalRole.toLowerCase() !== normalizedRole && (
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      ITSM: {user.portalRole}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 px-4 py-2 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-xs font-bold tracking-wide group"
            >
              <Home className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline">Main Portal</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform hidden sm:block" />
            </button>
            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-bold tracking-wide"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            )}
            <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block"></div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-xs font-bold tracking-wide group"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
