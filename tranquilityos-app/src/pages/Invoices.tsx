import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Plus, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (id: number, remainingBalance: number) => {
    const amountStr = window.prompt(`Enter payment amount to apply. (Remaining balance: $${remainingBalance})`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${id}/payment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ block_payment: amount })
        });
        if (res.ok) {
            fetchInvoices();
        } else {
            alert('Failed to process payment');
        }
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Shared Sidebar */}
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
          <a href="/jobs" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <Calendar size={20} />
            <span>Jobs</span>
          </a>
          <a href="/invoices" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-primary text-white shadow-glow transition-all">
            <CreditCard size={20} />
            <span className="font-medium">Invoices & Billing</span>
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
            <h1 className="text-2xl font-bold text-text-primary">Accounts Receivable</h1>
            <p className="text-text-secondary">Track payments and outstanding invoice balances.</p>
          </div>
          <button onClick={() => navigate('/invoices/new')} className="btn btn-primary">
            <Plus size={18} /> Issue Invoice
          </button>
        </header>

        {loading ? (
          <div className="flex-center p-12 text-text-muted">Loading financials...</div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-white/5">
                  <th className="p-4 font-medium text-text-secondary"># INV</th>
                  <th className="p-4 font-medium text-text-secondary">Customer</th>
                  <th className="p-4 font-medium text-text-secondary text-right">Amount Billed</th>
                  <th className="p-4 font-medium text-text-secondary text-right">Balance Due</th>
                  <th className="p-4 font-medium text-text-secondary text-center">Status</th>
                  <th className="p-4 font-medium text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">No invoices exist. Generate an invoice to see billing here.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                      const balanceDue = inv.total - inv.amount_paid;
                      return (
                        <tr key={inv.id} className="border-b border-border-color/50 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-text-muted font-mono text-sm">INV-{String(inv.id).padStart(4, '0')}</td>
                        <td className="p-4">
                            <div className="font-medium text-white">{inv.customer_name}</div>
                            <div className="text-xs text-text-muted">{inv.title}</div>
                        </td>
                        <td className="p-4 text-white font-medium text-right">${inv.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className={`p-4 font-bold text-right ${balanceDue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            ${balanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs border ${
                            inv.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            inv.status === 'Partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                            {inv.status}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                           {balanceDue > 0 && (
                               <button 
                                 onClick={() => handleProcessPayment(inv.id, balanceDue)} 
                                 className="text-xs btn btn-secondary py-1 px-2 text-cyan-400 hover:text-cyan-300"
                               >
                                  Record Payment
                               </button>
                           )}
                           {balanceDue <= 0 && (
                               <span className="text-xs text-text-muted">Settled</span>
                           )}
                        </td>
                        </tr>
                      )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
