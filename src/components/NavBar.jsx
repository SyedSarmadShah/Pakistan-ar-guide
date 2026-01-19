import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Heart, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';

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
    const interval = setInterval(updateFavCount, 1000);
    return () => {
      window.removeEventListener('storage', updateFavCount);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'AR Guide', path: '/ar' },
    { label: 'Recommendations', path: '/recommendations' },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'Chat', path: '/chat' },
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

  return (
    <nav className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-lg sticky top-0 z-50 transition`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('/')}
            className="cursor-pointer font-bold text-2xl text-emerald-600 flex items-center gap-2 hover:text-emerald-700 transition"
          >
            🇵🇰 Pakistan AR
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`font-medium transition px-3 py-2 rounded-lg flex items-center gap-1 relative ${
                  isActive(item.path)
                    ? 'bg-emerald-600 text-white'
                    : isDark
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
                {item.path === '/favorites' && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {favoritesCount}
                  </span>
                )}
              </button>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'guest'}</p>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition ${
                  isDark 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button & Dark Mode */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 space-y-2 pb-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} pt-4`}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 relative ${
                  isActive(item.path)
                    ? 'bg-emerald-600 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                {item.label}
                {item.path === '/favorites' && favoritesCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {favoritesCount}
                  </span>
                )}
              </button>
            ))}

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                isDark
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
