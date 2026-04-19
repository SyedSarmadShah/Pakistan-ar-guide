import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKGROUND_VIDEOS = ['/isl.mp4', '/hiking.mp4', '/jeep.mp4'];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_VIDEOS.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {BACKGROUND_VIDEOS.map((videoSrc, index) => (
          <video
            key={videoSrc}
            className={`absolute inset-0 h-full w-full object-fill transition-opacity duration-700 ease-in-out ${
              index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/capital.jpg"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8 lg:px-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 w-full max-w-sm mx-auto lg:mx-0">
            <div className="rounded-3xl border border-white/35 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
              <h1 className="text-white text-2xl font-bold mb-6">Login to Your Account</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="••••••••"
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

                <label className="flex items-center gap-2 text-xs text-white/85">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/60 bg-white/20"
                  />
                  Keep me signed in
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
                  {isLoading ? 'Logging in...' : 'LOGIN'}
                </button>
              </form>

              <div className="mt-3 flex justify-between text-xs">
                <Link to="/register" className="text-white/85 hover:text-white underline underline-offset-2">
                  Create account
                </Link>
                <span className="text-white/80">Forgot Password?</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/25 bg-black/25 px-4 py-3 text-xs text-white/85">
              Demo: demo@example.com / demo123
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
              Discover Pakistan's heritage with immersive AR guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
