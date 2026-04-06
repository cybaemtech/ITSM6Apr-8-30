import { useState } from 'react';
import { Calendar, Send, Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService } from '../../services/leaveService';
import type { LeaveRequest } from '../../types';

interface LeaveCardProps {
  leaveRequests: LeaveRequest[];
  onLeaveSubmit: (leave: LeaveRequest) => void;
}

export default function LeaveCard({ leaveRequests, onLeaveSubmit }: LeaveCardProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const created = await leaveService.createLeaveRequest(
        (user as any).engineerId || user.id,
        startDate,
        endDate,
        reason
      );
      onLeaveSubmit(created);

      setStartDate('');
      setEndDate('');
      setReason('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-[#111111] border border-white/10 text-white font-bold py-4 rounded-3xl hover:bg-white/5 active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Calendar className="w-6 h-6 text-blue-400" />
          Request Leave of Absence
        </button>
      )}

      {showForm && (
        <div className="bg-[#111111] rounded-3xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in-95 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-6 relative">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">Leave Application</h3>
              <p className="text-xs font-medium text-slate-400">Plan your time off</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 relative">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm font-medium text-white color-scheme-dark"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm font-medium text-white color-scheme-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                Reason for Leave *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain your leave request..."
                rows={3}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="px-6 py-4 border border-white/10 rounded-2xl text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-colors text-sm tracking-wide"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {leaveRequests.map((leave) => {
          return (
            <div
              key={leave.id}
              className={`bg-[#111111] rounded-3xl shadow-2xl border p-5 relative overflow-hidden ${
                leave.status === 'approved'
                  ? 'border-emerald-500/20'
                  : leave.status === 'rejected'
                  ? 'border-red-500/20'
                  : 'border-amber-500/20'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none ${
                 leave.status === 'approved' ? 'bg-emerald-500/10' :
                 leave.status === 'rejected' ? 'bg-red-500/10' :
                 'bg-amber-500/10'
              }`} />
              
              <div className="flex items-start justify-between mb-4 relative">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="font-bold text-white tracking-tight text-sm">
                      {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 inline-block">{leave.reason}</p>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                    leave.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : leave.status === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {leave.status === 'approved' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : leave.status === 'rejected' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {leave.status}
                </div>
              </div>

              {leave.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Awaiting HR Review
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {leaveRequests.length === 0 && !showForm && (
        <div className="text-center py-10 bg-[#111111] rounded-3xl border border-white/5">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-bold text-slate-400 tracking-tight">No leave requests yet</p>
        </div>
      )}
    </div>
  );
}
