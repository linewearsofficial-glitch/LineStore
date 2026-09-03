import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import BrandLogo from '@/components/features/BrandLogo';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const { login, isLoggedIn, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isLoggedIn) navigate('/admin/dashboard', { replace: true });
  }, [isLoggedIn, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const success = login(email, password);
    if (success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid credentials. Access denied.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-line-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <BrandLogo color="white" size="lg" linkTo="" />
          <p className="font-sans text-xs text-gray-500 mt-2 tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-2 mb-8">
            <Lock size={16} />
            <h1 className="font-display text-2xl tracking-widest">ADMIN ACCESS</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-box"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-box pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-line-gray hover:text-line-black"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-sans text-xs text-red-600 bg-red-50 px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
