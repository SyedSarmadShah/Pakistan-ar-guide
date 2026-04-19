export const getCurrentSeason = () => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
};

export const getUserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  });
};

export const mapWeatherToType = (weatherMain = '') => {
  if (weatherMain.includes('Rain')) return 'rainy';
  if (weatherMain.includes('Cloud')) return 'cloudy';
  if (weatherMain.includes('Clear')) return 'sunny';
  return 'normal';
};