import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, FileText, MapPin, Building2, Clock, Calendar,
  RefreshCw, CheckCircle, AlertCircle, ChevronRight, Sparkles,
  TrendingUp, BarChart3, LogOut
} from 'lucide-react';
import { Assignment, DailyReport, CheckIn, LeaveRequest, Client, User, Site } from '../../types';
import { StorageService } from '../../lib/storage';
import MusterRoll from '../MusterRoll';

export default function MobileClientDashboard() {
  const { user, signOut } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'reports' | 'muster'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, [user, selectedDate]);

  async function loadData(isRefresh = false) {
    if (!user) return;
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [allClients, allAssignments, allReports, allCheckIns, allLeaves, allEngineers, allSites] = await Promise.all([
        StorageService.getClients(), StorageService.getAssignments(), StorageService.getDailyReports(),
        StorageService.getCheckIns(), StorageService.getLeaveRequests(), StorageService.getEngineers(), StorageService.getSites()
      ]);

      setEngineers(allEngineers);
      setSites(allSites);

      const clientData = allClients.find((c: Client) => c.email === user.email || c.userId === user.id);
      if (!clientData) { setLoading(false); setRefreshing(false); return; }
      setClient(clientData);

      const clientAssignments = allAssignments.filter((a: Assignment) => a.clientId === clientData.id);
      setAssignments(clientAssignments);
      const engineerIds = clientAssignments.map((a: Assignment) => a.engineerId);

      setReports(allReports.filter((r: DailyReport) => r.date === selectedDate && engineerIds.includes(r.engineerId)));
      setCheckIns(allCheckIns.filter((c: CheckIn) => c.date === selectedDate && engineerIds.includes(c.engineerId)));
      setLeaves(allLeaves.filter((l: LeaveRequest) => l.status === 'approved' && engineerIds.includes(l.engineerId)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const getEngineer = (id: string) => engineers.find(e => e.id === id);
  const isOnLeave = (engId: string) => {
    const d = new Date(selectedDate);
    return leaves.find(l => l.engineerId === engId && d >= new Date(l.startDate) && d <= new Date(l.endDate));
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-[2px] border-amber-500/20"></div>
            <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-amber-400 animate-spin"></div>
            <Building2 className="absolute inset-0 m-auto w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const assignedEngIds = assignments.map(a => a.engineerId);
  const activeEngineers = engineers.filter(e => assignedEngIds.includes(e.id));

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pb-28 font-sans text-slate-200">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5 pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-transparent to-orange-600/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="relative px-6 pt-10 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-amber-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Client Portal</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{client?.name || 'Client Portal'}</h1>
              <p className="text-slate-400 text-xs font-medium mt-1.5">{client?.contactPerson || user?.name}</p>
            </div>
            <button onClick={() => loadData(true)} disabled={refreshing}
              className="p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 shadow-lg active:scale-90 transition-all hover:bg-white/10">
              <RefreshCw className={`w-5 h-5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 relative z-10">
            {[
              { label: 'Engineers', value: activeEngineers.length, c: 'blue' },
              { label: 'Present', value: checkIns.length, c: 'emerald' },
              { label: 'Reports', value: reports.length, c: 'purple' }
            ].map(s => (
              <div key={s.label} className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-inner">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                 <p className={`text-xl font-extrabold tracking-tight leading-none text-white`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 z-50 flex justify-around items-center px-4 py-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'overview', label: 'Main', icon: TrendingUp },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'muster', label: 'Muster', icon: BarChart3 }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${activeTab === tab.id ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />}
          </button>
        ))}
      </div>

      <div className="px-6 pt-6 relative z-20 space-y-6">
        {/* Date Filter */}
        <div className="bg-[#111111] p-4 rounded-2xl shadow-xl border border-white/5 flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[30px] pointer-events-none"></div>
           <div className="flex items-center gap-3 px-2 relative z-10 w-full">
              <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
              <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="font-bold text-sm bg-transparent outline-none text-white color-scheme-dark w-full" />
           </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg"><Clock className="w-4 h-4 text-amber-400" /></div>
                <h3 className="font-bold text-white tracking-tight">Today's Attendance</h3>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                {activeEngineers.map(eng => {
                  const ci = checkIns.find(c => c.engineerId === eng.id);
                  const onLeave = isOnLeave(eng.id);
                  return (
                    <div key={eng.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-sm">
                          {eng.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{eng.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{(eng as any).designation || 'Engineer'}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                        ci ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        onLeave ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {ci ? (ci.checkOutTime ? 'Done' : 'Present') : onLeave ? 'Leave' : 'Absent'}
                      </span>
                    </div>
                  );
                })}
                {activeEngineers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white">No engineers assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Assigned Engineers</h3>
            {activeEngineers.map(eng => {
              const ci = checkIns.find(c => c.engineerId === eng.id);
              const report = reports.find(r => r.engineerId === eng.id);
              return (
                <div key={eng.id} className="bg-[#111111] rounded-3xl border border-white/5 shadow-xl p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg">
                      {eng.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{eng.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{eng.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${ci ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {ci ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  {ci && (
                    <div className="bg-black/40 rounded-xl p-3 text-xs text-slate-400 font-medium border border-white/5 mt-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-white">Check-in:</span> {new Date(ci.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {ci.locationName && <span className="ml-1 text-slate-500 truncate">· {ci.locationName}</span>}
                    </div>
                  )}
                  {report && (
                    <div className="bg-blue-500/5 rounded-xl p-3 mt-3 text-xs text-blue-300 font-medium border border-blue-500/10 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <div className="line-clamp-2">
                        <span className="font-bold text-blue-400">Report:</span> {report.workDone}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {activeEngineers.length === 0 && (
              <div className="text-center py-12 bg-[#111111] rounded-3xl border border-white/5">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">No Team Assigned</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="flex justify-between items-center px-2 mb-2">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Reports
              </h3>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">{reports.length} logs</span>
            </div>
            {reports.length > 0 ? reports.map(report => {
              const eng = getEngineer(report.engineerId);
              return (
                <div key={report.id} className="bg-[#111111] rounded-3xl border border-white/5 shadow-xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-400 text-sm">
                      {eng?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{eng?.name || 'Engineer'}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 relative z-10">"{report.workDone}"</p>
                  {report.issues && (
                    <div className="flex items-start gap-3 mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 relative z-10">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-red-300/90">{report.issues}</p>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/5">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-white tracking-tight">No Reports</p>
                <p className="text-xs font-medium text-slate-500 mt-1">No reports for this date</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'muster' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#111111] rounded-3xl border border-white/5 overflow-hidden p-2">
            <MusterRoll clientId={client?.id || ''} engineerIds={assignedEngIds} />
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
