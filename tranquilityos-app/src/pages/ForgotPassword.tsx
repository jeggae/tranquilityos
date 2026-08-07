import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert("If the email exists in our system, a reset link has been deployed.");
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      alert("Network exception. Ensure backend API is operational.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-bg-primary overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        
        <button onClick={() => navigate('/login')} className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Vault
        </button>

        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3 text-white">Recover Identity</h1>
            <p className="text-text-secondary text-sm">Deploy a time-locked recovery token to your registered email securely.</p>
          </div>

          {!success ? (
            <div className="glass-panel p-8 shadow-2xl relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="input-group">
                  <label className="input-label">Registered Master Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@startup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-glow flex justify-center items-center gap-2 mt-4">
                  <Send size={18} />
                  {loading ? 'Transmitting...' : 'Dispatch Token'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-8 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-6 border border-green-500/50">
                 <Send className="text-green-400" size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Postmaster Deployed</h2>
              <p className="text-text-secondary mb-8">
                If the email exists within TranquilityOS records, a cryptographic reset token has been dispatched to your inbox.
              </p>
              <button onClick={() => navigate('/login')} className="btn btn-secondary w-full">Return to Vault</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
