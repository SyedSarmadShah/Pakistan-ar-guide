import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Compass, Info, MapPin, MessageCircle, Sparkles, Ticket } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import NavBar from './NavBar';

const HomePage = () => {
  const { isDark } = useDarkMode();

  const featuredPlaces = [
    {
      name: 'Badshahi Mosque',
      image: '/images/badshahi-mosque.jpg',
      location: 'Lahore',
      description: 'Mughal grandeur, red sandstone, and a skyline-defining courtyard.'
    },
    {
      name: 'Mohenjo-daro',
      image: '/images/mohenjo-daro.jpg',
      location: 'Sindh',
      description: 'One of the world’s earliest urban settlements, still quietly powerful.'
    },
    {
      name: 'Taxila',
      image: '/images/taxila.jpg',
      location: 'Punjab',
      description: 'Ancient learning, sacred ruins, and layered Buddhist heritage.'
    },
    {
      name: 'Hunza Valley',
      image: 'https://images.unsplash.com/photo-1518076295597-9f1b6a2f6d57?auto=format&fit=crop&w=1200&q=80',
      location: 'Gilgit-Baltistan',
      description: 'Glacial water, terraced villages, and dramatic mountain walls.'
    },
    {
      name: 'Skardu',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80',
      location: 'Baltistan',
      description: 'A gateway to alpine lakes, deserts, and unforgettable road trips.'
    }
  ];

  const heroActions = [
    { label: 'Top Tours', icon: Compass, to: '/recommendations' },
    { label: 'Tickets', icon: Ticket, to: '/checkout' },
    { label: 'Travel Info', icon: Info, to: '/recommendations' },
    { label: 'Places to Go', icon: MapPin, onClick: true }
  ];

  const sectionBg = isDark ? 'bg-slate-950 text-white' : 'bg-[#f3ede4] text-slate-900';
  const panelBg = isDark ? 'bg-slate-900/85 border border-white/10' : 'bg-white/90 border border-white/60';
  const quickButtonClass = isDark
    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
    : 'bg-white text-slate-800 hover:-translate-y-0.5 hover:shadow-xl border border-black/5';
  const quickButtonText = isDark ? 'text-white/90' : 'text-slate-600';
  const ctaCardClass = isDark
    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
    : 'bg-white text-slate-900 hover:-translate-y-1 hover:shadow-2xl border border-black/5';

  const scrollToPlaces = () => {
    const section = document.getElementById('places');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen ${sectionBg} overflow-x-hidden`}>
      <NavBar />

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80"
            alt="Scenic Pakistan landscape"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),linear-gradient(180deg,rgba(22,28,36,0.16)_0%,rgba(22,28,36,0.62)_100%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <div className="max-w-3xl text-center text-white lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Pakistan travel guide
            </div>
            <h1 className="font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
              Welcome to Pakistan
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/88 sm:text-lg lg:text-xl">
              Explore heritage, mountains, and living culture through a cleaner, more editorial travel experience.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {heroActions.map((action) => {
                const Icon = action.icon;

                if (action.onClick) {
                  return (
                    <button
                      key={action.label}
                      onClick={scrollToPlaces}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${quickButtonClass}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{action.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${quickButtonClass}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-white/75 lg:justify-start">
              <span className="inline-flex items-center gap-2">
                <Camera className="h-4 w-4" />
                AR monument recognition
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                AI travel chat
              </span>
              <span className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Curated destinations
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="places" className="border-t border-black/5 bg-white px-4 py-14 text-slate-900 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">Featured destinations</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Places to go
              </h2>
            </div>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Find out more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {featuredPlaces.map((place) => (
              <Link
                key={place.name}
                to="/ar"
                className={`group overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.14)] ${panelBg}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">{place.location}</p>
                    <h3 className="mt-2 text-xl font-bold leading-tight">{place.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/85">{place.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${isDark ? 'bg-slate-950' : 'bg-[#f3ede4]'} px-4 py-14 sm:px-6 lg:px-8`}>
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <Link to="/ar" className={`rounded-3xl p-6 transition ${ctaCardClass}`}>
            <Camera className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold">AR monument guide</h3>
            <p className={`mt-2 text-sm leading-6 ${quickButtonText}`}>Point your camera at a landmark and get instant context.</p>
          </Link>
          <Link to="/recommendations" className={`rounded-3xl p-6 transition ${ctaCardClass}`}>
            <Compass className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold">Smart recommendations</h3>
            <p className={`mt-2 text-sm leading-6 ${quickButtonText}`}>Browse personalized destinations with clean travel cues.</p>
          </Link>
          <Link to="/chat" className={`rounded-3xl p-6 transition ${ctaCardClass}`}>
            <MessageCircle className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold">AI travel companion</h3>
            <p className={`mt-2 text-sm leading-6 ${quickButtonText}`}>Ask for routes, history, and what to do next.</p>
          </Link>
        </div>
      </section>

      <footer className={`border-t border-black/5 px-4 py-8 text-center text-sm ${isDark ? 'bg-slate-950 text-white/60' : 'bg-white text-slate-500'}`}>
        Pakistan AR Guide
      </footer>
    </div>
  );
};

export default HomePage;
