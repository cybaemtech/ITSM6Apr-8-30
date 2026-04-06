import { useState, useEffect } from 'react';
import { 
  Users, Building2, UserCog, Activity, Shield, 
  RefreshCw, TrendingUp, Plus, X, ChevronDown, LogOut, Mail, Clock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../lib/storage';
import CompanyProfile from '../CompanyProfile';
import type { User, Client, Assignment } from '../../types';

export default function MobileAdminDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clients' | 'assignments' | 'company' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalEngineers: 0, totalClients: 0, activeAssignments: 0, todayCheckIns: 0 });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [userRole, setUserRole] = useState<'engineer' | 'hr' | 'admin'>('engineer');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [clientFormData, setClientFormData] = useState({ name: '', contactPerson: '', email: '', phone: '' });
  const [assignFormData, setAssignFormData] = useState({ engineerId: '', clientId: '' });
  const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
  const [notifying, setNotifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { loadData(); }, [activeTab]);

  async function loadData(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [allU, allC, allA, allCk] = await Promise.all([
        StorageService.getUsers(), StorageService.getClients(),
        StorageService.getAssignments(), StorageService.getCheckIns()
      ]);
      const actA = allA.filter(a => a.status === 'active' || (a as any).isActive === 1 || (a as any).is_active === 1);
      const allE = allU.filter(u => u.role === 'engineer');
      const today = new Date().toISOString().split('T')[0];
      setUsers(allU); setClients(allC); setAssignments(actA); setEngineers(allE);
      setStats({
        totalEngineers: allE.length, totalClients: allC.length,
        activeAssignments: actA.length, todayCheckIns: allCk.filter(c => c.date === today).length
      });
    } catch (e) { console.error(e); } finally { setLoading(false); setRefreshing(false); }
  }

  const handleAddUser = async () => {
    try {
      await StorageService.addUser({ id: Math.random().toString(36).substr(2, 9), ...formData, role: userRole, createdAt: new Date().toISOString() });
      setMessage({ type: 'success', text: 'User added!' }); setShowAddUserModal(false); setFormData({ name: '', email: '', phone: '', password: '' }); loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) { 
      setMessage({ type: 'error', text: e.message }); 
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddClient = async () => {
    try {
      await StorageService.createClient({ ...clientFormData, userId: '' });
      setMessage({ type: 'success', text: 'Client added!' }); setShowAddClientModal(false); setClientFormData({ name: '', contactPerson: '', email: '', phone: '' }); loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) { 
      setMessage({ type: 'error', text: e.message }); 
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAssign = async () => {
    try {
      await StorageService.createAssignment({ ...assignFormData, assignedDate: new Date().toISOString().split('T')[0], status: 'active', siteId: '' });
      setMessage({ type: 'success', text: 'Assigned!' }); setShowAssignModal(false); setAssignFormData({ engineerId: '', clientId: '' }); loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) { 
      setMessage({ type: 'error', text: e.message }); 
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleNotifyClients = async () => {
    if (selectedEngineers.length === 0) return;
    try {
      setNotifying(true);
      await StorageService.notifyClients(selectedEngineers);
      setMessage({ type: 'success', text: `Notified ${selectedEngineers.length} clients!` });
      setSelectedEngineers([]);
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setNotifying(false);
    }
  };

  const toggleEngineerSelection = (id: string) => {
    setSelectedEngineers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-[2px] border-red-500/20"></div>
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-red-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pb-24 font-sans text-slate-200">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5 pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-rose-600/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex justify-between items-center relative z-10 px-6 pt-10 mb-6">
          <div>
             <p className="text-red-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Global System Control</p>
             <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Console</h1>
          </div>
          <button onClick={() => loadData(true)} className="p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 shadow-lg active:scale-90 transition-all hover:bg-white/10">
             <RefreshCw className={`w-5 h-5 text-red-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10 px-6">
          {[ 
            {l: 'Engineers', v: stats.totalEngineers, i: Users, c: 'blue'},
            {l: 'Clients', v: stats.totalClients, i: Building2, c: 'emerald'},
            {l: 'Tasks', v: stats.activeAssignments, i: UserCog, c: 'purple'},
            {l: 'Today', v: stats.todayCheckIns, i: Clock, c: 'orange'}
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
           {id:'overview', icon:Activity, label:'Main'}, 
           {id:'users', icon:Users, label:'Staff'}, 
           {id:'clients', icon:Building2, label:'Partners'}, 
           {id:'assignments', icon:UserCog, label:'Deploy'}, 
           {id:'company', icon:Shield, label:'Org'} 
         ].map(t => (
           <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${activeTab === t.id ? 'text-red-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{t.label}</span>
              {activeTab === t.id && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
           </button>
         ))}
      </div>

      <div className="px-6 pt-6 relative z-20 space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl font-bold text-xs tracking-wide shadow-lg border flex items-center gap-3 animate-in slide-in-from-bottom-4 ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            {message.text}
          </div>
        )}
        
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 px-2">Rapid Deployment</h4>
             <div className="grid gap-3">
               {[ 
                 {l: 'Add Engineer', I: Users, c: 'blue', s: 'Create Staff Account', a: () => {setUserRole('engineer'); setShowAddUserModal(true);}},
                 {l: 'Add HR', I: Users, c: 'emerald', s: 'Create Management Account', a: () => {setUserRole('hr'); setShowAddUserModal(true);}},
                 {l: 'Register Client', I: Building2, c: 'orange', s: 'Onboard New Partner', a: () => setShowAddClientModal(true)},
                 {l: 'Assign Project', I: UserCog, c: 'purple', s: 'Deploy Resources', a: () => setShowAssignModal(true)},
                 {l: 'System Admin', I: Shield, c: 'red', s: 'Root Level Access', a: () => {setUserRole('admin'); setShowAddUserModal(true);}}
               ].map(m => (
                 <button key={m.l} onClick={m.a} className="w-full bg-[#111111] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 active:scale-95 transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                       <div className={`p-3 bg-${m.c}-500/10 border border-${m.c}-500/20 rounded-xl text-${m.c}-400`}><m.I className="w-5 h-5" /></div>
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
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="flex justify-between items-center px-1 mb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Staff Management ({users.length})</h4>
              {selectedEngineers.length > 0 && (
                <button 
                  onClick={handleNotifyClients}
                  disabled={notifying}
                  className="bg-red-600/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Mail className="w-3 h-3" /> {notifying ? 'Sending...' : 'Notify'}
                </button>
              )}
            </div>
            <div className="grid gap-3">
              {users.map(u => {
                const isSelected = selectedEngineers.includes(u.id);
                const isEngineer = u.role === 'engineer';
                return (
                  <div 
                    key={u.id} 
                    onClick={() => isEngineer && toggleEngineerSelection(u.id)}
                    className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between transition-all ${
                      isSelected ? 'bg-red-500/10 border-red-500/30' : 'bg-[#111111] border-white/5 hover:bg-white/5'
                    } ${isEngineer ? 'cursor-pointer active:scale-95' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-slate-300'
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{u.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                            u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            u.role === 'engineer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            u.role === 'hr' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>{u.role}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{u.email}</span>
                        </div>
                      </div>
                    </div>
                    {isEngineer && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-red-600 border-red-600' : 'border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 px-1 mb-2">Registered Partners</h4>
             {clients.map(c => (
               <div key={c.id} className="bg-[#111111] p-5 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-white tracking-tight">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">POC: {c.contactPerson || 'None'}</p>
                  </div>
               </div>
             ))}
             {clients.length === 0 && (
               <div className="text-center py-12 bg-[#111111] rounded-3xl border border-white/5">
                 <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                 <p className="text-sm font-bold text-white">No Clients</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 px-1 mb-2">Active Deployments</h4>
             {assignments.map(a => (
               <div key={a.id} className="bg-[#111111] p-5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-[30px] pointer-events-none"></div>
                  <div className="absolute top-4 right-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-bold uppercase tracking-widest">Active</span></div>
                  
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                     <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400"><Users className="w-4 h-4" /></div>
                     <div>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resource</p>
                       <p className="font-bold text-white text-sm">{engineers.find(e => e.id === a.engineerId)?.name || 'Unknown'}</p>
                     </div>
                  </div>
                  
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">
                     <Building2 className="w-3.5 h-3.5 text-orange-400" /> 
                     {clients.find(c => c.id === a.clientId)?.name || 'Unknown Client'}
                  </div>
               </div>
             ))}
             {assignments.length === 0 && (
               <div className="text-center py-12 bg-[#111111] rounded-3xl border border-white/5">
                 <UserCog className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                 <p className="text-sm font-bold text-white">No Active Deployments</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'company' && <CompanyProfile />}
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] p-4 flex items-end justify-center">
          <div className="bg-[#111111] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">New {userRole}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Create Account</p>
              </div>
              <button onClick={()=>setShowAddUserModal(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 border border-white/10">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" onChange={e=>setFormData({...formData, name: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" onChange={e=>setFormData({...formData, email: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Phone (Optional)</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" onChange={e=>setFormData({...formData, phone: e.target.value})}/>
              </div>
              
              <button onClick={handleAddUser} disabled={!formData.name || !formData.email} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.2)] mt-4 active:scale-95 transition-all disabled:opacity-50">
                Launch Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] p-4 flex items-end justify-center">
          <div className="bg-[#111111] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Add Client</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Register Partner</p>
              </div>
              <button onClick={()=>setShowAddClientModal(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 border border-white/10">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Organization Name</label>
                <input type="text" placeholder="Acme Corp" className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/50 transition-all outline-none" onChange={e=>setClientFormData({...clientFormData, name: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">POC Name</label>
                <input type="text" placeholder="Jane Smith" className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/50 transition-all outline-none" onChange={e=>setClientFormData({...clientFormData, contactPerson: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">POC Email</label>
                <input type="email" placeholder="jane@acme.com" className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/50 transition-all outline-none" onChange={e=>setClientFormData({...clientFormData, email: e.target.value})}/>
              </div>
              
              <button onClick={handleAddClient} disabled={!clientFormData.name || !clientFormData.email} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.2)] mt-4 active:scale-95 transition-all disabled:opacity-50">
                Register Client
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] p-4 flex items-end justify-center">
          <div className="bg-[#111111] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Deployment</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Assign Resource</p>
              </div>
              <button onClick={()=>setShowAssignModal(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 border border-white/10">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Select Engineer</label>
                <div className="relative">
                  <select className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 transition-all outline-none appearance-none" onChange={e=>setAssignFormData({...assignFormData, engineerId: e.target.value})}>
                    <option value="" className="bg-[#111]">Choose engineer...</option>
                    {engineers.map(e=><option key={e.id} value={e.id} className="bg-[#111]">{e.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Select Client</label>
                <div className="relative">
                  <select className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl font-medium text-sm text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 transition-all outline-none appearance-none" onChange={e=>setAssignFormData({...assignFormData, clientId: e.target.value})}>
                    <option value="" className="bg-[#111]">Choose client...</option>
                    {clients.map(c=><option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              
              <button onClick={handleAssign} disabled={!assignFormData.engineerId || !assignFormData.clientId} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.2)] mt-4 active:scale-95 transition-all disabled:opacity-50">
                Engage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
