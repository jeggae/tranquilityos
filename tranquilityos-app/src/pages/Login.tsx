import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  return (
    <div className="min-h-screen flex-center animate-fade-in relative z-10 p-4">
      <div className="glass-card w-full max-w-md p-8 sm:p-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex-center shadow-glow animate-fade-in delay-100">
            <ShieldCheck size={32} color="white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            TranquilityOS
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            The AI-Powered OS for Service Businesses
          </p>
        </div>

        {error && <div className="p-3 bg-red-500/20 text-red-100 rounded-md mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="animate-fade-in delay-200">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-muted" />
              </div>
              <input 
                type="email" 
                className="input-field pl-10" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <div className="flex justify-between items-center">
              <label className="input-label">Password</label>
              <a href="#" className="text-xs text-accent-primary">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <input 
                type="password" 
                className="input-field pl-10" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full mt-6 flex justify-center">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary animate-fade-in delay-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-primary font-medium hover:text-accent-secondary">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
