import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { LayoutDashboard, Users, FileText, Settings as ConfigIcon, LogOut, Save, UserCheck, Calendar, CreditCard, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/business`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBusinessName(data.business_name || '');
        setIndustry(data.industry || '');
        setLogoUrl(data.logo_url || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/business`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ business_name: businessName, industry, logo_url: logoUrl })
      });
      if (res.ok) {
        alert("Platform configurations updated securely!");
      } else {
        alert("Configuration Error: Failed to commit modifications.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 glass-panel border-y-0 border-l-0 rounded-none h-screen p-6 flex flex-col fixed z-20 bg-bg-primary/95">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex-center overflow-hidden">
             {/* If the Master Platform had a custom icon uploaded by the user, we would place it here instead of T */}
            <span className="text-white font-bold">T</span>
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
          <a href="/invoices" className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
            <CreditCard size={20} />
            <span>Invoices</span>
          </a>
          <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-primary text-white shadow-glow transition-all">
            <ConfigIcon size={20} />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-red-400 transition-colors mt-auto">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Platform Settings</h1>
            <p className="text-text-secondary">Configure your business branding and system preferences.</p>
          </div>
        </header>

        {loading ? (
          <div className="flex-center p-12 text-text-muted">Loading settings matrix...</div>
        ) : (
          <form onSubmit={handleUpdateSettings}>
            <div className="glass-card mb-8">
              <h3 className="text-xl font-semibold px-6 pt-6 mb-2">Business Profile</h3>
              <p className="px-6 text-sm text-text-secondary border-b border-border-color pb-4 mb-4">
                This information defines the legal entity managing operations across TranquilityOS.
              </p>
              
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="input-group mb-0">
                  <label className="input-label">Registered Business Name *</label>
                  <input type="text" className="input-field" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
                </div>
                <div className="input-group mb-0">
                  <label className="input-label">Master Industry Sector</label>
                  <input type="text" className="input-field" value={industry} onChange={e => setIndustry(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="glass-card mb-8">
              <h3 className="text-xl font-semibold px-6 pt-6 mb-2 text-blue-400">Branding & Automation</h3>
              <p className="px-6 text-sm text-text-secondary border-b border-border-color pb-4 mb-4">
                Establish the visual identity injected automatically into your Quotations, Proposals, and Invoices.
              </p>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-[100px_1fr] gap-6 items-center">
                    <div className="w-24 h-24 rounded-lg bg-bg-secondary flex-center border-2 border-dashed border-border-color overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Branding Block" className="w-full h-full object-contain" />
                        ) : (
                            <ImageIcon size={32} className="text-text-muted" />
                        )}
                    </div>
                    <div>
                        <label className="input-label">Master Branding Logo URL</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com/branding/master_logo.png" 
                          className="input-field" 
                          value={logoUrl} 
                          onChange={e => setLogoUrl(e.target.value)} 
                        />
                        <p className="text-xs text-text-muted mt-2">
                           For Vercel/Render serverless stability, paste a direct HTML link to your `.png` or `.jpg` file. This logo will automatically mount at the top of client-facing exports.
                        </p>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary px-8 flex items-center gap-2">
                   <Save size={18} /> Execute Configuration Update
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
