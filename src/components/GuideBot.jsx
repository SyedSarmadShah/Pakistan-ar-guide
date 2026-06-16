import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, X, Sparkles, Send, HelpCircle, ChevronRight, ChevronLeft, Compass, Info, MessageSquare } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';

// Keep the interactive website tour steps
const TOUR_STEPS = [
  {
    path: '/',
    title: '🏠 Welcome & Home Page',
    description: 'Welcome to Ghoomo Pakistan! Explore heritage, plan routes, and experience Pakistani travel through a premium digital portal.',
  },
  {
    path: '/recommendations',
    title: '🧭 Explore Pakistan',
    description: 'Browse curated destinations across all provinces of Pakistan. Filter by category, province, rating, or search directly.',
  },
  {
    path: '/favorites',
    title: '❤️ Your Favorites List',
    description: 'Access the list of destinations you have saved by clicking the heart icons during exploration.',
  },
  {
    path: '/ar',
    title: '📸 AI AR Monument Guide',
    description: 'Scan historical landmarks (like Badshahi Mosque or Taxila) to hear voice audio guides and read cultural summaries.',
  },
  {
    path: '/planner',
    title: '📅 Custom Trip Planner',
    description: 'Auto-generate customized, day-by-day itineraries based on your budget, travel style, and available days.',
  },
  {
    path: '/chat',
    title: '💬 Dedicated AI Assistant',
    description: 'Consult our Llama-3-powered backend chatbot for specific details regarding weather, road status, local foods, and hotels.',
  },
  {
    path: '/checkout',
    title: '💳 Travel Packages',
    description: 'Explore and book curated travel packages, simulate passport entries, passenger counts, and booking checkouts.'
  }
];

// Rich FAQ matching database for instant, smart local replies
const SITE_FAQS = [
  {
    keywords: ['ar', 'scan', 'camera', 'monument', 'landmark', 'recognize'],
    answer: "To use the AR Monument Guide:\n1. Navigate to the 'AR Guide' page.\n2. Click 'Start Camera' and grant browser camera permissions.\n3. Align a monument (e.g. Badshahi Mosque) in the view.\n4. Our custom Teachable Machine AI will identify it and speak a narration!"
  },
  {
    keywords: ['plan', 'trip', 'itinerary', 'export', 'generate', 'days'],
    answer: "To plan a trip:\n1. Go to the 'Trip Planner' page.\n2. Input your itinerary name, trip length (in days), budget level, and travel style.\n3. Click 'Generate' to see a day-by-day routing.\n4. You can export the itinerary to JSON or ICS calendar format!"
  },
  {
    keywords: ['book', 'ticket', 'checkout', 'hotel', 'flight', 'package', 'buy'],
    answer: "To book packages/tickets:\n1. Open the 'Packages' page (checkout route).\n2. View curated packages (e.g. Hunza Autumn, Lahore Heritage).\n3. Adjust passengers, review prices, and simulate checkout bookings securely."
  },
  {
    keywords: ['favorite', 'save', 'heart', 'like'],
    answer: "Simply click the Heart icon on any destination card in the Explore Pakistan section. You can view all saved items in the 'Favorites' tab."
  },
  {
    keywords: ['who are you', 'what is this', 'about', 'guide', 'bot', 'help', 'rahbar'],
    answer: "I am Rahbar, your interactive AI Guide! I assist you in exploring Ghoomo Pakistan, explaining routes, and showing step-by-step website tours."
  },
  {
    keywords: ['hunza'],
    answer: "To plan a trip to Hunza Valley:\n1. Open the 'Trip Planner' from the menu.\n2. Set your days (we recommend 5-7 days for Hunza) and budget.\n3. Click 'Generate' to get a day-by-day route showing Karimabad, Attabad Lake, and Baltit Fort.\n4. You can also view Hunza Valley in the Explore section!"
  },
  {
    keywords: ['lahore'],
    answer: "Lahore is the cultural heart of Pakistan! Must-visit places include:\n- Badshahi Mosque & Lahore Fort (Mughal Architecture)\n- Shalimar Gardens\n- Wazir Khan Mosque\n- Food Street in old Lahore\nYou can use our 'AR Guide' to scan the Badshahi Mosque and hear its history!"
  },
  {
    keywords: ['family', 'kids'],
    answer: "Family-friendly destinations in Pakistan include:\n- Islamabad: Clean parks, Faisal Mosque, and Lok Virsa Museum.\n- Hunza Valley: Peaceful, safe, and highly scenic.\n- Murree & Galyat: Easily accessible with family hotels and chairlifts.\nUse the Trip Planner to customize your travel style as 'Family'!"
  },
  {
    keywords: ['historical', 'monument', 'history', 'taxila', 'mohenjo-daro'],
    answer: "Pakistan has rich ancient historical heritage. Key sites include:\n- Badshahi Mosque (Lahore)\n- Taxila (Ancient Buddhist center in Punjab)\n- Mohenjo-daro (Indus Valley Civilization in Sindh)\nYou can identify and learn about these historical monuments using our camera-enabled AR Monument Guide!"
  }
];

