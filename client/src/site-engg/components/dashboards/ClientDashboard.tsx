import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, FileText, MapPin, Download, Building2, Clock, TrendingUp, Calendar, LayoutDashboard } from 'lucide-react';
import { Assignment, DailyReport, CheckIn, LeaveRequest, Client, User, Site } from '../../types';
import { exportToCSV } from '../../lib/export';
import { StorageService } from '../../lib/storage';
import MusterRoll from '../MusterRoll';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'enterprise' | 'muster'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, selectedDate]);

  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);
      const [allClients, allAssignments, allReports, allCheckIns, allLeaves, allEngineers, allSites] = await Promise.all([
        StorageService.getClients(),
        StorageService.getAssignments(),
        StorageService.getDailyReports(),
        StorageService.getCheckIns(),
        StorageService.getLeaveRequests(),
        StorageService.getEngineers(),
        StorageService.getSites()
      ]);

      setEngineers(allEngineers);
      setSites(allSites);

      const clientData = allClients.find((c: Client) => c.email === user.email || c.userId === user.id);
      if (!clientData) {
        setLoading(false);
        return;
      }
      setClient(clientData);

      const clientAssignments = allAssignments.filter((a: Assignment) => a.clientId === clientData.id);
      setAssignments(clientAssignments);

      const engineerIds = clientAssignments.map((a: Assignment) => a.engineerId);

      const filteredReports = allReports.filter((r: DailyReport) => 
        r.date === selectedDate && engineerIds.includes(r.engineerId)
      );
      setReports(filteredReports);

      const filteredCheckIns = allCheckIns.filter((c: CheckIn) =>
        c.date === selectedDate && engineerIds.includes(c.engineerId)
      );
      setCheckIns(filteredCheckIns);

      const filteredLeaves = allLeaves.filter((l: LeaveRequest) =>
        l.status === 'approved' && engineerIds.includes(l.engineerId)
      );
      setLeaves(filteredLeaves);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getEngineerById(id: string): User | undefined {
    return engineers.find(e => e.id === id);
  }

  function getSiteById(id: string): Site | undefined {
    return sites.find(s => s.id === id);
  }

  function isEngineerOnLeave(engineerId: string): LeaveRequest | undefined {
    const today = new Date(selectedDate);
    return leaves.find(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      return leave.engineerId === engineerId && today >= start && today <= end;
    });
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-[2px] border-amber-500/10"></div>
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-amber-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-slate-200">
      {/* ─── Premium Dark Header ─── */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-transparent to-orange-600/5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-start gap-5 mb-2">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <Building2 className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5">{client ? client.name : 'Client Portal'}</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Dashboard</h1>
              <p className="text-slate-400 text-sm font-medium mt-2">Project oversight & workforce analytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 -mt-8 relative z-10">
        <div className="flex p-1 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border border-white/5 w-full overflow-x-auto scrollbar-hide shadow-2xl mb-8">
           {[
             { id: 'overview', label: 'Overview', icon: LayoutDashboard },
             { id: 'reports', label: 'Work Reports', icon: FileText },
             { id: 'enterprise', label: 'Enterprise', icon: TrendingUp },
             { id: 'muster', label: 'Muster Roll', icon: Calendar }
           ].map(t => (
             <button 
               key={t.id} 
               onClick={() => setActiveTab(t.id as any)}
               className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs tracking-wide whitespace-nowrap transition-all ${
                 activeTab === t.id 
                   ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                   : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
               }`}
             >
               <t.icon className="w-4 h-4" />
               {t.label}
             </button>
           ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-[#111111] rounded-3xl p-6 shadow-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab('enterprise')}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-extrabold text-white tracking-tight">{assignments.length}</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Assigned Engineers</p>
              </div>
            </div>

            <div className="bg-[#111111] rounded-3xl p-6 shadow-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab('reports')}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-extrabold text-white tracking-tight">{reports.length}</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Today's Reports</p>
              </div>
            </div>

            <div className="bg-[#111111] rounded-3xl p-6 shadow-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab('muster')}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-extrabold text-white tracking-tight">{checkIns.length}</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Check-ins Today</p>
              </div>
            </div>

            <div className="bg-[#111111] rounded-3xl p-6 shadow-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab('muster')}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  {assignments.filter(a => isEngineerOnLeave(a.engineerId)).length}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">On Leave</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="mb-8 bg-[#111111] rounded-2xl p-5 shadow-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Selection</h2>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-sm font-medium text-white color-scheme-dark"
            />
          </div>
        )}

        <div className="grid gap-6 mb-8">
          {activeTab === 'overview' && (
            <div className="bg-[#111111] rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
                <h3 className="font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  Assigned Engineers
                </h3>
              </div>
              <div className="p-6 relative z-10">
                <div className="grid gap-4 md:grid-cols-2">
                  {assignments.length > 0 ? assignments.map(assignment => {
                    const engineer = getEngineerById(assignment.engineerId);
                    const site = assignment.siteId ? getSiteById(assignment.siteId) : null;
                    const leave = isEngineerOnLeave(assignment.engineerId);
                    const backupEngineer = leave?.backupEngineerId ? getEngineerById(leave.backupEngineerId) : null;

                    return (
                      <div key={assignment.id} className="border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-all bg-black/40 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{engineer?.name || 'Unknown Engineer'}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">{engineer?.email}</p>
                            {site && (
                              <div className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 bg-white/5 rounded border border-white/5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{site.name}</span>
                              </div>
                            )}
                          </div>
                          {leave ? (
                            <div className="text-right">
                              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                On Leave
                              </span>
                              {backupEngineer && (
                                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">
                                  Backup: {backupEngineer.name}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="col-span-full text-center py-8 text-slate-500 font-medium">No engineers assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <div className="bg-[#111111] rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
                <h3 className="font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                  Attendance Insights
                </h3>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                {checkIns.length > 0 ? checkIns.map(checkIn => {
                  const engineer = getEngineerById(checkIn.engineerId);
                  return (
                    <div key={checkIn.id} className="border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-all bg-black/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">{engineer?.name || 'Unknown Engineer'}</h4>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <p className="text-xs text-slate-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                              <Clock className="w-3 h-3" />
                              IN: {new Date(checkIn.checkInTime).toLocaleTimeString()}
                            </p>
                            {checkIn.checkOutTime && (
                              <p className="text-xs text-slate-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Clock className="w-3 h-3" />
                                OUT: {new Date(checkIn.checkOutTime).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {checkIn.latitude && checkIn.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${checkIn.latitude},${checkIn.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl transition-all active:scale-95"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            View Site
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center py-8 text-slate-500 font-medium">No check-ins available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-[#111111] rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
                <h3 className="font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  Work Reports
                </h3>
                <button
                  onClick={() => {
                    const exportData = reports.map(r => {
                      const engineer = getEngineerById(r.engineerId);
                      const site = r.siteId ? getSiteById(r.siteId) : null;
                      return {
                        Engineer: engineer?.name || '',
                        Site: site?.name || '-',
                        Date: r.date,
                        WorkDone: r.workDone,
                        Issues: r.issues || 'None',
                      };
                    });
                    exportToCSV(exportData, `reports-${client?.name || 'client'}-${selectedDate}`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export All
                </button>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                {reports.length > 0 ? reports.map(report => {
                  const engineer = getEngineerById(report.engineerId);
                  const site = report.siteId ? getSiteById(report.siteId) : null;
                  return (
                    <div key={report.id} className="border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-all bg-black/40">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-400 border border-white/10">
                            {engineer?.name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white leading-none">{engineer?.name || 'Staff'}</h4>
                            {site && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{site.name}</p>}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2.5 py-1 rounded border border-white/5">
                          {new Date(report.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Scope of Work</p>
                          <p className="text-sm text-slate-300 leading-relaxed italic">"{report.workDone}"</p>
                        </div>
                        {report.issues && (
                          <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                            <p className="text-[9px] font-bold text-red-400/70 uppercase tracking-[0.2em] mb-2">Detected Blockers</p>
                            <p className="text-sm text-red-400 font-bold leading-relaxed">"{report.issues}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-[10px]">No status reports found for this interval</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'muster' && (
            <MusterRoll clientId={client?.id} />
          )}
        </div>
      </div>
    </div>
  );
}
