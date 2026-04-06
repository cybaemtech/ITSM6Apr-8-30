import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyBranding } from '../contexts/CompanyBrandingContext';
import { Shield, X, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, resetPassword, configError } = useAuth();
  const { branding } = useCompanyBranding();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setResetEmail('');
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  }

  const primaryColor = branding?.primary_color || '#2563eb';
  const secondaryColor = branding?.secondary_color || '#1e40af';

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col justify-center relative overflow-hidden font-sans text-slate-200">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)]"></div>
      <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[500px] -left-[500px] w-[1000px] h-[1000px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        {configError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-red-400 font-bold text-sm mb-1 uppercase tracking-wider">Configuration Error</h2>
                <p className="text-red-400/80 text-sm">{configError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl mb-6 backdrop-blur-xl">
             <img src="/logo1.png" alt="Cybaem Tech" className="h-12 w-auto object-contain drop-shadow-2xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             {!branding?.logo_url && <Shield className="w-10 h-10 text-blue-500" />}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Cybaem Tech
          </h1>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Field Operations Portal</p>
        </div>

        <div className="bg-[#111111]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600 text-sm outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 pl-1 pr-1">
                  <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600 text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 rounded-xl font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-[0_0_40px_rgba(37,99,235,0.2)]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                 <>
                   Sign In
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </>
              )}
            </button>
            
            <div className="pt-6 mt-6 border-t border-white/5">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Quick Access Demo</p>
               <div className="grid grid-cols-2 gap-2">
                 {[
                   { label: 'Admin', email: 'admin@company.com', c: 'hover:border-rose-500/50 hover:bg-rose-500/10' },
                   { label: 'HR', email: 'hr@company.com', c: 'hover:border-emerald-500/50 hover:bg-emerald-500/10' },
                   { label: 'Engineer', email: 'engineer@company.com', c: 'hover:border-blue-500/50 hover:bg-blue-500/10' },
                   { label: 'Client', email: 'client@company.com', c: 'hover:border-amber-500/50 hover:bg-amber-500/10' },
                 ].map(demo => (
                   <button
                     key={demo.label}
                     type="button"
                     onClick={() => {
                       setEmail(demo.email);
                       setPassword('password123');
                     }}
                     className={`p-3 rounded-xl border border-white/5 bg-white/5 transition-all text-left group ${demo.c}`}
                   >
                     <p className="text-xs font-bold text-white mb-0.5">{demo.label}</p>
                     <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-300">{demo.email}</p>
                   </button>
                 ))}
               </div>
            </div>
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess(false);
                  setResetError('');
                  setResetEmail('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-4 rounded-xl text-sm flex items-center gap-3">
                <Shield className="w-5 h-5 shrink-0" />
                Reset link sent! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {resetError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {resetError}
                  </div>
                )}

                <div>
                  <label htmlFor="resetEmail" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    Email Address
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600 text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full text-white py-4 rounded-xl font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
