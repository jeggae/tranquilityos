import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Plus, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setJobs(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddJob = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ customer_id: customerId, title, description, scheduled_date: scheduledDate })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchJobs();
        setTitle(''); setDescription(''); setScheduledDate(''); setCustomerId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchJobs();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Extracted conceptually, but duplicated for MVP inline architecture */}
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
          <a href="/leads" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Users size={20} />
            <span>Leads</span>
          </a>
          <a href="/quotations" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <FileText size={20} />
            <span>Quotations</span>
          </a>
          <a href="/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-primary text-white shadow-glow transition-all">
            <Calendar size={20} />
            <span className="font-medium">Jobs</span>
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

      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Jobs & Schedule</h1>
            <p className="text-text-secondary">Track ongoing work orders and scheduled services.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Schedule Job
          </button>
        </header>

        {loading ? (
          <div className="flex-center p-12 text-text-muted">Loading active jobs...</div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-white/5">
                  <th className="p-4 font-medium text-text-secondary">Job Task</th>
                  <th className="p-4 font-medium text-text-secondary">Customer</th>
                  <th className="p-4 font-medium text-text-secondary">Date Scheduled</th>
                  <th className="p-4 font-medium text-text-secondary">Status Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted">No jobs are currently scheduled.</td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className="border-b border-border-color/50 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{j.title}</div>
                        <div className="text-xs text-text-muted mt-1 truncate max-w-xs">{j.description || 'No description provided'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-text-primary">{j.customer_name}</div>
                        <div className="text-xs text-text-muted">{j.address || 'Address not listed'}</div>
                      </td>
                      <td className="p-4 text-text-secondary text-sm">
                        {j.scheduled_date ? new Date(j.scheduled_date).toLocaleDateString() : 'Unscheduled'}
                      </td>
                      <td className="p-4">
                        <select 
                          className={`input-field m-0 py-1 px-2 h-auto text-sm bg-transparent border-border-color font-medium ${
                            j.status === 'Completed' ? 'text-green-400' :
                            j.status === 'In Progress' ? 'text-blue-400' :
                            j.status === 'Blocked' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}
                          value={j.status}
                          onChange={(e) => handleStatusChange(j.id, e.target.value)}
                        >
                          <option value="Scheduled" className="bg-bg-tertiary">Scheduled</option>
                          <option value="In Progress" className="bg-bg-tertiary">In Progress</option>
                          <option value="Blocked" className="bg-bg-tertiary">Blocked</option>
                          <option value="Completed" className="bg-bg-tertiary">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex-center z-50 p-4 animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Schedule New Job</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleAddJob} className="space-y-4">
              <div className="input-group mb-0">
                <label className="input-label">Assign to Customer *</label>
                <select className="input-field" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="" className="bg-bg-tertiary">Select a Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-bg-tertiary">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Job Title *</label>
                <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Roof Repair Execution" />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Scheduled Date</label>
                <input type="date" className="input-field" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Operational Notes</label>
                <textarea className="input-field bg-bg-secondary h-24 resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Tools required, special instructions, etc."></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6">Cancel</button>
                <button type="submit" className="btn btn-primary px-6">Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
