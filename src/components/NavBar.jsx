import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Heart, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = ({ isDark, user, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 p-1 rounded-full border transition ${
          isDark 
            ? 'border-gray-750 bg-gray-800 hover:bg-gray-700 text-white' 
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="text-xs font-semibold max-w-[85px] truncate pr-2 hidden sm:inline-block">
          {user?.name || 'Profile'}
        </span>
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-850'
        }`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold truncate">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'guest@ghoomopakistan.com'}</p>
          </div>
          <div className="p-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();

  useEffect(() => {
    const updateFavCount = () => {
      const saved = localStorage.getItem('favorites');
      const favList = saved ? JSON.parse(saved) : [];
      setFavoritesCount(favList.length);
    };
    updateFavCount();
    window.addEventListener('storage', updateFavCount);
    return () => {
      window.removeEventListener('storage', updateFavCount);
    };
  }, []);

  const primaryNav = [
    { label: 'Explore Pakistan', path: '/recommendations' },
    { label: 'Trip Planner', path: '/planner' },
    { label: 'Packages', path: '/checkout' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const [logoVisible, setLogoVisible] = useState(true);

  return (
    <nav className={`${isDark ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-100'} border-b shadow-sm sticky top-0 z-50 transition`}>
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('/')}
            className="cursor-pointer font-bold text-xl text-emerald-600 flex items-center gap-3 hover:text-emerald-700 transition flex-shrink-0"
          >
            <img
              src="/images/logo.png"
              alt="Ghoomo Pakistan Logo"
              className={`h-12 w-12 object-contain ${logoVisible ? 'block' : 'hidden'}`}
              onLoad={() => setLogoVisible(true)}
              onError={() => setLogoVisible(false)}
            />
            <span className="whitespace-nowrap leading-none tracking-tight font-serif text-emerald-600 dark:text-emerald-500 text-lg sm:text-xl">
              Ghoomo Pakistan
            </span>
          </div>

          {/* Desktop Primary Navigation (Centered) */}
          <div className="hidden md:flex items-center justify-center gap-1 flex-1">
            {primaryNav.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`font-semibold text-[13px] tracking-wide transition px-4 py-2 rounded-full relative whitespace-nowrap ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Secondary Navigation (Right-aligned) */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Favorites Icon Button */}
            <button
              onClick={() => handleNavClick('/favorites')}
              className={`relative p-2 rounded-full transition ${
                isActive('/favorites')
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                  : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Chat Assistant Option (Visually lighter pill) */}
            <button
              onClick={() => handleNavClick('/chat')}
              className={`font-medium text-xs py-1.5 px-3 rounded-full transition border flex items-center gap-1.5 ${
                isActive('/chat')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-650'
                  : 'border-gray-200 text-gray-650 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Chat Assistant</span>
              <span className="lg:hidden">Chat</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Profile Dropdown */}
            <div className={`h-8 w-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'} mx-1`}></div>
            <ProfileDropdown isDark={isDark} user={user} handleLogout={handleLogout} />
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition ${
                isDark 
                  ? 'bg-gray-800 text-yellow-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 space-y-4 pb-4 border-t ${isDark ? 'border-gray-850' : 'border-gray-200'} pt-4`}>
            {/* Primary Nav Links */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">Explore & Plan</p>
              {primaryNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold transition ${
                    isActive(item.path)
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-850 my-2"></div>

            {/* Secondary Nav Links */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">Account & Utilities</p>
              
              {/* Favorites Link */}
              <button
                onClick={() => handleNavClick('/favorites')}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold transition flex items-center justify-between ${
                  isActive('/favorites')
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4.5 h-4.5 text-red-500" />
                  Favorites
                </span>
                {favoritesCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Chat Assistant Link */}
              <button
                onClick={() => handleNavClick('/chat')}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 ${
                  isActive('/chat')
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5" />
                Chat Assistant
              </button>

              {/* User display */}
              <div className={`mx-3 p-3 rounded-xl border mt-3 flex flex-col gap-1 ${
                isDark ? 'border-gray-800 bg-gray-900/60' : 'border-gray-100 bg-gray-50'
              }`}>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-350">{user?.name || 'Guest User'}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{user?.email || 'guest@ghoomopakistan.com'}</p>
              </div>

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/10 transition mt-2 flex items-center gap-2"
              >
                <LogOut className="w-4.5 h-4.5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
