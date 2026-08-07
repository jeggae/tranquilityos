import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract ?token=XYZ from the URL params
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // If someone lands here without a token, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert("Cryptographic Error: Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return alert("Password too weak. Please use at least 6 characters.");
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        alert(`Reset Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network exception. Unable to finalize securely.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-bg-primary overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3 text-white">Establish Secure Link</h1>
            <p className="text-text-secondary text-sm">Validating cryptographic recovery token. Enter your new master password.</p>
          </div>

          {!success ? (
            <div className="glass-panel p-8 shadow-2xl relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter a highly secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Confirm Passphrase</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Verify the exact password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-glow flex justify-center items-center gap-2 mt-4">
                  <ShieldCheck size={18} />
                  {loading ? 'Validating Token...' : 'Finalize Override'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-8 shadow-2xl text-center border border-green-500/20">
              <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/50">
                 <ShieldCheck className="text-green-400" size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">Security Override Confirmed</h2>
              <p className="text-text-secondary mb-8">
                Your database payload has been cryptographically secured with the new password. The recovery link has been safely destroyed.
              </p>
              <button onClick={() => navigate('/login')} className="btn btn-primary w-full shadow-[0_0_15px_rgba(59,130,246,0.5)]">Enter the Vault</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
