import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Camera, 
  Compass, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  Ticket, 
  Calendar, 
  ArrowRightCircle, 
  Info,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import { getPlaceImage } from '../utils/imageMapper';
import NavBar from './NavBar';

const HomePage = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();

  // "Recommended For You" Destinations
  const recommendations = [
    {
      name: 'Hunza Valley',
      image: getPlaceImage('Hunza Valley'),
      category: 'Nature & Adventure',
      description: 'Glacial water, terraced villages, fruit orchards, and dramatic mountain walls of Karakoram.',
      path: '/recommendations'
    },
    {
      name: 'Skardu',
      image: getPlaceImage('Skardu Valley'),
      category: 'Valleys & Lakes',
      description: 'A gateway to some of the world\'s highest peaks, cold deserts, and quiet alpine lakes.',
      path: '/recommendations'
    },
    {
      name: 'Lahore',
      image: getPlaceImage('Lahore Fort'),
      category: 'History & Culture',
      description: 'Mughal grandeur, ancient forts, rich street food markets, and centuries of living culture.',
      path: '/recommendations'
    },
    {
      name: 'Taxila',
      image: getPlaceImage('Taxila'),
      category: 'Ancient Heritage',
      description: 'Ancient centers of learning, sacred ruins, and layered Buddhist archaeological heritage.',
      path: '/recommendations'
    }
  ];

  // Feature cards (Replacing old buttons)
  const journeyFeatures = [
    {
      title: 'Places To Visit',
      icon: MapPin,
      description: 'Explore breathtaking valleys, historical mosques, and heritage sites.',
      badge: 'Discover',
      to: '/recommendations',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Plan My Trip',
      icon: Compass,
      description: 'Input your preferences to auto-generate custom day-by-day itineraries.',
      badge: 'Plan',
      to: '/planner',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Book Tickets',
      icon: Ticket,
      description: 'Secure flights, hotels, and custom travel packages easily.',
      badge: 'Book',
      to: '/checkout',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Top Experiences',
      icon: Sparkles,
      description: 'Use the AR guide to scan monuments and listen to spoken audio stories.',
      badge: 'Experience',
      to: '/ar',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  // Why Ghoomo Pakistan Feature Showcases
  const whyShowcases = [
    {
      title: 'AI Travel Assistant',
      description: 'Get instant travel recommendations and guidance tailored to your specific travel style.',
      icon: MessageSquare,
      to: '/chat'
    },
    {
      title: 'Smart Trip Planner',
      description: 'Build personalized day-by-day travel itineraries in minutes based on your budget.',
      icon: Calendar,
      to: '/planner'
    },
    {
      title: 'AR Monument Guide',
      description: 'Point your camera at historical monuments to scan and learn their stories instantly.',
      icon: Camera,
      to: '/ar'
    },
    {
      title: 'Curated Travel Packages',
      description: 'Book trusted, highly-rated travel experiences and activities across Pakistan.',
      icon: ShieldCheck,
      to: '/checkout'
    }
  ];

  // Dynamic Theme Styling
  const bgTheme = isDark ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900';
  const sectionBgTheme = isDark ? 'bg-gray-900/40' : 'bg-white shadow-sm';
  const cardTheme = isDark ? 'bg-gray-900/90 border border-gray-800' : 'bg-white border border-slate-100 shadow-md';
  const secondaryBtnTheme = isDark ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700';

  return (
    <div className={`min-h-screen ${bgTheme} transition-colors duration-300 overflow-x-hidden font-sans`}>
      <NavBar />

      {/* Hero Section */}
      <section className="relative h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80"
            alt="Beautiful Scenic Northern Pakistan Landscape"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin-slow" />
            Empowering Your Wanderlust
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            Discover Pakistan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Like Never Before
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed text-slate-200 font-medium">
            Plan trips, scan historical monuments, and receive AI-powered travel guidance tailored to your interests.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/recommendations')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 shadow-lg shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Start Exploring
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/planner')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white hover:bg-white/10 text-white font-bold px-8 py-4 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Plan My Trip
            </button>
          </div>
        </div>
      </section>

      {/* Quick Start Journey Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-2">How it works</p>
          <h2 className="text-3xl font-serif font-bold">Start Your Journey</h2>
          <div className="w-12 h-1 bg-emerald-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Process Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector Line for desktop */}
          <div className="hidden md:block absolute top-[40px] left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-emerald-500/20 z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl border-4 border-white dark:border-gray-950 shadow-md group-hover:scale-110 transition duration-200">
              1
            </div>
            <h3 className="mt-4 font-bold text-lg">Explore Destinations</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
              Discover beautiful spots across all provinces of Pakistan.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl border-4 border-white dark:border-gray-950 shadow-md group-hover:scale-110 transition duration-200">
              2
            </div>
            <h3 className="mt-4 font-bold text-lg">Get AI Recommendations</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
              Receive smart recommendations personalized to weather & season.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl border-4 border-white dark:border-gray-950 shadow-md group-hover:scale-110 transition duration-200">
              3
            </div>
            <h3 className="mt-4 font-bold text-lg">Plan Your Trip</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
              Generate a custom, day-by-day itinerary tailored to budget and days.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl border-4 border-white dark:border-gray-950 shadow-md group-hover:scale-110 transition duration-200">
              4
            </div>
            <h3 className="mt-4 font-bold text-lg">Book & Travel</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
              Book ticket packages and explore historical sites with our AR guide.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Discovery Flow (Replacing Current Action Buttons) */}
      <section className={`py-16 px-6 ${sectionBgTheme}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-2">Our Features</p>
            <h2 className="text-3xl font-serif font-bold">Plan in Your Way</h2>
          </div>

          {/* Swipeable Feature Cards - Responsive Flow */}
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-4 md:overflow-x-visible md:pb-0">
            {journeyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(feat.to)}
                  className={`snap-start min-w-[280px] md:min-w-0 flex flex-col justify-between p-6 rounded-2xl cursor-pointer hover:-translate-y-2 transition-all duration-300 relative group ${cardTheme} hover:shadow-xl`}
                >
                  <div>
                    {/* Top Row: Icon and Step Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feat.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-650 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 font-bold text-xl flex items-center gap-1">
                      {feat.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-455">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800 flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    Get Started 
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* "Why Use Ghoomo Pakistan" Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-2">Why Choose Us</p>
          <h2 className="text-3xl font-serif font-bold">Why Use Ghoomo Pakistan</h2>
          <div className="w-12 h-1 bg-emerald-500 mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyShowcases.map((show, idx) => {
            const Icon = show.icon;
            return (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl flex flex-col justify-between transition border ${cardTheme}`}
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{show.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {show.description}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(show.to)}
                  className={`mt-auto inline-flex items-center gap-1 self-start text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline group`}
                >
                  Learn More
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* "Recommended For You" Section */}
      <section className={`py-20 px-6 ${sectionBgTheme}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between text-center md:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-2">Curated for You</p>
              <h2 className="text-3xl font-serif font-bold">Recommended For You</h2>
            </div>
            <button
              onClick={() => navigate('/recommendations')}
              className="inline-flex items-center gap-2 self-center md:self-end rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 shadow transition hover:scale-105 active:scale-95"
            >
              Explore More Recommendations
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg ${cardTheme}`}
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-black/30 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                        {rec.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold">{rec.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => navigate(rec.path)}
                    className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1 ${secondaryBtnTheme}`}
                  >
                    Explore
                    <ArrowRightCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Premium Footer */}
      <footer className={`border-t py-12 px-6 ${isDark ? 'border-gray-800 bg-gray-950 text-slate-500' : 'border-slate-100 bg-white text-slate-400'} text-center text-sm`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif font-bold text-emerald-600">Ghoomo Pakistan</p>
          <p className="text-xs">&copy; {new Date().getFullYear()} Ghoomo Pakistan. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <Link to="/recommendations" className="hover:underline">Explore</Link>
            <Link to="/planner" className="hover:underline">Plan</Link>
            <Link to="/ar" className="hover:underline">AR Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