const GuideBot = () => {
  const { isDark } = useDarkMode();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // Chat Log State
  const [chatMessages, setChatMessages] = useState([
    { 
      role: 'bot', 
      content: "Salam! 🇵🇰 I'm Rahbar, your Ghoomo Pakistan travel assistant. Ask me questions about destinations, history, or how to use the site!" 
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen, isTyping]);

  // Handle Chat Queries
  const sendChatMessage = async (userMsg) => {
    if (!userMsg.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // 1. Keyword search in local database
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
        // 2. Call backend Groq AI Chat API
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
          // General fallback
          setChatMessages(prev => [...prev, { 
            role: 'bot', 
            content: `I'm Rahbar! I couldn't reach our general tourism database server, but I can guide you through the website. 

Try asking:
- "How to use AR Guide?"
- "Plan a trip to Hunza"
- "How do I book tickets?"` 
          }]);
        } finally {
          setIsTyping(false);
        }
      }
    }, 700);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const msg = inputVal;
    setInputVal('');
    sendChatMessage(msg);
  };

  // Tour Controls
  const startTour = () => {
    setIsTourActive(true);
    setTourIndex(0);
    setIsOpen(true);
    navigate(TOUR_STEPS[0].path);
  };

  const endTour = () => {
    setIsTourActive(false);
    setChatMessages(prev => [...prev, { role: 'bot', content: "Hope the tour was helpful! Feel free to ask me more questions." }]);
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

  // Hide on auth views
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const activeStep = TOUR_STEPS[tourIndex];

  // AI assistant prompts
  const suggestedPrompts = [
    'Plan a trip to Hunza',
    'Best places to visit in Lahore',
    'Family-friendly destinations',
    'Historical sites in Pakistan'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Compact Panel (Drift/Intercom style) */}
      {isOpen && (
        <div className={`absolute bottom-20 right-0 w-[360px] max-w-[90vw] h-[500px] max-h-[78vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 ${
          isDark 
            ? 'bg-gray-900 border-gray-800 text-white shadow-black/60' 
            : 'bg-white border-emerald-100 text-gray-800 shadow-emerald-950/20'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center relative flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Ask Rahbar 
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/30 px-1.5 py-0.5 rounded border border-white/10">AI</span>
                </h3>
                <p className="text-[11px] text-white/85">Your AI Travel Companion</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition"
              aria-label="Close Assistant Panel"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body Content */}
          {isTourActive ? (
            /* Tour Controller */
            <div className={`flex-1 flex flex-col p-5 overflow-y-auto ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Step {tourIndex + 1} of {TOUR_STEPS.length}
                </span>
                <button 
                  onClick={endTour}
                  className="text-red-500 hover:text-red-650 text-xs font-semibold flex items-center gap-0.5"
                >
                  <X className="w-3.5 h-3.5" /> End Tour
                </button>
              </div>

              <div className={`flex-1 flex flex-col justify-center items-center text-center p-6 rounded-2xl border mb-6 ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-emerald-100/60 shadow-sm'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white mb-4 shadow">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base mb-2">{activeStep.title}</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-650'}`}>
                  {activeStep.description}
                </p>
              </div>

              {/* Progress */}
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-emerald-650 h-full transition-all duration-300"
                  style={{ width: `${((tourIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                ></div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center gap-3 mt-auto">
                <button
                  onClick={prevTourStep}
                  disabled={tourIndex === 0}
                  className={`flex items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                    tourIndex === 0 
                      ? 'opacity-40 cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-800' 
                      : isDark
                      ? 'border-gray-750 text-gray-350 hover:bg-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={nextTourStep}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold px-3 py-2 rounded-xl text-xs transition flex items-center justify-center gap-0.5"
                >
                  {tourIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} 
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* Context Info and Walkthrough Trigger */}
              <div className={`px-4 py-2 flex items-center gap-2 text-[11px] border-b font-medium flex-shrink-0 ${
                isDark ? 'bg-gray-950/70 border-gray-800 text-gray-400' : 'bg-emerald-50/40 border-emerald-100 text-gray-650'
              }`}>
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />
                <span className="truncate">
                  Location: <strong className="text-emerald-650 dark:text-emerald-400 capitalize">{location.pathname === '/' ? 'Home' : location.pathname.substring(1)}</strong>
                </span>
                <button
                  onClick={startTour}
                  className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold"
                >
                  <Compass className="w-3 h-3" /> Tour Site
                </button>
              </div>

              {/* Chat Log Message Area */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
                {/* Greetings message cards (Shown first) */}
                {chatMessages.length === 1 && (
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-850' : 'bg-white border-emerald-100/70 shadow-sm'} text-xs space-y-3`}>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-450">Salam {user?.name || 'Traveler'}! 🇵🇰</p>
                    <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                      I'm Rahbar, your website assistant. Pick a prompt below to start or type a question in the box!
                    </p>
                    <div className="flex flex-col gap-2 pt-1.5">
                      {suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendChatMessage(p)}
                          className={`text-left p-2.5 rounded-xl border text-[11px] font-semibold transition hover:scale-[1.01] ${
                            isDark 
                              ? 'bg-gray-850 hover:bg-gray-800 border-gray-700 text-gray-300' 
                              : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-200 text-slate-700'
                          }`}
                        >
                          🧭 {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Log History */}
                {chatMessages.map((msg, index) => {
                  // Skip displaying greeting message inside scroll log to prevent duplication
                  if (index === 0 && msg.role === 'bot') return null;

                  return (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'bot' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center text-white shadow">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : isDark
                          ? 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
                          : 'bg-white border border-slate-100 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center text-white shadow">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className={`rounded-2xl px-3.5 py-2 text-xs border flex items-center gap-1.5 ${
                      isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-slate-100 text-gray-500'
                    }`}>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <div className={`p-3 border-t flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'}`}>
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask how to use the website..."
                    className={`flex-1 px-4 py-2 border rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                      isDark 
                        ? 'bg-gray-850 border-gray-700 text-white placeholder-gray-500' 
                        : 'border-slate-200 text-gray-800 placeholder-gray-400'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
                    aria-label="Send Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 z-50 group font-bold tracking-wide text-sm px-4 py-3 sm:px-5 sm:py-3.5"
        aria-label="Ask Rahbar Assistant"
      >
        {/* Subtle Pulse Animation Rings */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping opacity-75 pointer-events-none"></span>

        <span className="flex items-center gap-2">
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              {/* Mobile icon only vs Desktop full text button */}
              <span className="text-base">💬</span>
              <span className="hidden sm:inline">Ask Rahbar</span>
            </>
          )}
        </span>
      </button>
    </div>
  );
};

export default GuideBot;
