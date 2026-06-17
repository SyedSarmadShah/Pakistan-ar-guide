import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { generateItinerary, exportItineraryJSON, exportItineraryICS } from '../utils/itinerary';
import { getUserProfile } from '../utils/userProfile';
import { MapPin, Calendar, DollarSign, Heart, Loader2, Save, Download, Clock, MapPinIcon, ChevronDown } from 'lucide-react';

const DATA_CSV = '/recommendation and chatbot/places_dataset.csv';
const STORAGE_KEY = 'savedItineraries_v1';

const POPULAR_DESTINATIONS = [
  { id: 'hunza', name: 'Hunza', description: 'Stunning mountain views' },
  { id: 'skardu', name: 'Skardu', description: 'Gateway to glaciers' },
  { id: 'lahore', name: 'Lahore', description: 'Cultural heart of Punjab' },
  { id: 'islamabad', name: 'Islamabad', description: 'Modern capital city' },
  { id: 'naran-kaghan', name: 'Naran Kaghan', description: 'Alpine meadows' },
  { id: 'murree', name: 'Murree', description: 'Hill station paradise' },
  { id: 'anywhere', name: 'Anywhere in Pakistan', description: 'Surprise me!' },
];

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Economy', emoji: '💰' },
  { value: 'medium', label: 'Standard', emoji: '💳' },
  { value: 'high', label: 'Luxury', emoji: '✨' },
];

const TRAVEL_STYLES = [
  'Adventure', 'Culture', 'History', 'Nature', 'Family', 'Photography', 'Food', 'Religious'
];

const parseSimpleCSV = (csv) => {
  const lines = csv.replace(/\r/g, '').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].replace(/^"|"$/g, '').split(',').map(h => h.replace(/^"|"$/g,'').trim());
  return lines.slice(1).map(line => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^\"]*$)/).map(c => c.replace(/^"|"$/g,'').trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = cols[i] || '');
    return {
      place: obj.place_name || obj.place || '',
      city: obj.city || '',
      province: obj.province || '',
      category: obj.category || '',
      season: obj.best_season || obj.season || '',
      rating: parseFloat(obj.rating) || 0,
      lat: obj.lat ? parseFloat(obj.lat) : null,
      lon: obj.lon ? parseFloat(obj.lon) : null,
      budgetLevel: obj.budget_level || obj.budgetLevel || '',
    };
  });
};

