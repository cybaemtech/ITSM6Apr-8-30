import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyBrandingProvider } from './contexts/CompanyBrandingContext';
import Header from './components/Header';
import ProfileEditor from './components/ProfileEditor';
import { Monitor, Smartphone } from 'lucide-react';
import EngineerDashboard from './components/dashboards/EngineerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import HRDashboard from './components/dashboards/HRDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import MobileEngineerDashboard from './components/mobile/MobileEngineerDashboard';
import MobileHRDashboard from './components/mobile/MobileHRDashboard';
import MobileAdminDashboard from './components/mobile/MobileAdminDashboard';
import MobileClientDashboard from './components/mobile/MobileClientDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');
  const [multiRoleViewMode, setMultiRoleViewMode] = useState<'admin' | 'hr' | 'engineer'>('admin');
  const [showProfile, setShowProfile] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="w-12 h-12 relative z-10">
          <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-400 mt-6 text-sm font-medium tracking-widest uppercase z-10">Authenticating</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center backdrop-blur-xl">
          <p className="text-white text-lg font-medium">Session Expired</p>
          <p className="text-slate-400 mt-2 text-sm">Please log in through the main portal to continue.</p>
        </div>
      </div>
    );
  }

  const roleStr = Array.isArray(user.role) ? user.role.join(',') : String(user.role || '');
  const normalizedRole = roleStr.toLowerCase();

  const isRohanOrShivam = user.email.toLowerCase() === 'rohan@cybaemtech.com' || user.email.toLowerCase() === 'shivam.jagtap@cybaemtech.com';

  const effectiveRole = (isRohanOrShivam ? multiRoleViewMode : normalizedRole) || '';

  const isHR = effectiveRole.includes('hr');
  const isAdmin = effectiveRole.includes('admin');
  const isClient = effectiveRole.includes('client');
  const isEngineer = effectiveRole.includes('engineer');
  const isPrivileged = isHR || isAdmin;

  const renderDashboard = () => {
    if (viewMode === 'mobile') {
        if (isAdmin)      return <MobileAdminDashboard />;
        if (isEngineer)   return <MobileEngineerDashboard />;
        if (isHR)         return <MobileHRDashboard />;
        if (isClient)     return <MobileClientDashboard />;
    }

    if (isAdmin) return <AdminDashboard />;
    if (isEngineer) return <EngineerDashboard />;
    if (isHR) return <HRDashboard />;
    if (isClient) return <ClientDashboard />;
    
    return <EngineerDashboard />;
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-slate-200 selection:bg-white/20 selection:text-white relative flex flex-col font-sans antialiased">
      <Header
        currentRole={user.role}
        userName={user.name || 'User'}
        onProfileClick={() => setShowProfile(true)}
      />

      {(isEngineer || isPrivileged || isClient) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {isRohanOrShivam && (
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-2 flex flex-col gap-2 w-40 transform origin-bottom-right transition-all">
              <div className="flex gap-2">
                <button
                  onClick={() => setMultiRoleViewMode('admin')}
                  className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                    multiRoleViewMode === 'admin' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setMultiRoleViewMode('hr')}
                  className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                    multiRoleViewMode === 'hr' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  HR
                </button>
              </div>
              <button
                onClick={() => setMultiRoleViewMode('engineer')}
                className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                  multiRoleViewMode === 'engineer' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Engineer
              </button>
            </div>
          )}
          
          <div className="bg-[#1A1A1A]/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 p-1.5 flex gap-1 items-center">
            <button
              onClick={() => setViewMode('web')}
              className={`p-3 rounded-full transition-all duration-300 ${
                viewMode === 'web'
                  ? 'bg-white text-black shadow-lg scale-100'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-3 rounded-full transition-all duration-300 ${
                viewMode === 'mobile'
                  ? 'bg-white text-black shadow-lg scale-100'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full flex flex-col relative z-0">
        {showProfile ? (
          <div className="p-6 md:p-12 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProfileEditor onClose={() => setShowProfile(false)} />
          </div>
        ) : (
          renderDashboard()
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CompanyBrandingProvider>
        <AppContent />
      </CompanyBrandingProvider>
    </AuthProvider>
  );
}

export default App;
