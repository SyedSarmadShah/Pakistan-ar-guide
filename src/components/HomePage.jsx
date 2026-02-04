import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MessageCircle, MapPin, Sparkles, Navigation, Play, X } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import NavBar from './NavBar';

const HomePage = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const { isDark, toggleDarkMode } = useDarkMode();

  const places = [
    {
      name: "Badshahi Mosque",
      image: "/images/badshahi-mosque.jpg",
      description: "Iconic red sandstone mosque in Lahore"
    },
    {
      name: "Mohenjo-daro",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Mohenjo-daro-2010.jpg/800px-Mohenjo-daro-2010.jpg",
      description: "Ancient Indus Valley Civilization site"
    },
    {
      name: "Taxila",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Dharmarajika_stupa_02.jpg/800px-Dharmarajika_stupa_02.jpg",
      description: "Historic Buddhist learning center"
    }
  ];

  const videos = [
    { id: 1, title: "Hunza Valley", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", desc: "Mountains" },
    { id: 2, title: "Thar Desert", thumbnail: "https://images.unsplash.com/photo-1509919243529-f2a5ad6bdfad?w=400&h=300&fit=crop", desc: "Deserts" },
    { id: 3, title: "Arabian Sea", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", desc: "Beaches" },
    { id: 4, title: "Northern Forests", thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop", desc: "Forests" }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-black'} overflow-x-hidden`}>
      {/* Navigation */}
      <NavBar />

      {/* Hero Section with Video Background */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover" poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop">
            <source src="https://cdn.pixabay.com/video/2021/03/11/70843-532282659_large.mp4" type="video/mp4" />
          </video>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-black/50'}`}></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <div className="inline-block mb-6">
            <Sparkles className="w-16 h-16 text-yellow-300" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Discover Pakistan
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-12 drop-shadow-md">
            Explore Heritage • Capture Moments • Chat with AI
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/ar-guide" className={`${isDark ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105`}>
              🎥 Start AR Guide
            </Link>
            <Link to="/recommendations" className={`${isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105`}>
              🗺️ Explore Places
            </Link>
            <Link to="/chatbot" className={`${isDark ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'} text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105`}>
              💬 Chat with AI
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="text-white text-center opacity-70">
            <p className="text-sm mb-2">Scroll Down</p>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Places */}
      <section id="places" className={`py-20 px-6 ${isDark ? 'bg-gray-800' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-4 text-center">Featured Destinations</h2>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-400'} text-center mb-16`}>Three iconic places of Pakistan</p>

          <div className="grid md:grid-cols-3 gap-8">
            {places.map((place, idx) => (
              <Link key={idx} to="/ar-guide" className="group rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`relative h-64 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-800'}`}>
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className={`bg-gradient-to-b ${isDark ? 'from-gray-700 to-gray-800' : 'from-gray-800 to-gray-900'} p-6`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{place.name}</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-400'} mb-4`}>{place.description}</p>
                  <div className="text-emerald-400 font-bold">Scan in AR →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Video Gallery */}
      <section id="videos" className={`py-20 px-6 ${isDark ? 'bg-gray-900' : 'bg-black'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-4 text-center">Pakistan's Beauty</h2>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-400'} text-center mb-16`}>Stunning landscapes & experiences</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div key={video.id} onClick={() => setActiveVideo(video.id)} className="group rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div className={`relative h-48 ${isDark ? 'bg-gray-700' : 'bg-gray-800'} overflow-hidden`}>
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} p-4`}>
                  <h3 className="text-lg font-bold text-white mb-1">{video.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>{video.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-20 px-6 ${isDark ? 'bg-gray-800' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-16 text-center">Our Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/ar" className="group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AR Monument Guide</h3>
                <p className="text-white/90 mb-6">Point your camera and discover monument stories with AI recognition</p>
                <div className="flex items-center text-white font-bold group-hover:gap-3 gap-2 transition-all">
                  Start Scanning <Navigation className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link to="/recommendations" className="group">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Smart Recommendations</h3>
                <p className="text-white/90 mb-6">Get personalized travel suggestions with real-time weather and ratings</p>
                <div className="flex items-center text-white font-bold group-hover:gap-3 gap-2 transition-all">
                  Explore Places <Navigation className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link to="/chat" className="group">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI Travel Companion</h3>
                <p className="text-white/90 mb-6">Chat with our AI assistant for instant travel advice</p>
                <div className="flex items-center text-white font-bold group-hover:gap-3 gap-2 transition-all">
                  Start Chatting <Navigation className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`py-16 px-6 ${isDark ? 'bg-gradient-to-r from-emerald-800 to-teal-700' : 'bg-gradient-to-r from-emerald-700 to-teal-600'}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div><div className="text-5xl font-bold text-white mb-2">50+</div><div className="text-white/80 text-lg">Heritage Sites</div></div>
          <div><div className="text-5xl font-bold text-white mb-2">100+</div><div className="text-white/80 text-lg">Destinations</div></div>
          <div><div className="text-5xl font-bold text-white mb-2">24/7</div><div className="text-white/80 text-lg">AI Support</div></div>
          <div><div className="text-5xl font-bold text-white mb-2">∞</div><div className="text-white/80 text-lg">Possibilities</div></div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-gray-900' : 'bg-black'} text-gray-400 py-12 px-6 text-center`}>
        <p className="mb-2">© 2026 Pakistan Explorer. Discover Pakistan's Heritage.</p>
        <p className="text-sm">Built with ❤️ for tourism & education</p>
      </footer>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <button onClick={() => setActiveVideo(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition">
              <X className="w-8 h-8" />
            </button>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} rounded-2xl overflow-hidden`}>
              <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/video_id_${activeVideo}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
