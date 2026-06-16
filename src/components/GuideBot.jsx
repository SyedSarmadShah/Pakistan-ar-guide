import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, X, Sparkles, Send, HelpCircle, ChevronRight, ChevronLeft, ArrowRight, MessageSquare, Compass, Info, Award, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';

// Define the steps for the interactive website tour
const TOUR_STEPS = [
  {
    path: '/',
    title: '🏠 Welcome & Home Page',
    description: 'Welcome to Ghoomo Pakistan! Here you can get a snapshot of beautiful destinations in Pakistan, and access key quick actions like AR monument recognition, smart recommendations, and the AI travel companion.',
  },
  {
    path: '/recommendations',
    title: '🧭 Smart Recommendations',
    description: 'Browse curated destinations across all provinces of Pakistan. You can search by name, filter by province (Punjab, Sindh, KPK, Balochistan, Gilgit-Baltistan) or category, and read details about each place.',
  },
  {
    path: '/favorites',
    title: '❤️ Your Favorites list',
    description: 'See the list of places you have marked as favorites. You can save destinations by clicking the heart button on the recommendations page so you can easily reference them later!',
  },
  {
    path: '/ar',
    title: '📸 AI AR Monument Guide',
    description: 'Use your camera to scan and identify monuments in real-time. Our advanced Teachable Machine AI model will recognize the historical site (like Badshahi Mosque, Taxila, or Mohenjo-daro) and speak the audio narration automatically!',
  },
  {
    path: '/planner',
    title: '📅 Custom Trip Planner',
    description: 'Input your trip preferences including duration (days), budget level, travel style, and per-day visiting capacity. We will generate a customized day-by-day itinerary which you can save or export to JSON/ICS.',
  },
  {
    path: '/chat',
    title: '💬 AI Travel Companion',
    description: 'Chat with our AI bot powered by Llama-3. Ask direct questions about history, best seasons, roads, hotels, cultural practices, and local delicacies. (Make sure your backend server is running in the backend folder!)',
  },
  {
    path: '/checkout',
    title: '💳 Booking & Ticketing',
    description: 'Book customized tour packages, entry tickets, hotel stays, and flights. You can select tickets, adjust passenger counts, and simulate checkout bookings securely.',
  }
];

// Local FAQ database for instant matching if backend is offline or user asks site-related questions
const SITE_FAQS = [
  {
    keywords: ['ar', 'scan', 'camera', 'monument', 'landmark', 'recognize'],
    answer: "To use the AR Monument Guide:\n1. Navigate to the 'AR Guide' page.\n2. Click 'Start Camera' and grant browser camera permission.\n3. Position a landmark (like Badshahi Mosque or Taxila) in front of the camera.\n4. The AI will recognize it, show markers, and play an automatic audio guide narration!"
  },
  {
    keywords: ['plan', 'trip', 'itinerary', 'export', 'generate', 'days'],
    answer: "To plan a trip:\n1. Go to the 'Trip Planner' page.\n2. Enter your itinerary title, trip length (in days), budget level (low/medium/high), and travel style.\n3. Adjust per-day capacity and click 'Generate'.\n4. You can save the plan or export it as JSON or an ICS calendar file!"
  },
  {
    keywords: ['book', 'ticket', 'checkout', 'hotel', 'flight', 'package', 'buy'],
    answer: "To book tickets/packages:\n1. Open the 'Checkout' page.\n2. Choose from curated packages (e.g. Hunza Autumn, Lahore Heritage) or customize tickets.\n3. Adjust counts, enter details, and click 'Proceed to Checkout' to complete the simulated booking."
  },
  {
    keywords: ['favorite', 'save', 'heart', 'like'],
    answer: "You can save places to your Favorites list by clicking the heart button on the Recommendations page. View them anytime by going to the 'Favorites' tab."
  },
  {
    keywords: ['chat', 'ai', 'groq', 'llama', 'ask', 'question'],
    answer: "Our AI Travel Companion is powered by Groq Llama-3. Open the 'Chat' page to ask deep questions. Note: you need to run the Node.js backend server inside the 'recommendation and chatbot' folder for AI features to connect."
  },
  {
    keywords: ['who are you', 'what is this', 'about', 'guide', 'bot', 'help', 'rahbar'],
    answer: "I am Rahbar, your interactive website guide! I float across Ghoomo Pakistan to help you learn how to use the site, provide step-by-step tours, and answer questions. Feel free to click 'Start Tour' to get a guided walkthrough!"
  }
];

