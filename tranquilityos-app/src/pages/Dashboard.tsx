import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, TrendingUp, Calendar, Inbox, UserCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalLeads: 0, newLeads: 0, activeJobs: 0, revenueThisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 glass-panel border-y-0 border-l-0 rounded-none h-screen p-6 flex flex-col fixed bg-bg-primary/95 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex-center">
            <span className="text-white font-bold">T</span>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            TranquilityOS
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-primary text-white shadow-glow transition-all">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
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
          <a href="/jobs" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Calendar size={20} />
            <span>Jobs</span>
          </a>
          <a href="/invoices" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <CreditCard size={20} />
            <span>Invoices</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <FileText size={20} />
            <span>Quotations</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>

        <button 
          onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
          className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-red-400 transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Welcome to TranquilityOS</h1>
            <p className="text-text-secondary">Your business dashboard is ready.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex-center border border-white/5">
            <UserIcon />
          </div>
        </header>

        {loading ? (
          <div className="flex-center p-12 text-text-muted">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Revenue (MTD)" value={`$${metrics.revenueThisMonth.toLocaleString()}`} icon={<TrendingUp size={24} />} delay={1} />
            <DashboardCard title="Active Jobs" value={metrics.activeJobs.toString()} icon={<Calendar size={24} />} delay={2} />
            <DashboardCard title="Total Leads" value={metrics.totalLeads.toString()} icon={<Users size={24} />} delay={3} />
            <DashboardCard title="New Leads" value={metrics.newLeads.toString()} icon={<Inbox size={24} />} delay={4} />
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, delay }: any) => (
  <div className="glass-card p-6 min-h-[160px] animate-fade-in" style={{ animationDelay: `${delay * 100}ms`}}>
    <div className="w-12 h-12 rounded-full bg-white/5 flex-center mb-4 text-accent-primary">
      {icon}
    </div>
    <div className="text-text-secondary text-sm font-medium mb-1">{title}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default Dashboard;
