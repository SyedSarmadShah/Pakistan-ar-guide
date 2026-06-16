import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Cloud, AlertTriangle, Heart, ChevronDown, LocateFixed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GridSkeleton } from './LoadingSkeleton';
import { useDarkMode } from '../context/DarkModeContext';
import NavBar from './NavBar';
import { getUserProfile, updateUserProfile } from '../utils/userProfile';
import { trackClick, trackFavorite, trackSearch } from '../utils/tracking';
import { rankPlaces } from '../utils/recommendationEngine';
import { getCurrentSeason, getUserLocation, mapWeatherToType } from '../utils/context';
import { getTrendingScore } from '../utils/trending';
import { getPlaceImage } from '../utils/imageMapper';

const Recommendations = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [tourismData, setTourismData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [weatherCache, setWeatherCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [weatherType, setWeatherType] = useState('normal');
  const [contextCity, setContextCity] = useState('Islamabad');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Locating...');
  
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '5989bfd5387805e4603d064014e6032f';

  const cityMap = {
    "Karimabad": "Hunza", "Hunza": "Hunza", "Skardu": "Skardu",
    "Naltar": "Gilgit", "Nagar": "Gilgit", "Gojal": "Hunza",
    "Mingora": "Mingora", "Swat": "Mingora", "Naran": "Naran",
    "Kalam": "Kalam", "Chitral": "Chitral", "Lahore": "Lahore",
    "Larkana": "Larkana", "Thatta": "Thatta", "Ziarat": "Ziarat",
    "Islamabad": "Islamabad", "Taxila": "Taxila", "Murree": "Murree"
  };

  const cityCoordinates = {
    Lahore: { lat: 31.5204, lon: 74.3587 },
    Islamabad: { lat: 33.6844, lon: 73.0479 },
    Karachi: { lat: 24.8607, lon: 67.0011 },
    Skardu: { lat: 35.2971, lon: 75.6337 },
    Karimabad: { lat: 36.3167, lon: 74.65 },
    Hunza: { lat: 36.3167, lon: 74.65 },
    Gilgit: { lat: 35.9208, lon: 74.3144 },
    Naltar: { lat: 36.1333, lon: 74.1833 },
    Nagar: { lat: 36.32, lon: 74.68 },
    Gojal: { lat: 36.85, lon: 74.85 },
    Mingora: { lat: 34.7717, lon: 72.36 },
    Swat: { lat: 35.2227, lon: 72.4258 },
    Naran: { lat: 34.9083, lon: 73.6497 },
    Kalam: { lat: 35.4902, lon: 72.5804 },
    Chitral: { lat: 35.851, lon: 71.7864 },
    Larkana: { lat: 27.559, lon: 68.212 },
    Thatta: { lat: 24.7475, lon: 67.9235 },
    Ziarat: { lat: 30.3824, lon: 67.7256 },
    Taxila: { lat: 33.745, lon: 72.7875 },
    Murree: { lat: 33.9062, lon: 73.3903 },
    Jhelum: { lat: 32.9425, lon: 73.7257 },
    Chakwal: { lat: 32.93, lon: 72.85 },
    Sheikhupura: { lat: 31.7167, lon: 73.9833 },
    Bahawalpur: { lat: 29.3956, lon: 71.6836 },
    Peshawar: { lat: 34.0151, lon: 71.5249 },
    Mardan: { lat: 34.1989, lon: 72.0401 },
    'Kaghan Valley': { lat: 34.74, lon: 73.53 },
    Diamer: { lat: 35.3367, lon: 73.7322 },
    Haripur: { lat: 33.9946, lon: 72.9106 },
    Abbottabad: { lat: 34.1688, lon: 73.2215 },
    Rawalakot: { lat: 33.8578, lon: 73.7604 },
    Khushab: { lat: 32.2967, lon: 72.3525 },
  };

  useEffect(() => {
    loadTourismData();
    loadFavorites();
    initUserContext();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, provinceFilter, seasonFilter, categoryFilter, ratingFilter, budgetFilter, showFavoritesOnly, tourismData, favorites, weatherType, userLocation]);

  useEffect(() => {
    detectContextWeather();
  }, [contextCity, userLocation]);

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    const legacy = saved ? JSON.parse(saved) : [];
    const profile = getUserProfile();

    // Keep backward compatibility with old favorites format.
    if (profile.favorites.length > 0 && legacy.length === 0) {
      const fromProfile = profile.favorites.map((name) => ({ place: name }));
      localStorage.setItem('favorites', JSON.stringify(fromProfile));
      setFavorites(fromProfile);
      return;
    }

    setFavorites(legacy);
  };

  const toggleFavorite = (place) => {
    const saved = localStorage.getItem('favorites');
    let favList = saved ? JSON.parse(saved) : [];
    
    const exists = favList.some(f => f.place === place.place);
    if (exists) {
      favList = favList.filter(f => f.place !== place.place);
    } else {
      favList.push(place);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favList));
    setFavorites(favList);
    if (!exists) {
      trackFavorite(place);
    }

    const profile = getUserProfile();
    updateUserProfile({ favorites: favList.map((f) => f.place || f.name).filter(Boolean), likedCategories: profile.likedCategories });
    window.dispatchEvent(new Event('storage'));
  };

  const isFavorite = (placeName) => {
    return favorites.some(f => f.place === placeName);
  };

  const loadTourismData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/recommendation%20and%20chatbot/places_dataset.csv');
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
      setTourismData(parsed);
      
      // Extract unique provinces and seasons
      const uniqueProvinces = [...new Set(parsed.map(d => d.province))];
      const uniqueSeasons = [...new Set(parsed.map(d => d.season))];
      const uniqueCategories = [...new Set(parsed.map(d => d.category))];
      const uniqueBudgets = [...new Set(parsed.map(d => d.budgetLevel).filter(Boolean))];
      setProvinces(uniqueProvinces);
      setSeasons(uniqueSeasons);
      setCategories(uniqueCategories);
      setBudgets(uniqueBudgets);
    } catch (error) {
      console.error('Failed to load tourism data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csv) => {
    const parseLine = (line) => {
      const values = [];
      let current = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
          current += '"';
          i += 1;
          continue;
        }

        if (char === '"') {
          insideQuotes = !insideQuotes;
          continue;
        }

        if (char === ',' && !insideQuotes) {
          values.push(current.trim());
          current = '';
          continue;
        }

        current += char;
      }

      values.push(current.trim());
      return values;
    };

    const lines = csv.replace(/\r/g, '').trim().split('\n');
    const headers = parseLine(lines[0]).map((header) => header.replace(/^"|"$/g, '').trim());

    return lines.slice(1).map((line) => {
      const row = parseLine(line);
      const entry = {};

      headers.forEach((header, index) => {
        entry[header] = (row[index] || '').replace(/^"|"$/g, '').trim();
      });

      return {
        place: entry.place_name || entry.place || '',
        city: entry.city || '',
        province: entry.province || '',
        category: entry.category || '',
        season: entry.best_season || entry.season || '',
        rating: parseFloat(entry.rating) || 0,
        lat: entry.lat ? parseFloat(entry.lat) : null,
        lon: entry.lon ? parseFloat(entry.lon) : null,
        popularity: entry.popularity ? parseInt(entry.popularity, 10) : 0,
        weatherTag: entry.weather_tag || entry.weatherTag || '',
        budgetLevel: entry.budget_level || entry.budgetLevel || '',
        tripDays: entry.trip_days || entry.tripDays || '',
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...tourismData];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.place.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    if (provinceFilter) {
      filtered = filtered.filter(item => item.province === provinceFilter);
    }
    
    if (seasonFilter) {
      filtered = filtered.filter(item => item.season === seasonFilter);
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (budgetFilter) {
      filtered = filtered.filter(item => item.budgetLevel === budgetFilter);
    }
    
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(item => item.rating >= minRating);
    }
    
    if (showFavoritesOnly) {
      filtered = filtered.filter(item => isFavorite(item.place));
    }

    const ranked = rankPlaces(filtered, getUserProfile(), {
      currentSeason: getCurrentSeason(),
      weatherType,
      userLocation,
      cityCoordinates,
    });

    setFilteredData(ranked);
  };

  const initUserContext = async () => {
    const coords = await getUserLocation();
    if (coords) {
      setUserLocation(coords);
      setLocationStatus('Live location enabled');
    } else {
      setLocationStatus('Using selected city fallback');
      setUserLocation(cityCoordinates[contextCity] || null);
    }
  };

  const detectContextWeather = async () => {
    const fallbackCity = contextCity || 'Islamabad';

    try {
      const response = userLocation
        ? await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&units=metric&appid=${WEATHER_API_KEY}`
          )
        : await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${fallbackCity},PK&units=metric&appid=${WEATHER_API_KEY}`
          );
      const data = await response.json();
      const main = data?.weather?.[0]?.main || '';
      setWeatherType(mapWeatherToType(main));
    } catch (error) {
      setWeatherType('normal');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setProvinceFilter('');
    setSeasonFilter('');
    setCategoryFilter('');
    setRatingFilter('');
    setBudgetFilter('');
    setShowFavoritesOnly(false);
  };

  const getWeather = async (city) => {
    if (weatherCache[city]) return weatherCache[city];
    
    const apiCity = cityMap[city] || city;
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${apiCity},PK&units=metric&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();
      
      if (!data.main) {
        return { weather: 'N/A', advice: 'Unknown', icon: '☁️' };
      }
      
      const temp = data.main.temp;
      const condition = data.weather[0].main;
      let advice = '✅ Good to Visit';
      let icon = '☀️';
      
      if (condition.includes('Rain')) {
        advice = '⚠️ Rain – Travel Carefully';
        icon = '🌧️';
      }
      if (condition.includes('Snow')) {
        advice = '❄️ Snowfall – Avoid Roads';
        icon = '❄️';
      }
      if (temp < 0) {
        advice = '🥶 Extreme Cold – Avoid Visit';
        icon = '🥶';
      }
      if (temp > 40) {
        advice = '🔥 Extreme Heat – Avoid Visit';
        icon = '🔥';
      }
      
      const result = {
        weather: `${condition}, ${temp.toFixed(1)}°C`,
        advice,
        icon
      };
      
      setWeatherCache(prev => ({ ...prev, [city]: result }));
      return result;
    } catch (error) {
      return { weather: 'Unavailable', advice: 'Unknown', icon: '☁️' };
    }
  };

  const PlaceCard = ({ place }) => {
    const [weather, setWeather] = useState(null);
    
    useEffect(() => {
      getWeather(place.city).then(setWeather);
    }, [place.city]);
    
    const placeImage = getPlaceImage(place.place);
    const [showDetails, setShowDetails] = useState(false);
    
    // Determine recommendation quality indicator
    const getRatingStars = (score) => {
      if (score >= 80) return '★★★★★';
      if (score >= 70) return '★★★★';
      if (score >= 60) return '★★★';
      if (score >= 50) return '★★';
      return '★';
    };

    // Only show "Popular" if trending high
    const showPopularBadge = getTrendingScore(place.place) >= 3;
    
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden`}>
        <div className={`relative h-48 overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-800'}`}>
          <img src={placeImage} alt={place.place} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <button
            onClick={() => toggleFavorite(place)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 group"
            aria-label={isFavorite(place.place) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite(place.place)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-700 group-hover:text-red-500'
              }`}
            />
          </button>
        </div>
        
        <div className="p-5">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>{place.place}</h3>
          
          {/* Quick signals: Rating | Budget | Distance | Popular */}
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <div className={`text-xs font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
              ⭐ {place.rating}
            </div>
            {place.budgetLevel && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                {place.budgetLevel}
              </span>
            )}
            {typeof place.distanceKm === 'number' && (
              <span className={`text-xs font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                📍 {place.distanceKm}km
              </span>
            )}
            {showPopularBadge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                🔥 Popular
              </span>
            )}
          </div>
          
          {/* Compact essential info */}
          <div className="space-y-1.5 mb-3">
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{place.city}</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">{place.category}</span>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Best: {place.season}</span>
            </div>
            {place.tripDays && (
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ⏱️ {place.tripDays} days
              </div>
            )}
          </div>

          {/* Weather info collapsed under details toggle */}
          {weather && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-full text-left text-xs p-2 rounded mb-3 transition ${
                showDetails
                  ? isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'
                  : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {showDetails ? '▼ Weather & Details' : '▶ Weather & Details'}
            </button>
          )}
          
          {showDetails && weather && (
            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-3 mb-3 text-xs space-y-2`}>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{weather.weather}</span>
              </div>
              <div className={`font-medium ${isDark ? 'text-gray-200 bg-blue-900/30' : 'text-gray-700 bg-blue-50'} p-2 rounded`}>
                {weather.advice}
              </div>
              {Array.isArray(place.scoreBreakdown) && place.scoreBreakdown.length > 0 && (
                <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  <strong>Why recommended:</strong><br/>{place.scoreBreakdown.slice(0, 2).join(' • ')}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              trackClick(place);
              navigate('/checkout');
            }}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition ${isDark ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} overflow-x-hidden pb-12`}>
      <NavBar />
      
      {/* Filters Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-16 z-40`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'} flex items-center gap-2 mb-4`}>
            <MapPin className="w-7 h-7" />
            Travel Recommendations
          </h1>
          
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search places, cities..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 3) {
                      trackSearch(e.target.value);
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50'} rounded-lg transition`}
              >
                <Filter className="w-5 h-5" />
                {showFilters ? 'Hide' : 'Show'} Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                {(provinceFilter || seasonFilter || categoryFilter || ratingFilter || budgetFilter || showFavoritesOnly) && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                    {[provinceFilter, seasonFilter, categoryFilter, ratingFilter, budgetFilter, showFavoritesOnly ? '1' : ''].filter(Boolean).length} active
                  </span>
                )}
              </button>
              
              {(searchQuery || provinceFilter || seasonFilter || categoryFilter || ratingFilter || showFavoritesOnly) && (
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2 ${isDark ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition`}
                >
                  Clear All
                </button>
              )}
            </div>

            {showFilters && (
            <>
            <div className={`grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
                <LocateFixed className="w-4 h-4" />
                <span className="text-sm">{locationStatus}</span>
              </div>

              <select
                value={contextCity}
                onChange={(e) => {
                  const nextCity = e.target.value;
                  setContextCity(nextCity);
                  // Manual city takes over when user location is unavailable.
                  if (!userLocation) {
                    setUserLocation(cityCoordinates[nextCity] || null);
                  }
                }}
                className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              >
                {Object.keys(cityCoordinates).sort().map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Panel */}
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <select
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value="">All Provinces</option>
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  
                  <select
                    value={seasonFilter}
                    onChange={(e) => setSeasonFilter(e.target.value)}
                    className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value="">All Seasons</option>
                    {seasons.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value="">All Ratings</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>

                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value="">All Budgets</option>
                    {budgets.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className={`${isDark ? 'text-white' : 'text-gray-700'} font-medium`}>
                    Show Favorites Only
                  </span>
                  {showFavoritesOnly && favorites.length > 0 && (
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      ({favorites.length} saved)
                    </span>
                  )}
                </label>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Found <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{filteredData.length}</span> destinations
        </div>

        <div className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Smart context: season <strong>{getCurrentSeason()}</strong> | weather mode <strong>{weatherType}</strong>
        </div>
        
        {loading ? (
          <GridSkeleton count={6} />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className={`w-16 h-16 ${isDark ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No destinations found</p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-10">
            <RecommendationSection
              title="Recommended for You"
              items={filteredData.slice(0, 6)}
              PlaceCard={PlaceCard}
            />

            <RecommendationSection
              title="Trending Now"
              items={[...filteredData]
                .sort((a, b) => getTrendingScore(b.place) - getTrendingScore(a.place))
                .slice(0, 6)}
              PlaceCard={PlaceCard}
            />

            <RecommendationSection
              title="Best This Season"
              items={filteredData
                .filter((p) => String(p.season || '').toLowerCase().includes(getCurrentSeason().toLowerCase()))
                .slice(0, 6)}
              PlaceCard={PlaceCard}
            />

            <RecommendationSection
              title="Nearby You"
              items={[...filteredData]
                .filter((p) => typeof p.distanceKm === 'number')
                .sort((a, b) => a.distanceKm - b.distanceKm)
                .slice(0, 6)}
              PlaceCard={PlaceCard}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const RecommendationSection = ({ title, items, PlaceCard }) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((place) => (
          <PlaceCard key={`${title}-${place.place}`} place={place} />
        ))}
      </div>
    </section>
  );
};

export default Recommendations;
