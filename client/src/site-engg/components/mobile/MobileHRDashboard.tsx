import { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, Calendar, FileText, 
  TrendingUp, BarChart3, RefreshCw, ChevronRight,
  Filter, Download, Mail, Send, AlertCircle, X, Search, Settings, LogOut, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../lib/storage';
import { checkInService } from '../../services/checkInService';
import { reportService } from '../../services/reportService';
import { leaveService } from '../../services/leaveService';
import { hrReportService } from '../../services/hrReportService';
import { profileService } from '../../services/profileService';
import MusterRoll from '../MusterRoll';
import type { CheckIn, LeaveRequest, DailyReport, Engineer } from '../../types';

export default function MobileHRDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'muster' | 'leave' | 'reports' | 'enterprise' | 'profiles'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [stats, setStats] = useState({ present: 0, pendingLeaves: 0, totalEng: 0, reportsToday: 0 });

  useEffect(() => { loadData(); }, [activeTab, selectedDate]);

  async function loadData(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [engList, allCheckIns, allLeaves, allReports] = await Promise.all([
        StorageService.getEngineers(),
        checkInService.getAllCheckIns(),
        leaveService.getAllLeaveRequests(),
        reportService.getReports()
      ]);
      
      const dayCheckIns = allCheckIns.filter(c => c.date === selectedDate);
      const dayReports = allReports.filter((r: any) => (r.date || r.createdAt?.slice(0,10)) === selectedDate);
      const pending = allLeaves.filter(l => l.status === 'pending');
      
      setEngineers(engList);
      setCheckIns(dayCheckIns);
      setLeaveRequests(allLeaves);
      setReports(dayReports);
      setStats({
        present: dayCheckIns.filter(c => !c.checkOutTime).length,
        pendingLeaves: pending.length,
        totalEng: engList.length,
        reportsToday: dayReports.length
      });
    } catch (e) { console.error(e); } finally { setLoading(false); setRefreshing(false); }
  }

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') await leaveService.approveLeave(id, 'hr');
      else await leaveService.rejectLeave(id, 'hr');
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-[2px] border-emerald-500/20"></div>
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-emerald-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pb-24 font-sans text-slate-200">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5 pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-teal-600/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex justify-between items-center relative z-10 px-6 pt-10 mb-6">
          <div>
             <p className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Personnel Management</p>
             <h1 className="text-2xl font-extrabold text-white tracking-tight">HR Console</h1>
          </div>
          <button onClick={() => loadData(true)} className="p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 shadow-lg active:scale-90 transition-all hover:bg-white/10">
             <RefreshCw className={`w-5 h-5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10 px-6">
          {[ 
            {l: 'Active Now', v: stats.present, i: CheckCircle, c: 'emerald'},
            {l: 'Pend Leaves', v: stats.pendingLeaves, i: Clock, c: 'amber'},
            {l: 'Total Staff', v: stats.totalEng, i: Users, c: 'blue'},
            {l: 'Work Reports', v: stats.reportsToday, i: FileText, c: 'purple'}
          ].map(s => (
            <div key={s.l} className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-inner flex items-center gap-3">
               <div className={`p-2 rounded-lg bg-${s.c}-500/10 border border-${s.c}-500/20`}><s.i className={`w-4 h-4 text-${s.c}-400`} /></div>
               <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{s.l}</p>
                  <p className="text-xl font-extrabold text-white tracking-tight leading-none">{s.v}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 z-50 flex justify-around items-center px-4 py-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         {[
           { id: 'overview', icon: BarChart3, label: 'Stats' },
           { id: 'muster', icon: Calendar, label: 'Roll' },
           { id: 'leave', icon: Clock, label: 'Leave' },
           { id: 'reports', icon: FileText, label: 'Feed' },
           { id: 'profiles', icon: Users, label: 'Staff' }
         ].map(t => (
           <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${activeTab === t.id ? 'text-emerald-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{t.label}</span>
              {activeTab === t.id && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
           </button>
         ))}
      </div>

      <div className="px-6 pt-6 relative z-20 space-y-6">
        {/* Date Filter */}
        <div className="bg-[#111111] p-4 rounded-2xl shadow-xl border border-white/5 flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[30px] pointer-events-none"></div>
           <div className="flex items-center gap-3 px-2 relative z-10 w-full">
              <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
              <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="font-bold text-sm bg-transparent outline-none text-white color-scheme-dark w-full" />
           </div>
        </div>

        {activeTab === 'muster' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#111111] rounded-3xl border border-white/5 overflow-hidden">
             <MusterRoll />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
             <div className="bg-[#111111] p-8 rounded-3xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Morning Sync</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Force Readiness Check</p>
                  </div>
                  <div className="text-4xl font-extrabold text-white">{Math.round((stats.present/(stats.totalEng || 1))*100)}<span className="text-2xl text-emerald-400">%</span></div>
                </div>
             </div>
             
             <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 px-2">Key Modules</h4>
                <div className="grid gap-3">
                   {[
                     {l: 'Enterprise Reports', i: TrendingUp, s: 'Weekly/Monthly Exports', c: 'blue', a: () => setActiveTab('enterprise')},
                     {l: 'Payroll Data', i: BarChart3, s: 'Engagement Summaries', c: 'purple', a: () => setActiveTab('reports')},
                     {l: 'Staff Directory', i: LayoutDashboard, s: 'Engineer Profiles', c: 'orange', a: () => setActiveTab('profiles')}
                   ].map(m => (
                     <button key={m.l} onClick={m.a} className="w-full bg-[#111111] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 active:scale-95 transition-all relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className={`p-3 bg-${m.c}-500/10 border border-${m.c}-500/20 rounded-xl text-${m.c}-400`}><m.i className="w-5 h-5" /></div>
                           <div className="text-left">
                             <p className="font-bold text-white tracking-tight">{m.l}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.s}</p>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors relative z-10" />
                     </button>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
             {checkIns.length > 0 ? checkIns.map(c => (
               <div key={c.id} className="bg-[#111111] p-5 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-300">{c.engineerName?.charAt(0)}</div>
                     <div>
                       <p className="text-sm font-bold text-white">{c.engineerName}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 inline-block">
                         {new Date(c.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {c.site||'Site'}
                       </p>
                     </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-widest border ${c.checkOutTime ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}>{c.checkOutTime ? 'Offline' : 'Active'}</div>
               </div>
             )) : (
               <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/5">
                  <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm font-bold text-white tracking-tight">No check-ins yet</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'enterprise' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 text-white relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none"></div>
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold tracking-tight">Enterprise Core</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Use desktop view for full analytics</p>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
             {leaveRequests.filter(l => l.status === 'pending').length > 0 ? 
               leaveRequests.filter(l => l.status === 'pending').map(l => (
                 <div key={l.id} className="bg-[#111111] p-6 rounded-3xl border border-amber-500/20 shadow-2xl space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                       <div>
                         <h5 className="font-bold text-white">{l.engineerName}</h5>
                         <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 inline-block">
                           {new Date(l.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} — {new Date(l.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                         </p>
                       </div>
                       <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400"><Calendar className="w-4 h-4" /></div>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[11px] font-medium text-slate-300 leading-relaxed italic relative z-10">"{l.reason}"</div>
                    <div className="flex gap-3 relative z-10">
                       <button onClick={()=>handleLeaveAction(l.id, 'approved')} className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 transition-all">Approve</button>
                       <button onClick={()=>handleLeaveAction(l.id, 'rejected')} className="flex-1 py-3.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 hover:bg-white/10 transition-all">Decline</button>
                    </div>
                 </div>
               ))
             : (
               <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/5">
                 <CheckCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-4" />
                 <p className="text-sm font-bold text-white tracking-tight">All Caught Up</p>
                 <p className="text-xs text-slate-500 mt-1 font-medium">No pending leave requests</p>
               </div>
             )}
             
             {leaveRequests.filter(l => l.status !== 'pending').length > 0 && (
               <div className="mt-8">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Recent Decisions</h4>
                 <div className="space-y-3">
                   {leaveRequests.filter(l => l.status !== 'pending').slice(0, 5).map(l => (
                     <div key={l.id} className="bg-[#111111] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                       <div>
                         <p className="text-xs font-bold text-white">{l.engineerName}</p>
                         <p className="text-[10px] text-slate-500 mt-1">{new Date(l.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                       </div>
                       <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                         l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                       }`}>{l.status}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
             {reports.length > 0 ? reports.map(r => (
               <div key={r.id} className="bg-[#111111] p-6 rounded-3xl border border-white/5 shadow-xl space-y-4 relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-bold text-slate-400">{r.engineerName?.charAt(0) || 'R'}</div>
                       <div>
                         <p className="font-bold text-white leading-none">{r.engineerName}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{r.clientName}</p>
                       </div>
                     </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed relative z-10 bg-black/40 p-4 rounded-xl border border-white/5">"{ r.workDone }"</p>
                  {r.issues && (
                     <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 relative z-10">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-medium text-red-300">{r.issues}</p>
                     </div>
                  )}
               </div>
             )) : (
               <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/5">
                 <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                 <p className="text-sm font-bold text-white tracking-tight">No Reports Today</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'profiles' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 grid grid-cols-2 gap-4 pb-4">
              {engineers.map(e => (
                 <div key={e.id} className="bg-[#111111] p-5 rounded-3xl border border-white/5 text-center space-y-4 shadow-xl hover:bg-white/5 transition-colors">
                    <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl text-blue-400">
                      {e.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight text-sm leading-tight">{e.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Engineer</p>
                    </div>
                 </div>
              ))}
              {engineers.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-[#111111] rounded-3xl border border-white/5">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">No Staff Found</p>
                </div>
              )}
           </div>
        )}
      </div>

      {/* Global Config Actions (Floating) */}
      <div className="fixed bottom-28 right-6 flex flex-col gap-3 group z-50">
         <button onClick={() => signOut()} className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-90 transition-all border border-red-500/50">
            <LogOut className="w-5 h-5 ml-1" />
         </button>
      </div>
    </div>
  );
}
