import { useState } from 'react';
import type { FormEvent } from 'react';
import { User, Mail, Lock, Building, MapPin, Settings, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => setStep(2);
  
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, businessName, industry, currency, country })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  return (
    <div className="min-h-screen flex-center animate-fade-in py-12 px-4 relative z-10">
      <div className="glass-card w-full max-w-xl p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex-center">
              <ShieldCheck size={20} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join TranquilityOS</h1>
          </div>
          <p className="text-text-secondary text-sm">
            {step === 1 ? 'Step 1: Create your user account' : 'Step 2: Setup your business profile'}
          </p>
          
          <div className="flex gap-2 justify-center mt-6">
            <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-accent-primary' : 'bg-gray-700'}`}></div>
            <div className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-accent-primary' : 'bg-gray-700'}`}></div>
          </div>
        </div>

        {error && <div className="p-3 bg-red-500/20 text-red-100 rounded-md mb-4 text-center text-sm">{error}</div>}

        {step === 1 && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-text-muted" />
                  </div>
                  <input type="text" className="input-field pl-10" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-text-muted" />
                  </div>
                  <input type="text" className="input-field pl-10" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input type="email" className="input-field pl-10" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input type="password" className="input-field pl-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="button" onClick={handleNext} className="btn btn-primary btn-full mt-6 flex justify-center">
              Continue to Business Setup <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="animate-fade-in">
            <div className="input-group">
              <label className="input-label">Business Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-text-muted" />
                </div>
                <input type="text" className="input-field pl-10" placeholder="Acme Services Ltd." value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Industry</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Settings className="h-5 w-5 text-text-muted" />
                </div>
                <select className="input-field pl-10 appearance-none bg-transparent" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="" className="bg-bg-tertiary">Select your industry</option>
                  <option value="windows_doors" className="bg-bg-tertiary">Aluminum Windows & Doors</option>
                  <option value="electrician" className="bg-bg-tertiary">Electrician</option>
                  <option value="plumbing" className="bg-bg-tertiary">Plumbing</option>
                  <option value="contractor" className="bg-bg-tertiary">General Contractor</option>
                  <option value="hvac" className="bg-bg-tertiary">HVAC</option>
                  <option value="other" className="bg-bg-tertiary">Other Home Services</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Currency</label>
                <select className="input-field bg-transparent" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD" className="bg-bg-tertiary">USD ($)</option>
                  <option value="JMD" className="bg-bg-tertiary">JMD ($)</option>
                  <option value="CAD" className="bg-bg-tertiary">CAD ($)</option>
                  <option value="EUR" className="bg-bg-tertiary">EUR (€)</option>
                  <option value="GBP" className="bg-bg-tertiary">GBP (£)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Country</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-text-muted" />
                  </div>
                  <input type="text" className="input-field pl-10" placeholder="United States" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary w-1/3">
                Back
              </button>
              <button type="submit" className="btn btn-primary w-2/3 flex justify-center">
                Complete Setup <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary font-medium hover:text-accent-secondary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