const GuideBot = () => {
  const { isDark } = useDarkMode();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  
  // Interactive Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', content: "Salam! 🇵🇰 I'm Rahbar, your website assistant. Need help finding your way around? Ask me anything about Ghoomo Pakistan, or click 'Start Tour' to walk through our features!" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen]);

  // Context-aware bubble tips when route changes
  useEffect(() => {
    // Hide bubble first to trigger re-animation
    setShowBubble(false);
    
    // Ignore auth screens
    if (location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    const timer = setTimeout(() => {
      let message = '';
      switch (location.pathname) {
        case '/':
          // Show welcome only if first time or fresh homepage load
          const hasSeenWelcome = sessionStorage.getItem('rahbar_seen_welcome');
          if (!hasSeenWelcome) {
            message = `Salam ${user?.name || 'traveler'}! 🇵🇰 Ready to explore Pakistan? Click me for a guided website tour!`;
            sessionStorage.setItem('rahbar_seen_welcome', 'true');
          } else {
            message = "Welcome to Ghoomo Pakistan. Check out the Quick Actions below to start your journey!";
          }
          break;
        case '/ar':
          message = "📸 AR Guide loaded! Grant camera access and point it at a monument to scan.";
          break;
        case '/planner':
          message = "📅 Fill in your budget and travel style to generate a smart day-by-day itinerary!";
          break;
        case '/recommendations':
          message = "🧭 Click the heart icon on any place to save it to your Favorites!";
          break;
        case '/favorites':
          message = "❤️ Here are all your saved favorite spots. You can access them anytime!";
          break;
        case '/chat':
          message = "💬 Ask our AI Travel Companion detailed questions about routes, seasons, and spots!";
          break;
        case '/checkout':
          message = "💳 Book customized travel packages and entry tickets for famous historical sites.";
          break;
        default:
          break;
      }

      if (message && !isTourActive) {
        setBubbleText(message);
        setShowBubble(true);
        // Auto-close bubble after 8 seconds
        const closeTimer = setTimeout(() => {
          setShowBubble(false);
        }, 8000);
        return () => clearTimeout(closeTimer);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, user, isTourActive]);

  // Handle User Chat Input
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    setInputVal('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // 1. Check local FAQs first
    let localResponse = null;
    const lowerMsg = userMsg.toLowerCase();
    for (const faq of SITE_FAQS) {
      if (faq.keywords.some(keyword => lowerMsg.includes(keyword))) {
        localResponse = faq.answer;
        break;
      }
    }

    setTimeout(async () => {
      if (localResponse) {
        setChatMessages(prev => [...prev, { role: 'bot', content: localResponse }]);
        setIsTyping(false);
      } else {
        // Try calling the backend AI Chatbot if it's a tourism/general question
        const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/chat`;
        try {
          const response = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
          });
          const text = await response.text();
          let data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { response: text };
          }

          if (response.ok && data.response) {
            setChatMessages(prev => [...prev, { role: 'bot', content: data.response }]);
          } else {
            throw new Error();
          }
        } catch {
          // If backend offline or error, provide a helpful general fallback
          setChatMessages(prev => [...prev, { 
            role: 'bot', 
            content: "I'm specializing in helping you navigate this website. I couldn't reach our tourism database server. Here's a tip: You can start the interactive tour using the button above to learn about Ghoomo Pakistan!" 
          }]);
        } finally {
          setIsTyping(false);
        }
      }
    }, 700);
  };

  // Tour Controls
  const startTour = () => {
    setIsTourActive(true);
    setTourIndex(0);
    setIsOpen(true);
    setShowBubble(false);
    navigate(TOUR_STEPS[0].path);
  };

  const endTour = () => {
    setIsTourActive(false);
    setChatMessages(prev => [...prev, { role: 'bot', content: "Hope that tour was helpful! Feel free to ask me any other questions about how to use the website." }]);
  };

  const nextTourStep = () => {
    if (tourIndex < TOUR_STEPS.length - 1) {
      const nextIdx = tourIndex + 1;
      setTourIndex(nextIdx);
      navigate(TOUR_STEPS[nextIdx].path);
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (tourIndex > 0) {
      const prevIdx = tourIndex - 1;
      setTourIndex(prevIdx);
      navigate(TOUR_STEPS[prevIdx].path);
    }
  };

  const handleFAQClick = (faqText) => {
    setInputVal(faqText);
  };

  // Hide the GuideBot on authentication pages (Login / Register) unless desired
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Get active step info if tour is running
  const activeStep = TOUR_STEPS[tourIndex];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Welcome / Context-Aware Speech Bubble */}
      {showBubble && !isOpen && (
        <div className={`absolute bottom-16 right-0 mb-2 w-72 p-4 rounded-2xl shadow-xl transition-all duration-300 transform scale-100 origin-bottom-right border ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white shadow-emerald-950/20' 
            : 'bg-white border-emerald-100 text-gray-800 shadow-emerald-600/10'
        }`}>
          <button 
            onClick={() => setShowBubble(false)} 
            className={`absolute top-2 right-2 p-0.5 rounded-full hover:bg-black/5 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            aria-label="Close bubble"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex gap-2.5 items-start">
            <div className="bg-emerald-500/15 p-1.5 rounded-lg flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Guide Tip</p>
              <p className="text-sm mt-0.5 leading-relaxed font-medium">{bubbleText}</p>
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={startTour}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1"
                >
                  Start Tour <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(true);
                    setShowBubble(false);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition ${
                    isDark 
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  Ask Rahbar
                </button>
              </div>
            </div>
          </div>
          {/* Bubble Arrow */}
          <div className={`absolute bottom-0 right-7 transform translate-y-1/2 rotate-45 w-3.5 h-3.5 border-r border-b ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'
          }`}></div>
        </div>
      )}

      {/* Main Panel */}
      {isOpen && (
        <div className={`absolute bottom-20 right-0 w-[380px] max-w-[90vw] h-[550px] max-h-[80vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 border ${
          isDark 
            ? 'bg-gray-900 border-gray-800 text-white shadow-black/50' 
            : 'bg-white border-emerald-100 text-gray-800 shadow-emerald-950/20'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md animate-bounce">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-1.5">
                  Rahbar 
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/35 px-1.5 py-0.5 rounded border border-white/10">Guide</span>
                </h3>
                <p className="text-xs text-white/80">Website Tour & Assistance</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition"
              aria-label="Close guide panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tour Mode vs Chat Mode Content */}
          {isTourActive ? (
            /* Interactive Tour Controller View */
            <div className={`flex-1 flex flex-col p-5 overflow-y-auto ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Website Tour: Step {tourIndex + 1} of {TOUR_STEPS.length}
                </span>
                <button 
                  onClick={endTour}
                  className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-0.5"
                >
                  <X className="w-3.5 h-3.5" /> End Tour
                </button>
              </div>

              {/* Guide Character Dialogue Card */}
              <div className={`flex-1 flex flex-col justify-center items-center text-center p-6 rounded-2xl border mb-6 ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-emerald-100/80 shadow-sm'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                  <Bot className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">{activeStep.title}</h4>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {activeStep.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${((tourIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                ></div>
              </div>

              {/* Tour Navigation Controls */}
              <div className="flex justify-between items-center gap-3 mt-auto">
                <button
                  onClick={prevTourStep}
                  disabled={tourIndex === 0}
                  className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
                    tourIndex === 0 
                      ? 'opacity-40 cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-800' 
                      : isDark
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  onClick={nextTourStep}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/10"
                >
                  {tourIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Route'} 
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard Chat & Context Advice View */
            <>
              {/* Dynamic Page Context Bar */}
              <div className={`px-4 py-2.5 flex items-center gap-2 text-xs border-b font-medium flex-shrink-0 ${
                isDark ? 'bg-gray-950/80 border-gray-800 text-gray-400' : 'bg-emerald-50/50 border-emerald-100 text-gray-600'
              }`}>
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">
                  Viewing: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{location.pathname === '/' ? 'Home Page' : location.pathname.substring(1)}</strong>
                </span>
                <button
                  onClick={startTour}
                  className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold"
                >
                  <Compass className="w-3 h-3" /> Tour Page
                </button>
              </div>

              {/* Chat Log */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center text-white shadow">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : isDark
                        ? 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
                        : 'bg-white border border-emerald-50 text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center text-white shadow">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm border flex items-center gap-1.5 ${
                      isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-emerald-50 text-gray-500'
                    }`}>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Interactive Help Suggestions (FAQs) */}
              <div className={`p-3 border-t flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-emerald-100'}`}>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Click to ask Rahbar:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
                  <button 
                    onClick={() => handleFAQClick("How do I scan a monument with AR?")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition font-medium ${
                      isDark 
                        ? 'border-gray-800 bg-gray-950 hover:bg-gray-800 text-gray-300' 
                        : 'border-emerald-50 bg-emerald-50/20 hover:bg-emerald-50 text-gray-600'
                    }`}
                  >
                    📸 How to use AR Guide?
                  </button>
                  <button 
                    onClick={() => handleFAQClick("How does the Trip Planner work?")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition font-medium ${
                      isDark 
                        ? 'border-gray-800 bg-gray-950 hover:bg-gray-800 text-gray-300' 
                        : 'border-emerald-50 bg-emerald-50/20 hover:bg-emerald-50 text-gray-600'
                    }`}
                  >
                    📅 Generate an itinerary
                  </button>
                  <button 
                    onClick={() => handleFAQClick("How can I book tickets & tours?")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition font-medium ${
                      isDark 
                        ? 'border-gray-800 bg-gray-950 hover:bg-gray-800 text-gray-300' 
                        : 'border-emerald-50 bg-emerald-50/20 hover:bg-emerald-50 text-gray-600'
                    }`}
                  >
                    💳 Tickets & Bookings
                  </button>
                  <button 
                    onClick={startTour}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                  >
                    🚀 Start Website Tour
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div className={`p-3 border-t flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-emerald-50'}`}>
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask how to use the website..."
                    className={`flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'border-emerald-100 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
                    aria-label="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowBubble(false);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 relative z-50`}
        aria-label="Toggle Guide Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-spin" style={{ animationDuration: '0.4s', animationIterationCount: 1 }} />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6" />
            <div className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-2.5 h-2.5 animate-ping"></div>
            <div className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-2.5 h-2.5"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default GuideBot;
