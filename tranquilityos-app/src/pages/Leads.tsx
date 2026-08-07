import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Plus, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [leadName, setLeadName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status] = useState('New');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ lead_name: leadName, company_name: companyName, phone, email, address, status })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLeads(); // Refresh list
        // Reset form
        setLeadName(''); setCompanyName(''); setPhone(''); setEmail(''); setAddress('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    
    if (newStatus === 'Won') {
      const confirmConvert = window.confirm('Are you sure you want to convert this lead to a Customer?');
      if (!confirmConvert) {
         fetchLeads(); // resync state if aborted
         return;
      }
      
      await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      // optionally trigger notification toast here
    } else {
      await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
    }
    fetchLeads();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 glass-panel border-y-0 border-l-0 rounded-none h-screen p-6 flex flex-col fixed z-20 bg-bg-primary/95">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex-center overflow-hidden relative">
            <img src="/logo.png" alt="Core" className="w-full h-full object-cover z-10" onError={(e) => e.currentTarget.style.display='none'} />
            <span className="text-white font-bold absolute z-0">T</span>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            TranquilityOS
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="/customers" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <UserCheck size={20} />
            <span>Customers</span>
          </a>
          <a href="/leads" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-primary text-white shadow-glow transition-all">
            <Users size={20} />
            <span className="font-medium">Leads</span>
          </a>
          <a href="/quotations" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <FileText size={20} />
            <span>Quotations</span>
          </a>
          <a href="/jobs" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Calendar size={20} />
            <span>Jobs</span>
          </a>
          <a href="/invoices" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <CreditCard size={20} />
            <span>Invoices</span>
          </a>
          <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>

        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-red-400 transition-colors mt-auto">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Lead Management</h1>
            <p className="text-text-secondary">Track and convert prospective clients.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add New Lead
          </button>
        </header>

        {loading ? (
          <div className="flex-center p-12 text-text-muted">Loading leads...</div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-white/5">
                  <th className="p-4 font-medium text-text-secondary">Name</th>
                  <th className="p-4 font-medium text-text-secondary">Company</th>
                  <th className="p-4 font-medium text-text-secondary">Contact</th>
                  <th className="p-4 font-medium text-text-secondary">Status</th>
                  <th className="p-4 font-medium text-text-secondary">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-muted">No leads found. Create your first lead to get started.</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border-color/50 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{lead.lead_name}</td>
                      <td className="p-4 text-text-secondary">{lead.company_name || '-'}</td>
                      <td className="p-4">
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-xs text-text-muted">{lead.phone}</div>
                      </td>
                      <td className="p-4">
                        <select 
                          className="bg-transparent border border-border-color rounded px-2 py-1 text-sm outline-none w-32"
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        >
                          <option value="New" className="bg-bg-tertiary">New</option>
                          <option value="Contacted" className="bg-bg-tertiary">Contacted</option>
                          <option value="Qualified" className="bg-bg-tertiary">Qualified</option>
                          <option value="Quotation" className="bg-bg-tertiary">Quotation Sent</option>
                          <option value="Won" className="bg-bg-tertiary">Won / Converted</option>
                        </select>
                      </td>
                      <td className="p-4 text-text-secondary text-sm">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex-center z-50 p-4 animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group mb-0">
                  <label className="input-label">Lead Name *</label>
                  <input type="text" className="input-field" value={leadName} onChange={e => setLeadName(e.target.value)} required />
                </div>
                <div className="input-group mb-0">
                  <label className="input-label">Company Name</label>
                  <input type="text" className="input-field" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group mb-0">
                  <label className="input-label">Email</label>
                  <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="input-group mb-0">
                  <label className="input-label">Phone</label>
                  <input type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Address</label>
                <input type="text" className="input-field" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6">Cancel</button>
                <button type="submit" className="btn btn-primary px-6">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
