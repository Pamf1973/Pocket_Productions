import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../utils/auth';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    signUp(name, email, password);
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7U1Gh4-kKaYostL_eEorsf99I_MqQ1acbIdsxccR9fO4r5oOUjw0z_8weTOkmmfRTt2CtAX4reSaK82QlAv3ZNbB2JDgjjcCaP6QQFKycjF_bME75dRJEEfFEZppwYR0Cq3pAx1-zKjmYu7pqIWjfEISAZ5S-dpRZRATrs5bo2yJqvi2rHzbI6WhTCKqOzkJ448p42yoso_Br-bvOqmgNEpOZ1qmOWnaX64qYsQSvBkFszpb2iTevdiyZNEgGkBIrLym0HTMnleEu")',
        }}
      />

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ background: 'rgba(15,20,30,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white leading-tight">
              Create<br />Profile
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
              Join Pocket Productions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@pocketproductions.com"
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', boxShadow: '0 8px 20px rgba(59,130,246,0.4)' }}
            >
              Create Profile
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-white font-bold hover:text-blue-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-4 text-center">
          Terminal Access 1.0.4 // Production Mode
        </p>
      </div>
    </div>
  );
}
