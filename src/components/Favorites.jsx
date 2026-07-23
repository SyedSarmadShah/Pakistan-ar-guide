import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Cloud, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { CardSkeleton } from './LoadingSkeleton';
import { getPlaceImage } from '../utils/imageMapper';
import NavBar from './NavBar';

const Favorites = () => {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [favorites, setFavorites] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '5989bfd5387805e4603d064014e6032f';

  const cityMap = {
    "Karimabad": "Hunza", "Hunza": "Hunza", "Skardu": "Skardu",
    "Naltar": "Gilgit", "Nagar": "Gilgit", "Gojal": "Hunza",
    "Mingora": "Mingora", "Swat": "Mingora", "Naran": "Naran",
    "Kalam": "Kalam", "Chitral": "Chitral", "Lahore": "Lahore",
    "Larkana": "Larkana", "Thatta": "Thatta", "Ziarat": "Ziarat",
    "Islamabad": "Islamabad", "Taxila": "Taxila", "Murree": "Murree"
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    const saved = localStorage.getItem('favorites');
    const favList = saved ? JSON.parse(saved) : [];
    setFavorites(favList);

    // Load weather for each favorite
    for (const fav of favList) {
      await getWeather(fav.city);
    }
    
    setLoading(false);
  };

  const getWeather = async (city) => {
    if (weatherData[city]) return;

    const apiCity = cityMap[city] || city;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${apiCity},PK&units=metric&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();

      if (!data.main) {
        setWeatherData(prev => ({
          ...prev,
          [city]: { weather: 'N/A', advice: 'Unknown', icon: '☁️' }
        }));
        return;
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

      setWeatherData(prev => ({
        ...prev,
        [city]: { weather: `${condition}, ${temp.toFixed(1)}°C`, advice, icon }
      }));
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const removeFavorite = (place) => {
    const updated = favorites.filter(fav => !(fav.place === place.place && fav.city === place.city));
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const getDifficulty = (place) => {
    const easyCategories = ['Museum', 'Monument', 'Religious Site', 'Urban'];
    const hardCategories = ['Hiking', 'Mountaineering', 'Adventure', 'Trek'];
    
    if (hardCategories.some(cat => place.category.includes(cat))) return 'Hard';
    if (easyCategories.some(cat => place.category.includes(cat))) return 'Easy';
    return 'Medium';
  };

  const getBudget = (place) => {
    if (place.rating >= 4.5) return '$$$';
    if (place.rating >= 4.0) return '$$';
    return '$';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-12`}>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg py-6`}>
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
              <Heart className="w-8 h-8 fill-red-500" />
              My Favorites
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} pb-12`}>
      <NavBar />
      
      {/* Page Title */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-16 z-40`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <Heart className="w-7 h-7 fill-red-500 text-red-500" />
            My Favorites ({favorites.length})
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No favorites yet!
            </p>
            <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-500 mt-2'}>
              Visit Recommendations and add places to your favorites by clicking the heart icon.
            </p>
            <button
              onClick={() => navigate('/recommendations')}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition"
            >
              Explore Recommendations
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((place, idx) => {
              const weather = weatherData[place.city];
              const placeImage = getPlaceImage(place.place);
              const difficulty = getDifficulty(place);
              const budget = getBudget(place);

              return (
                <div 
                  key={idx} 
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group flex flex-col justify-between h-full`}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-800">
                    <img src={placeImage} alt={place.place} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Remove Favorite Button */}
                    <button
                      onClick={() => removeFavorite(place)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-red-50 transition"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>

                    {/* Difficulty Badge */}
                    <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold">
                      {difficulty === 'Easy' && '🟢 Easy'}
                      {difficulty === 'Medium' && '🟡 Medium'}
                      {difficulty === 'Hard' && '🔴 Hard'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {place.place}
                        </h3>
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-sm">{place.rating}</span>
                        </div>
                      </div>

                      <div className={`space-y-2 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{place.city}, {place.province}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                            {place.category}
                          </span>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                            {budget} Budget
                          </span>
                        </div>

                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Best:</strong> {place.season}
                        </div>
                      </div>
                    </div>

                    {weather && (
                      <div className={`border-t ${isDark ? 'border-gray-700' : ''} pt-4 space-y-2`}>
                        <div className="flex items-center gap-2 text-sm">
                          <Cloud className="w-4 h-4 text-blue-500" />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {weather.weather}
                          </span>
                        </div>
                        <div className={`text-sm font-medium p-2 rounded ${
                          isDark 
                            ? 'bg-blue-900 text-blue-200' 
                            : 'bg-blue-50 text-gray-700'
                        }`}>
                          {weather.advice}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
