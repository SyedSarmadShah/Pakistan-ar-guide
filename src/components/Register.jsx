import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validatePassword = (pwd) => {
    return pwd.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to Terms & Conditions');
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = register(email, password, name);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/capital.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8 lg:px-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 w-full max-w-sm mx-auto lg:mx-0">
            <div className="rounded-3xl border border-white/35 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
              <h1 className="text-white text-2xl font-bold mb-6">Create Your Account</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/90 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-md border border-white/35 bg-white/15 text-white placeholder-white/70 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/90 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-white/35 bg-white/15 text-white placeholder-white/70 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/90 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-md border border-white/35 bg-white/15 text-white placeholder-white/70 pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/90 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-md border border-white/35 bg-white/15 text-white placeholder-white/70 pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label htmlFor="terms" className="flex items-start gap-2 text-xs text-white/85">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-white/60 bg-white/20"
                  />
                  I agree to the Terms and Privacy Policy.
                </label>

                {error && (
                  <div className="rounded-md border border-red-300/70 bg-red-500/20 px-3 py-2 text-sm text-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-white text-gray-900 font-semibold py-2.5 hover:bg-gray-100 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'CREATE ACCOUNT'}
                </button>
              </form>

              <div className="mt-3 flex justify-between text-xs">
                <Link to="/login" className="text-white/85 hover:text-white underline underline-offset-2">
                  Already have an account?
                </Link>
                <span className="text-white/80">Secure Signup</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-white text-center lg:text-left max-w-xl ml-auto mr-auto lg:mr-0 lg:ml-0">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              THE GOAL OF LIFE IS
              <br />
              LIVING IN AGREEMENT
              <br />
              WITH NATURE.
            </h2>
            <div className="mt-4 h-1 w-32 bg-white/90 mx-auto lg:mx-0" />
            <p className="mt-4 text-sm sm:text-base text-white/90">
              Begin your journey through Pakistan's living heritage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
