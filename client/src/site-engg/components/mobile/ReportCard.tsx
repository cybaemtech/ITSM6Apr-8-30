import { useState } from 'react';
import { FileText, Send, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reportService';
import type { DailyReport, Assignment } from '../../types';

interface ReportCardProps {
  report: DailyReport | null;
  assignment: Assignment | undefined;
  onReportSubmit: (report: DailyReport) => void;
}

export default function ReportCard({ report, assignment, onReportSubmit }: ReportCardProps) {
  const { user } = useAuth();
  const [workDone, setWorkDone] = useState('');
  const [issues, setIssues] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !(user as any).engineerId || !assignment) return;

    setLoading(true);
    setError(null);

    try {
      const created = await reportService.createReport(
        (user as any).engineerId,
        assignment.clientId,
        workDone,
        issues || undefined,
        assignment.siteId
      );
      onReportSubmit(created);
      setShowSuccess(true);
      setWorkDone('');
      setIssues('');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return (
      <div className="bg-[#111111] border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
        <div className="flex items-center gap-4 mb-5 relative">
          <div className="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">Report Submitted</h3>
            <p className="text-xs font-medium text-emerald-400/80">Great work today!</p>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-2xl p-5 border border-white/5 relative">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">My Updates</p>
          <p className="text-sm font-medium text-slate-300 leading-relaxed mb-4">{report.workDone}</p>
          {report.issues && (
            <div className="flex items-start gap-3 pt-4 border-t border-white/5">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-300/90 leading-relaxed">{report.issues}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <p className="font-bold text-white text-lg tracking-tight mb-1">No active assignment</p>
        <p className="text-sm font-medium text-slate-400">Please check back later</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] rounded-3xl shadow-2xl border border-white/10 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-6 relative">
        <div className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20">
          <FileText className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight">Daily Report</h3>
          <p className="text-xs font-medium text-slate-400">Record your work progress</p>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3 animate-in fade-in zoom-in-95 relative">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-400">Report submitted successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center gap-3 relative">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-sm font-medium text-red-400/90">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 relative">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
            Work Accomplished *
          </label>
          <textarea
            value={workDone}
            onChange={(e) => setWorkDone(e.target.value)}
            placeholder="Describe what you completed..."
            rows={4}
            required
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600 resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
            Issues / Blockers <span className="text-slate-600">(Optional)</span>
          </label>
          <textarea
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            placeholder="Any problems encountered?"
            rows={2}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !workDone.trim()}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.2)] text-sm tracking-wide"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting Report...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Daily Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}