const TripPlanner = () => {
  const [days, setDays] = useState(3);
  const [budgetLevel, setBudgetLevel] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [travelStyles, setTravelStyles] = useState([]);
  const [perDayCapacity, setPerDayCapacity] = useState(3);
  const [defaultDurationHours, setDefaultDurationHours] = useState(2);
  const [places, setPlaces] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [saved, setSaved] = useState([]);
  const [title, setTitle] = useState('My Trip');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDestinationMenu, setShowDestinationMenu] = useState(false);

  useEffect(() => {
    fetch(DATA_CSV).then(r => r.text()).then(txt => setPlaces(parseSimpleCSV(txt))).catch(()=>setPlaces([]));
    const s = localStorage.getItem(STORAGE_KEY);
    setSaved(s ? JSON.parse(s) : []);
  }, []);

  const generate = () => {
    setIsLoading(true);
    // Simulate processing delay for better UX
    setTimeout(() => {
      const profile = getUserProfile();
      const ctx = { userLocation: selectedDestination || null, currentSeason: '' };
      const opts = { days, budgetLevel, travelStyle: travelStyles.join(', '), perDayCapacity, defaultDurationHours };
      const result = generateItinerary(opts, places, profile, ctx);
      setItinerary(result);

      if (result && result.meta && result.meta.fallbackUsed) {
        setStatusMessage('No places matched the filters; showing top recommendations instead.');
      } else if (result && result.meta && result.meta.sourceCount === 0) {
        setStatusMessage('No places available for the selected filters.');
      } else {
        setStatusMessage('');
      }
      setIsLoading(false);
    }, 1500);
  };

  const saveItinerary = () => {
    if (!itinerary) return;
    const next = [{ id: `itin-${Date.now()}`, title: title || 'Untitled', createdAt: new Date().toISOString(), itinerary }, ...saved];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(next);
  };

  const exportJSON = () => {
    if (!itinerary) return;
    exportItineraryJSON(itinerary, `${(title||'itinerary').replace(/\s+/g,'_')}.json`);
  };

  const exportICS = () => {
    if (!itinerary) return;
    exportItineraryICS(itinerary, `${(title||'itinerary').replace(/\s+/g,'_')}.ics`);
  };

  const toggleTravelStyle = (style) => {
    setTravelStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop)',
        }}></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">Plan Your Perfect Pakistan Journey</h1>
          <p className="text-xl text-emerald-50 drop-shadow-md max-w-2xl">
            AI-powered itinerary generation based on budget, interests and trip duration.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                Customize Your Adventure
              </h2>

              {/* Destination Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Select Destination</label>
                <div className="relative">
                  <button
                    onClick={() => setShowDestinationMenu(!showDestinationMenu)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-emerald-400 transition"
                  >
                    <span className="text-gray-700 font-medium">
                      {selectedDestination 
                        ? POPULAR_DESTINATIONS.find(d => d.id === selectedDestination)?.name 
                        : 'Choose a destination...'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {showDestinationMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-200 rounded-lg shadow-xl z-50">
                      {POPULAR_DESTINATIONS.map(dest => (
                        <button
                          key={dest.id}
                          onClick={() => {
                            setSelectedDestination(dest.id);
                            setShowDestinationMenu(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-emerald-50 transition border-b last:border-b-0 ${
                            selectedDestination === dest.id ? 'bg-emerald-100' : ''
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{dest.name}</div>
                          <div className="text-sm text-gray-500">{dest.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Days</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDays(Math.max(1, days - 1))}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="flex-1 text-center text-xl font-bold text-emerald-600 border-2 border-gray-200 rounded-lg p-2"
                    />
                    <button
                      onClick={() => setDays(days + 1)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Trip Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Northern Adventure"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Budget Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Budget Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {BUDGET_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setBudgetLevel(option.value)}
                      className={`p-4 rounded-lg border-2 transition font-semibold text-center ${
                        budgetLevel === option.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.emoji}</div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Styles Multi-select */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Travel Interests (Select Multiple)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TRAVEL_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => toggleTravelStyle(style)}
                      className={`px-4 py-2 rounded-full font-medium transition border-2 ${
                        travelStyles.includes(style)
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-emerald-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Places per Day</label>
                  <input
                    type="number"
                    min={1}
                    value={perDayCapacity}
                    onChange={(e) => setPerDayCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Default Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    value={defaultDurationHours}
                    onChange={(e) => setDefaultDurationHours(Number(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                  {statusMessage}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generate}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-70 text-white font-bold text-lg rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Rahbar AI is planning your journey...
                  </>
                ) : (
                  <>
                    Generate Smart Itinerary
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Map Placeholder & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map Container */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-96">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">Map Preview</p>
                  <p className="text-sm text-gray-500 mt-2">Generate an itinerary to see</p>
                  <p className="text-sm text-gray-500">the route on the map</p>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                Your Preferences
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">📍</span>
                  <span className="text-gray-700">{selectedDestination ? POPULAR_DESTINATIONS.find(d => d.id === selectedDestination)?.name : 'No destination selected'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">⏱️</span>
                  <span className="text-gray-700">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">💰</span>
                  <span className="text-gray-700">{budgetLevel ? BUDGET_OPTIONS.find(b => b.value === budgetLevel)?.label : 'Any budget'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">🎯</span>
                  <span className="text-gray-700">{travelStyles.length > 0 ? travelStyles.join(', ') : 'No interests selected'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {itinerary && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-600" />
              Your Personalized Itinerary
            </h2>
            <p className="text-gray-600 mb-8">Generated by Rahbar AI • {itinerary.days.length} days • {itinerary.days.reduce((sum, d) => sum + d.items.length, 0)} destinations</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Itinerary Cards */}
              <div className="lg:col-span-2 space-y-4">
                {itinerary.days.map((d, dayIdx) => (
                  <div key={d.day} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-emerald-600">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                      <h3 className="font-bold text-xl text-gray-900">Day {d.day}</h3>
                      <p className="text-sm text-gray-600 mt-1">{d.items.length} stop{d.items.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {d.items.map((it, idx) => (
                        <div key={idx} className="flex gap-4 pb-4 last:pb-0 border-b border-gray-100 last:border-b-0">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            {idx < d.items.length - 1 && <div className="w-1 h-8 bg-emerald-200 mt-2"></div>}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{it.place}</h4>
                            <p className="text-sm text-gray-600 mt-1">📍 {it.city}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {it.estDurationHours}h
                              </span>
                              <span>⭐ Score: {Math.round(it.recommendedScore || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="space-y-4">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="font-bold text-lg mb-4">Trip Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-emerald-100 text-sm">Total Days</p>
                      <p className="text-2xl font-bold">{itinerary.days.length}</p>
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">Total Destinations</p>
                      <p className="text-2xl font-bold">{itinerary.days.reduce((sum, d) => sum + d.items.length, 0)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">Estimated Duration</p>
                      <p className="text-2xl font-bold">{itinerary.days.reduce((sum, d) => sum + d.items.reduce((s, i) => s + (i.estDurationHours || 0), 0), 0)}h</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={saveItinerary}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    <Save className="w-5 h-5" />
                    Save Itinerary
                  </button>
                  <button
                    onClick={exportJSON}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg transition"
                  >
                    <Download className="w-5 h-5" />
                    Export JSON
                  </button>
                  <button
                    onClick={exportICS}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition"
                  >
                    <Download className="w-5 h-5" />
                    Export ICS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Itineraries Section */}
        {saved.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Heart className="w-8 h-8 text-emerald-600" />
              Your Saved Adventures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map(s => (
                <div key={s.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border-t-4 border-emerald-600">
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Saved {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{s.itinerary.days.length} days • {s.itinerary.days.reduce((sum, d) => sum + d.items.length, 0)} destinations</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportItineraryJSON(s.itinerary, `${s.title.replace(/\s+/g,'_')}.json`)}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition text-sm"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => exportItineraryICS(s.itinerary, `${s.title.replace(/\s+/g,'_')}.ics`)}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition text-sm"
                      >
                        ICS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
