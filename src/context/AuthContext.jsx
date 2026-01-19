import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize demo user if users don't exist
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      // Create demo user
      const demoUser = {
        id: 1,
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User',
        createdAt: new Date().toISOString(),
        verified: true
      };
      localStorage.setItem('users', JSON.stringify([demoUser]));
      console.log('✅ Demo user created: demo@example.com / demo123');
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = (email, password, name) => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    // Add new user
    const newUser = {
      id: Date.now(),
      email,
      password, // Note: In production, this should be hashed!
      name,
      createdAt: new Date().toISOString(),
      verified: false
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto-login after registration
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
    setIsAuthenticated(true);

    return { success: true, message: 'Registration successful!' };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      return { success: false, message: 'Email not found' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
    setIsAuthenticated(true);

    return { success: true, message: 'Login successful!' };
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
