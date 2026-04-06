import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, Calendar, Plus, Send, CheckCircle, AlertCircle,
  LogOut, Navigation, Briefcase, TrendingUp, MapPin, ArrowRight,
  Sparkles, Download, ChevronRight, BarChart3, Activity, Map
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkInService } from '../../services/checkInService';
import { reportService } from '../../services/reportService';
import { leaveService } from '../../services/leaveService';
import { assignmentService } from '../../services/assignmentService';
import type { DailyReport, CheckIn, LeaveRequest, Assignment } from '../../types';

export default function EngineerDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'reports' | 'leave'>('attendance');
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  const [reportForm, setReportForm] = useState({ clientId: '', siteId: '', workDone: '', issues: '' });
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    if (user?.id) {
      loadData();
      const timer = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const engId = (user as any)?.engineerId || user?.id;
      if (!engId) { setLoading(false); return; }
      const [reportsData, checkInsData, leavesData, assignmentsData, todayCheck] = await Promise.all([
        reportService.getReports(engId),
        checkInService.getAllCheckIns(engId),
        leaveService.getMyLeaveRequests(engId),
        assignmentService.getMyAssignments(engId),
        checkInService.getTodayCheckIn(engId)
      ]);
      setReports([...reportsData]);
      setCheckIns(checkInsData.filter((c: CheckIn) => c.engineerId === engId));
      setLeaves([...leavesData]);
      setAssignments(assignmentsData);
      setTodayCheckIn(todayCheck);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    try {
      let lat = 0, lng = 0, locationName = 'Location unavailable', gotLocation = false;
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 });
          }).catch(async (err) => {
            if (err.code === 3 || err.code === 2) {
              return new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
              });
            }
            throw err;
          });
          lat = pos.coords.latitude; lng = pos.coords.longitude; gotLocation = true;
        } catch (geoErr: any) { if (geoErr.code === 1) throw geoErr; }
      }
      if (!gotLocation) {
        try { const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) }); const d = await r.json(); if (d.latitude) { lat = d.latitude; lng = d.longitude; gotLocation = true; } } catch {}
      }
      if (gotLocation) {
        try { const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`); const d = await r.json(); if (d.display_name) locationName = d.display_name; } catch { locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
      }
      const result = await checkInService.createCheckIn((user as any).engineerId || user.id, lat, lng, locationName);
      setTodayCheckIn(result); loadData();
      alert(gotLocation ? `Checked in at ${locationName}` : 'Checked in (location unavailable)');
    } catch (error: any) {
      alert(error.code === 1 ? 'Location access denied.' : (error.message || 'Check-in failed'));
    }
  };

  const handleCheckOut = async () => {
    if (!todayCheckIn) return;
    try { await checkInService.checkOut(todayCheckIn.id); setTodayCheckIn(null); loadData(); }
    catch { alert('Check-out failed'); }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportForm.clientId) return;
    try {
      const result = await reportService.createReport((user as any).engineerId || user.id, reportForm.clientId, reportForm.workDone, reportForm.issues, reportForm.siteId || undefined);
      const newReport: DailyReport = { ...result, clientName: assignments.find(a => a.clientId === reportForm.clientId)?.clientName || 'Project Report', date: result.date || new Date().toISOString().split('T')[0] };
      setReports(prev => [newReport, ...prev]);
      setReportForm({ clientId: '', siteId: '', workDone: '', issues: '' });
      await loadData(); alert('Report submitted successfully');
    } catch { alert('Failed to submit report'); }
  };

  const handleLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const result = await leaveService.createLeaveRequest((user as any).engineerId || user.id, leaveForm.startDate, leaveForm.endDate, leaveForm.reason);
      setLeaves(prev => [{ ...result, engineerName: user.name, status: 'pending' }, ...prev]);
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      await loadData(); alert('Leave request submitted');
    } catch { alert('Failed to submit leave request'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-[2px] border-blue-500/10"></div>
            <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase">Initializing Workspace</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'leave', label: 'Leave', icon: Calendar },
  ];

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">{greeting}</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
              <p className="text-slate-400 text-sm font-medium mt-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Field Engineering Console
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Status', value: todayCheckIn ? (todayCheckIn.checkOutTime ? 'Complete' : 'On Duty') : 'Pending', icon: Activity, dot: todayCheckIn ? (todayCheckIn.checkOutTime ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse') : 'bg-amber-400', color: 'blue' },
              { label: 'Total Reports', value: reports.length, icon: FileText, dot: null, color: 'indigo' },
              { label: 'Assignments', value: assignments.length, icon: TrendingUp, dot: null, color: 'purple' },
              { label: 'Leave Requests', value: leaves.length, icon: Calendar, dot: null, color: 'rose' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/10 group-hover:bg-${stat.color}-500/20 transition-colors`}>
                    <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  {stat.dot && <div className={`w-2 h-2 rounded-full ml-auto ${stat.dot}`}></div>}
                </div>
                <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 w-full max-w-md mb-8 shadow-2xl">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ ATTENDANCE ═══ */}
        {activeTab === 'attendance' && (
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            {/* Check-in Card */}
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold tracking-tight">Daily Attendance</h2>
                  <p className="text-slate-400 text-xs font-medium">GPS-verified authentication</p>
                </div>
              </div>

              <div className="p-6 relative z-10">
                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 mb-6 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${todayCheckIn ? (todayCheckIn.checkOutTime ? 'bg-slate-500' : 'bg-emerald-500 animate-pulse') : 'bg-amber-500'}`}></div>
                      {!todayCheckIn || (!todayCheckIn.checkOutTime) && (
                        <div className={`absolute inset-0 rounded-full blur-[4px] ${todayCheckIn ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Current Status</p>
                      <p className="font-bold text-white text-lg tracking-tight">
                        {todayCheckIn ? (todayCheckIn.checkOutTime ? 'Session Complete' : 'On Duty') : 'Not Checked In'}
                      </p>
                    </div>
                  </div>
                </div>

                {!todayCheckIn ? (
                  <button onClick={handleCheckIn} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-[0_0_30px_rgba(37,99,235,0.2)] group text-sm tracking-wide">
                    <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    Check In Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-50" />
                  </button>
                ) : !todayCheckIn.checkOutTime ? (
                  <button onClick={handleCheckOut} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] text-sm tracking-wide">
                    <LogOut className="w-5 h-5" />
                    Check Out
                  </button>
                ) : (
                  <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="font-bold text-emerald-400">Session Complete</p>
                      <p className="text-xs text-emerald-400/60 mt-1">Attendance recorded for today</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-white font-bold tracking-tight">Recent Activity</h2>
                <span className="ml-auto text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">{checkIns.length} logs</span>
              </div>
              <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto relative z-10 pr-2">
                {checkIns.slice(0, 8).map(ci => (
                  <div key={ci.id} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                      <Map className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200">
                        {new Date(ci.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {ci.checkOutTime && <span className="text-slate-500 font-medium"> → {new Date(ci.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{ci.locationName || 'Main Site'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${ci.checkOutTime ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {ci.checkOutTime ? 'Done' : 'Active'}
                    </span>
                  </div>
                ))}
                {checkIns.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-medium text-slate-500">No activity recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REPORTS ═══ */}
        {activeTab === 'reports' && (
          <div className="grid gap-6 md:grid-cols-2 max-w-6xl">
            {/* Submit Report */}
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden h-fit relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold tracking-tight">Submit Report</h2>
                  <p className="text-slate-400 text-xs font-medium">Log daily progress</p>
                </div>
              </div>

              <div className="p-6 relative z-10">
                <form onSubmit={handleReportSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Client / Project</label>
                    <select required value={reportForm.clientId} onChange={e => setReportForm({ ...reportForm, clientId: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white appearance-none cursor-pointer">
                      <option value="" className="bg-[#111]">Choose a client...</option>
                      {assignments.map((a, idx) => <option key={`${a.clientId}-${idx}`} value={a.clientId} className="bg-[#111]">{a.clientName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Work Accomplished</label>
                    <textarea required value={reportForm.workDone} onChange={e => setReportForm({ ...reportForm, workDone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all h-32 resize-none text-white placeholder:text-slate-600" placeholder="Detail the tasks completed..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Blockers <span className="text-slate-600">(Optional)</span></label>
                    <textarea value={reportForm.issues} onChange={e => setReportForm({ ...reportForm, issues: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all h-20 resize-none text-white placeholder:text-slate-600" placeholder="Any issues to report?" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(79,70,229,0.2)] group">
                    <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform opacity-70" />
                    Submit Log
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-white font-bold tracking-tight">Recent Logs</h2>
                <span className="ml-auto text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">{reports.length} total</span>
              </div>
              <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto relative z-10 pr-2">
                {reports.length > 0 ? reports.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()).slice(0, 10).map(report => (
                  <div key={report.id} className="p-5 bg-black/40 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-slate-200">{report.clientName || 'General Report'}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.date || report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{report.workDone}</p>
                    {report.issues && (
                      <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-xs font-medium text-red-300">{report.issues}</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-16">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-medium text-slate-500">No reports submitted</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ LEAVE ═══ */}
        {activeTab === 'leave' && (
          <div className="grid gap-6 md:grid-cols-2 max-w-6xl">
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden h-fit relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold tracking-tight">Request Leave</h2>
                  <p className="text-slate-400 text-xs font-medium">Submit for HR approval</p>
                </div>
              </div>
              
              <div className="p-6 relative z-10">
                <form onSubmit={handleLeaveRequest} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Start Date</label>
                      <input required type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all text-white color-scheme-dark" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">End Date</label>
                      <input required type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all text-white color-scheme-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Reason</label>
                    <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all h-28 resize-none text-white placeholder:text-slate-600" placeholder="Provide a brief explanation..." />
                  </div>
                  <button type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(225,29,72,0.2)]">
                    <Plus className="w-4 h-4 opacity-70" /> Submit Request
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-white font-bold tracking-tight">Leave History</h2>
                <span className="ml-auto text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">{leaves.length} records</span>
              </div>
              <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto relative z-10 pr-2">
                {leaves.length > 0 ? leaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(leave => (
                  <div key={leave.id} className="p-5 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-slate-200">
                          {new Date(leave.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(leave.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                        leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        leave.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 italic bg-white/5 p-3 rounded-xl border border-white/5">"{leave.reason}"</p>
                  </div>
                )) : (
                  <div className="text-center py-16">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-medium text-slate-500">No leave history</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
