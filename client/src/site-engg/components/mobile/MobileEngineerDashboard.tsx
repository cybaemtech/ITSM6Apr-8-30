import { useState, useEffect } from 'react';
import {
  FileText, Clock, AlertCircle, Loader2, RefreshCw,
  Calendar, Send, Briefcase, Sparkles, Plus, MapPin,
  LogOut, ChevronRight, Download, Home, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkInService } from '../../services/checkInService';
import { reportService } from '../../services/reportService';
import { leaveService } from '../../services/leaveService';
import { assignmentService } from '../../services/assignmentService';
import type { CheckIn, DailyReport, LeaveRequest, Assignment } from '../../types';
import CheckInCard from './CheckInCard';

export default function MobileEngineerDashboard() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [allReports, setAllReports] = useState<DailyReport[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'reports' | 'leave'>('today');

  const [reportForm, setReportForm] = useState({ clientId: '', workDone: '', issues: '' });
  const [reportLoading, setReportLoading] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [leaveLoading, setLeaveLoading] = useState(false);

  const engineerId = (user as any)?.engineerId || user?.id;

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, [user]);

  async function loadData(isRefresh = false) {
    if (!user || !engineerId) return;
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [checkIn, leaves, assign, reportsData] = await Promise.all([
        checkInService.getTodayCheckIn(engineerId),
        leaveService.getMyLeaveRequests(engineerId),
        assignmentService.getMyAssignments(engineerId),
        reportService.getReports(engineerId),
      ]);
      const today = new Date().toISOString().split('T')[0];
      setTodayCheckIn(checkIn);
      setTodayReport((reportsData || []).find((r: DailyReport) => r.date === today) || null);
      setAllReports(reportsData || []);
      setLeaveRequests(leaves || []);
      setAssignments(assign || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  const handleReportSubmit = async () => {
    if (!user || !reportForm.workDone.trim()) return;
    const a = assignments.find(x => x.clientId === reportForm.clientId) || assignments[0];
    const clientId = reportForm.clientId || (a ? a.clientId : '');
    if (!clientId) return alert("Please select a client before submitting.");
    
    setReportLoading(true);
    try {
      const result = await reportService.createReport(engineerId, clientId, reportForm.workDone, reportForm.issues || undefined, a?.siteId || undefined);
      setTodayReport(result);
      setAllReports(prev => [result, ...prev]);
      setReportForm({ clientId: '', workDone: '', issues: '' });
      loadData();
    } catch (e: any) { alert(e.message || 'Failed to submit'); }
    finally { setReportLoading(false); }
  };

  const handleLeaveSubmit = async () => {
    if (!user || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) return;
    setLeaveLoading(true);
    try {
      const result = await leaveService.createLeaveRequest(engineerId, leaveForm.startDate, leaveForm.endDate, leaveForm.reason);
      setLeaveRequests([result, ...leaveRequests]);
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      loadData();
    } catch (e: any) { alert(e.message || 'Failed to submit'); }
    finally { setLeaveLoading(false); }
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-[2px] border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-blue-400 animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-blue-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-slate-200 pb-24 selection:bg-blue-500/30">
      {/* ─── Dark Premium Header ─── */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-violet-600/5"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-[60px] -ml-24 -mb-24 pointer-events-none"></div>
        
        <div className="relative px-6 pt-12 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-blue-400/60 text-[10px] font-bold uppercase tracking-[0.25em] mb-2">{greeting}</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">{user?.name?.split(' ')[0]}</h1>
              <p className="text-slate-400 text-xs font-medium mt-2 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button onClick={() => loadData(true)} disabled={refreshing}
              className="mt-1 p-3 bg-white/5 rounded-xl border border-white/5 active:scale-90 transition-all backdrop-blur-sm hover:bg-white/10 text-white shadow-xl">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Stat Pills */}
          <div className="flex gap-3">
            <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${todayCheckIn ? (todayCheckIn.checkOutTime ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]') : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'}`}></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
              </div>
              <p className="text-sm font-extrabold text-white">{todayCheckIn ? (todayCheckIn.checkOutTime ? 'Done' : 'Active') : 'Pending'}</p>
            </div>
            <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-inner">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Projects</span>
              <p className="text-sm font-extrabold text-white">{assignments.length}</p>
            </div>
            <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-inner">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Reports</span>
              <p className="text-sm font-extrabold text-white">{allReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="flex">
          {[
            { id: 'today', label: 'Today', icon: Clock },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'leave', label: 'Leave', icon: Calendar }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="p-6 space-y-6">

        {/* ═══ TODAY TAB ═══ */}
        {activeTab === 'today' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <CheckInCard
              checkIn={todayCheckIn}
              onCheckInComplete={(c) => { setTodayCheckIn(c); loadData(); }}
              onCheckOutComplete={() => { setTodayCheckIn(null); loadData(); }}
            />

            {/* Daily Report Section */}
            {todayReport ? (
              <div className="bg-[#111111] rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
                <div className="bg-emerald-500/10 px-6 py-4 flex items-center gap-3 border-b border-emerald-500/20">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-bold text-sm tracking-tight">Report Submitted</span>
                  <span className="ml-auto text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 px-2 py-1 rounded-md bg-emerald-500/10">✓ Complete</span>
                </div>
                <div className="p-6 relative z-10">
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{todayReport.workDone}</p>
                  {todayReport.issues && (
                    <div className="flex items-start gap-3 mt-4 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-red-300/90">{todayReport.issues}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
                <div className="bg-black/40 px-6 py-4 flex items-center gap-3 border-b border-white/5">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-bold text-sm tracking-tight">Daily Report</span>
                  <span className="ml-auto text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">Required</span>
                </div>
                <div className="p-6 space-y-4 relative z-10">
                  {assignments.length > 0 && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Select Client</label>
                      <select required value={reportForm.clientId} onChange={e => setReportForm({ ...reportForm, clientId: e.target.value })}
                        className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 text-white outline-none transition-all appearance-none cursor-pointer">
                        <option value="" className="bg-[#111]">Choose a client...</option>
                        {assignments.map((a, idx) => <option key={`${a.clientId}-${idx}`} value={a.clientId} className="bg-[#111]">{a.clientName}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Work Completed *</label>
                    <textarea value={reportForm.workDone} onChange={e => setReportForm({ ...reportForm, workDone: e.target.value })}
                      placeholder="Describe tasks completed today..." rows={3}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Issues <span className="text-slate-600">(Optional)</span></label>
                    <textarea value={reportForm.issues} onChange={e => setReportForm({ ...reportForm, issues: e.target.value })}
                      placeholder="Any blockers or concerns?" rows={2}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none" />
                  </div>
                  <button onClick={handleReportSubmit} disabled={reportLoading || !reportForm.workDone.trim() || (assignments.length > 0 && !reportForm.clientId)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 shadow-[0_0_30px_rgba(37,99,235,0.2)] mt-2">
                    {reportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {reportLoading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            )}

            {/* Pending Leave Notice */}
            {leaveRequests.find(l => l.status === 'pending') && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                <Clock className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-amber-400 text-sm tracking-tight">Pending Leave Approval</p>
                  <p className="text-xs font-medium text-amber-400/70 mt-1">
                    {new Date(leaveRequests.find(l => l.status === 'pending')!.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} — {new Date(leaveRequests.find(l => l.status === 'pending')!.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ REPORTS TAB ═══ */}
        {activeTab === 'reports' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="bg-black/40 px-6 py-4 flex items-center gap-3 border-b border-white/5">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold text-sm tracking-tight">Quick Log</span>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                {assignments.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Select Client</label>
                    <select required value={reportForm.clientId} onChange={e => setReportForm({ ...reportForm, clientId: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                      <option value="" className="bg-[#111]">Choose a client...</option>
                      {assignments.map((a, idx) => <option key={`${a.clientId}-${idx}`} value={a.clientId} className="bg-[#111]">{a.clientName}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Work Completed *</label>
                  <textarea value={reportForm.workDone} onChange={e => setReportForm({ ...reportForm, workDone: e.target.value })}
                    placeholder="Describe tasks completed..." rows={3}
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Issues <span className="text-slate-600">(Optional)</span></label>
                  <textarea value={reportForm.issues} onChange={e => setReportForm({ ...reportForm, issues: e.target.value })}
                    placeholder="Any blockers or concerns?" rows={2}
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none" />
                </div>
                <button onClick={handleReportSubmit} disabled={reportLoading || !reportForm.workDone.trim() || (assignments.length > 0 && !reportForm.clientId)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 shadow-[0_0_30px_rgba(37,99,235,0.2)] tracking-wide mt-2">
                  {reportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report History</h3>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">{allReports.length} total</span>
              </div>
              
              {allReports.length > 0 ?
                allReports.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()).map(report => (
                  <div key={report.id} className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-black/40 px-2.5 py-1 rounded border border-white/5">
                        {new Date(report.date || report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {report.clientName && <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">{report.clientName}</span>}
                    </div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">{report.workDone}</p>
                    {report.issues && (
                      <div className="flex items-start gap-3 mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-red-300/90">{report.issues}</p>
                      </div>
                    )}
                  </div>
                ))
              : (
                <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/5">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <FileText className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-sm font-bold text-white tracking-tight">No Reports Yet</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Your submitted reports will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ LEAVE TAB ═══ */}
        {activeTab === 'leave' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="bg-black/40 px-6 py-4 flex items-center gap-3 border-b border-white/5">
                <Calendar className="w-5 h-5 text-violet-400" />
                <span className="text-white font-bold text-sm tracking-tight">Request Leave</span>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Start Date</label>
                    <input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all color-scheme-dark" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">End Date</label>
                    <input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all color-scheme-dark" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Reason</label>
                  <textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    rows={3} placeholder="Briefly explain..."
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all resize-none" />
                </div>
                <button onClick={handleLeaveSubmit} disabled={leaveLoading || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 shadow-[0_0_30px_rgba(124,58,237,0.2)] mt-2">
                  {leaveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {leaveLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">History</h3>
              {leaveRequests.length > 0 ? leaveRequests.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(leave => (
                <div key={leave.id} className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl p-5 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                      leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      leave.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>{leave.status}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 italic bg-black/40 p-3 rounded-xl border border-white/5">"{leave.reason}"</p>
                </div>
              )) : (
                <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/5">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                     <Calendar className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-sm font-bold text-white tracking-tight">No Leave Requests</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Your leave history will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
