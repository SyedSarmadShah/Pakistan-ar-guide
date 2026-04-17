import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import NavBar from './NavBar';

const Chatbot = () => {
  const { isDark } = useDarkMode();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Pakistan Tourism AI assistant. Ask me about destinations, best seasons to visit, travel recommendations, or anything related to traveling in Pakistan!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3000/api/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Sorry, I couldn\'t process that request.'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please make sure the chatbot server is running on port 3000.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are the top-rated destinations in Pakistan?",
    "Best places to visit in summer?",
    "Tell me about Hunza Valley",
    "What's the weather like in Lahore?"
  ];

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
      <NavBar />
      
      {/* Page Title */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'} shadow-lg border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Travel Companion</h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Powered by Groq AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                    : isDark
                    ? 'bg-gray-800 shadow-md text-gray-100'
                    : 'bg-white shadow-md text-gray-900'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className={`${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow-md rounded-2xl px-6 py-4 flex items-center gap-3`}>
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <div className={`flex items-center gap-2 mb-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Sparkles className="w-4 h-4" />
            <span>Try asking:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q)}
                className={`text-left px-4 py-3 ${isDark ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200' : 'bg-white hover:bg-emerald-50 border-emerald-200 text-gray-800'} border rounded-lg text-sm transition`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} border-t shadow-lg`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about Pakistan tourism..."
              disabled={isLoading}
              className={`flex-1 px-6 py-3 border rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed transition ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-600'
                  : 'border-emerald-200 disabled:bg-gray-100 text-gray-900'
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-8 py-3 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </form>
          <p className={`text-xs mt-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Note: Make sure the chatbot server is running on port 3000
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
