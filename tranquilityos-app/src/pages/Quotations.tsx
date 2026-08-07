import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Plus, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Quotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quotations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <a href="/leads" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Users size={20} />
            <span>Leads</span>
          </a>
          <a href="/quotations" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-primary text-white shadow-glow transition-all">
            <FileText size={20} />
            <span className="font-medium">Quotations</span>
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
            <h1 className="text-2xl font-bold text-text-primary">Quotations & Proposals</h1>
            <p className="text-text-secondary">Send estimates and secure approvals seamlessly.</p>
          </div>
          <button onClick={() => navigate('/quotations/new')} className="btn btn-primary">
            <Plus size={18} /> New Quotation
          </button>
        </header>

        {loading ? (
          <div className="flex-center p-12 text-text-muted">Loading quotations...</div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-white/5">
                  <th className="p-4 font-medium text-text-secondary">Quote Ref</th>
                  <th className="p-4 font-medium text-text-secondary">Title</th>
                  <th className="p-4 font-medium text-text-secondary">Customer</th>
                  <th className="p-4 font-medium text-text-secondary">Total</th>
                  <th className="p-4 font-medium text-text-secondary">Status</th>
                  <th className="p-4 font-medium text-text-secondary">Date Issued</th>
                </tr>
              </thead>
              <tbody>
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">No active quotations found. Generate a new one to begin.</td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="border-b border-border-color/50 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-text-muted font-mono text-sm">QT-{String(q.id).padStart(4, '0')}</td>
                      <td className="p-4 font-medium text-white">{q.title}</td>
                      <td className="p-4 text-text-secondary">{q.customer_name}</td>
                      <td className="p-4 text-white font-medium">${q.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs border ${
                          q.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          q.status === 'Sent' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-white/5 text-text-secondary border-border-color'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary text-sm">{new Date(q.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotations;
