import { useState, useEffect } from 'react';
import { Users, Building2, UserCog, Activity, Plus, UserPlus, X, Shield, Settings, TrendingUp, ChevronDown } from 'lucide-react';
import { User, Client, Assignment } from '../../types';
import { StorageService } from '../../lib/storage';
import CompanyProfile from '../CompanyProfile';
import MusterRoll from '../MusterRoll';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clients' | 'assignments' | 'muster' | 'reports' | 'company-profile' | 'settings'>('overview');
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      const [allUsers, allClients, allAssignments, allCheckIns] = await Promise.all([
        StorageService.getUsers(),
        StorageService.getClients(),
        StorageService.getAssignments(),
        StorageService.getCheckIns()
      ]);

      const activeAssignments = allAssignments.filter(a => a.status === 'active' || (a as any).isActive === 1 || (a as any).is_active === 1);
      const allEngineers = allUsers.filter(u => u.role === 'engineer');

      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = allCheckIns.filter(c => c.date === today);

      setUsers(allUsers);
      setClients(allClients);
      setAssignments(activeAssignments);
      setEngineers(allEngineers);
      setStats({
        totalEngineers: allEngineers.length,
        totalClients: allClients.length,
        activeAssignments: activeAssignments.length,
        todayCheckIns: todayCheckIns.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function handleAddUser() {
    try {
      await StorageService.addUser({
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        name: formData.name,
        role: userRole,
        phone: formData.phone,
        createdAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: `${userRole.toUpperCase()} added successfully!` });
      setShowAddUserModal(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add user' });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleAddClient() {
    try {
      await StorageService.createClient({
        name: clientFormData.name,
        contactPerson: clientFormData.contactPerson,
        email: clientFormData.email,
        phone: clientFormData.phone,
        userId: ''
      });

      setMessage({ type: 'success', text: 'Client added successfully!' });
      setShowAddClientModal(false);
      setClientFormData({ name: '', contactPerson: '', email: '', phone: '' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add client' });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleAssignEngineer() {
    try {
      await StorageService.createAssignment({
        engineerId: assignFormData.engineerId,
        clientId: assignFormData.clientId,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        siteId: ''
      });

      setMessage({ type: 'success', text: 'Engineer assigned successfully!' });
      setShowAssignModal(false);
      setAssignFormData({ engineerId: '', clientId: '' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to assign engineer' });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'assignments', label: 'Assignments', icon: UserCog },
    { id: 'muster', label: 'Muster Roll', icon: TrendingUp },
    { id: 'company-profile', label: 'Company', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-slate-200">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#111111] border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-rose-600/5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-start gap-5 mb-2">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="text-red-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5">System Administration</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm font-medium mt-2">Platform management & configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Engineers', value: stats.totalEngineers, icon: Users, color: 'blue' },
            { label: 'Total Clients', value: stats.totalClients, icon: Building2, color: 'emerald' },
            { label: 'Active Assignments', value: stats.activeAssignments, icon: UserCog, color: 'amber' },
            { label: 'Today\'s Check-ins', value: stats.todayCheckIns, icon: TrendingUp, color: 'purple' }
          ].map(stat => (
            <div key={stat.label} className="bg-[#111111] rounded-3xl p-6 border border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none`}></div>
               <div className="relative z-10 flex items-center justify-between mb-4">
                 <div className={`p-3 bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/20`}>
                   <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                 </div>
               </div>
               <div className="relative z-10">
                 <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
                 <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-bottom-4 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            <span className="text-sm font-bold tracking-wide">{message.text}</span>
          </div>
        )}

        <div className="flex p-1 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border border-white/5 w-full overflow-x-auto scrollbar-hide shadow-2xl mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs tracking-wide whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-lg border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#111111] rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-red-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={() => { setUserRole('engineer'); setShowAddUserModal(true); }}
                    className="flex items-center gap-4 p-5 border border-white/5 bg-black/40 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                      <UserPlus className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">Add Engineer</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Create Account</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setUserRole('hr'); setShowAddUserModal(true); }}
                    className="flex items-center gap-4 p-5 border border-white/5 bg-black/40 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">Add HR</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Create Account</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="flex items-center gap-4 p-5 border border-white/5 bg-black/40 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors border border-orange-500/20">
                      <Building2 className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">Add Client</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Create Client</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-4 p-5 border border-white/5 bg-black/40 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                      <UserCog className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">Assign Engineer</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deploy to client</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setUserRole('admin'); setShowAddUserModal(true); }}
                    className="flex items-center gap-4 p-5 border border-white/5 bg-black/40 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors border border-red-500/20">
                      <UserPlus className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">Add Admin</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Create Account</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    User Management
                  </h2>
                  <button
                    onClick={() => { setUserRole('engineer'); setShowAddUserModal(true); }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] font-bold text-xs tracking-wide active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-white">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                              user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              user.role === 'engineer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              user.role === 'hr' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{user.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'clients' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-orange-400" />
                    Client Management
                  </h2>
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)] font-bold text-xs tracking-wide active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Add Client
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {clients.map(client => (
                    <div key={client.id} className="border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-all bg-black/40 group">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                          <Building2 className="w-4 h-4 text-orange-400" />
                        </div>
                        {client.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                          <p className="font-medium text-slate-300 truncate">{client.email}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                          <p className="font-medium text-slate-300 truncate">{client.phone || '-'}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl col-span-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contact Person</p>
                          <p className="font-medium text-slate-300">{client.contactPerson || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'muster' && (
              <MusterRoll />
            )}

            {activeTab === 'assignments' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <UserCog className="w-5 h-5 text-purple-400" />
                    Engineer Assignments
                  </h2>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)] font-bold text-xs tracking-wide active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Assign Engineer
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map(assignment => {
                    const engineer = engineers.find(e => e.id === assignment.engineerId);
                    const client = clients.find(c => c.id === assignment.clientId);
                    return (
                      <div key={assignment.id} className="border border-white/5 rounded-2xl p-6 flex justify-between items-start hover:bg-white/5 transition-all bg-black/40">
                        <div>
                          <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            {engineer?.name || 'Unknown Engineer'}
                          </h3>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                              {client?.name || 'Unknown Client'}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                          Active
                        </span>
                      </div>
                    );
                  })}
                  {assignments.length === 0 && (
                    <div className="col-span-full p-12 text-center border border-white/5 rounded-2xl bg-black/20">
                      <UserCog className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No active assignments</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'company-profile' && (
              <CompanyProfile />
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-400" />
                  System Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-white/5 rounded-2xl bg-black/40">
                    <h3 className="font-bold text-white mb-4">System Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Version</span>
                        <span className="text-sm font-medium text-slate-300">1.0.0</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Environment</span>
                        <span className="text-sm font-medium text-slate-300">Production</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Database</span>
                        <span className="text-sm font-medium text-emerald-400">Connected</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border border-white/5 rounded-2xl bg-black/40">
                    <h3 className="font-bold text-white mb-2">Admin Actions</h3>
                    <p className="text-sm text-slate-400 mb-6">Manage system-wide configurations and data exports.</p>
                    <div className="flex flex-col gap-3">
                      <button className="px-5 py-3.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-xs font-bold tracking-wide border border-white/5">
                        View Audit Logs
                      </button>
                      <button className="px-5 py-3.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-xs font-bold tracking-wide border border-white/5">
                        Generate System Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add {userRole}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Create Account</p>
                </div>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-5 relative">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <button onClick={handleAddUser} disabled={!formData.name || !formData.email} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide mt-2 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add Client</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Register Organization</p>
                </div>
              </div>
              <button onClick={() => setShowAddClientModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-5 relative">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Organization Name</label>
                <input
                  type="text"
                  value={clientFormData.name}
                  onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Contact Person</label>
                <input
                  type="text"
                  value={clientFormData.contactPerson}
                  onChange={(e) => setClientFormData({ ...clientFormData, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Email Address</label>
                <input
                  type="email"
                  value={clientFormData.email}
                  onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="jane@acmecorp.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Phone Number</label>
                <input
                  type="tel"
                  value={clientFormData.phone}
                  onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-sm font-medium text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <button onClick={handleAddClient} disabled={!clientFormData.name || !clientFormData.email} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm tracking-wide mt-2 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)]">
                Register Client
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Assign Engineer</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deploy to Project</p>
                </div>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-5 relative">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Select Engineer</label>
                <div className="relative">
                  <select
                    value={assignFormData.engineerId}
                    onChange={(e) => setAssignFormData({ ...assignFormData, engineerId: e.target.value })}
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-sm font-medium text-white appearance-none"
                  >
                    <option value="" className="bg-[#111]">Choose an engineer...</option>
                    {engineers.map(e => <option key={e.id} value={e.id} className="bg-[#111]">{e.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Select Client/Project</label>
                <div className="relative">
                  <select
                    value={assignFormData.clientId}
                    onChange={(e) => setAssignFormData({ ...assignFormData, clientId: e.target.value })}
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-sm font-medium text-white appearance-none"
                  >
                    <option value="" className="bg-[#111]">Choose a client...</option>
                    {clients.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              
              <button onClick={handleAssignEngineer} disabled={!assignFormData.engineerId || !assignFormData.clientId} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm tracking-wide mt-4 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)]">
                Deploy Engineer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
