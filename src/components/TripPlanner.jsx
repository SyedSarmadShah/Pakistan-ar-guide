import React, { useEffect, useRef, useState } from 'react';
import NavBar from './NavBar';
import {
  MapPin, Calendar, DollarSign, Loader2, Plus, Trash2,
  ArrowDown, ChevronDown, AlertCircle, Navigation, Clock, Star
} from 'lucide-react';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DATA_CSV = '/places_dataset.csv';

const BUDGET_OPTIONS = [
  { value: 'budget',   label: 'Economy',  emoji: '💰', ratePerNight: 3000  },
  { value: 'moderate', label: 'Standard', emoji: '💳', ratePerNight: 7000  },
  { value: 'luxury',   label: 'Luxury',   emoji: '✨', ratePerNight: 18000 },
];

// ─────────────────────────────────────────────
// CSV parser (handles quoted commas)
// ─────────────────────────────────────────────
const parseCSV = (csv) => {
  const lines = csv.replace(/\r/g, '').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return {
      id:       obj.place_name || '',
      name:     obj.place_name || '',
      city:     obj.city || '',
      province: obj.province || '',
      category: obj.category || '',
      season:   obj.best_season || '',
      rating:   parseFloat(obj.rating) || 0,
      lat:      obj.lat  ? parseFloat(obj.lat)  : null,
      lon:      obj.lon  ? parseFloat(obj.lon)  : null,
      budget:   obj.budget_level || '',
    };
  }).filter(p => p.name && p.lat != null && p.lon != null);
};

// ─────────────────────────────────────────────
// Haversine distance (km)
// ─────────────────────────────────────────────
const toRad = v => (v * Math.PI) / 180;
const haversineKm = (a, b) => {
  if (!a || !b || a.lat == null || b.lat == null) return 0;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

// ─────────────────────────────────────────────
// Searchable Place Dropdown
// ─────────────────────────────────────────────
const PlaceDropdown = ({ places, value, onChange, placeholder = 'Select a destination…', excludeIds = [], showMyLocation = false }) => {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState('');
  const [locating, setLocating]   = useState(false);
  const [locError, setLocError]   = useState('');
  const ref                       = useRef(null);

  const selected = places.find(p => p.id === value);

  const filtered = places
    .filter(p => !excludeIds.includes(p.id) || p.id === value)
    .filter(p =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.city.toLowerCase().includes(query.toLowerCase()) ||
      p.province.toLowerCase().includes(query.toLowerCase())
    );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (place) => {
    onChange(place.id);
    setQuery('');
    setLocError('');
    setOpen(false);
  };

  // Find nearest dataset place to given coords
  const findNearest = (lat, lon) => {
    let nearest = null;
    let minDist = Infinity;
    places.forEach(p => {
      if (p.lat == null) return;
      const d = Math.sqrt((p.lat - lat) ** 2 + (p.lon - lon) ** 2);
      if (d < minDist) { minDist = d; nearest = p; }
    });
    return nearest;
  };

  const useMyLocation = (e) => {
    e.stopPropagation();
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearest(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        if (nearest) {
          onChange(nearest.id);
          setOpen(false);
        } else {
          setLocError('Could not match your location to a dataset destination.');
        }
      },
      () => {
        setLocating(false);
        setLocError('Location access denied. Please select manually.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-emerald-400 focus:border-emerald-500 focus:outline-none transition text-sm"
      >
        <span className={selected ? 'text-gray-900 font-medium truncate pr-2' : 'text-gray-400'}>
          {selected ? (
            <>
              {selected.name}
              <span className="ml-2 text-xs text-gray-400 font-normal">{selected.city}, {selected.province}</span>
            </>
          ) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {locError && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{locError}
        </p>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-emerald-200 rounded-lg shadow-xl z-50 max-h-72 flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search destinations…"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Use my location button */}
          {showMyLocation && (
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-b border-emerald-100 transition disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 flex-shrink-0" />
              )}
              {locating ? 'Detecting your location…' : 'Use my current location'}
            </button>
          )}

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400 italic">No destinations found.</p>
            ) : (
              filtered.map(place => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => select(place)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition border-b border-gray-50 last:border-b-0 ${value === place.id ? 'bg-emerald-100' : ''}`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{place.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{place.city} · {place.province} · <span className="text-teal-600">{place.category}</span></div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Stop Row
// ─────────────────────────────────────────────
const StopRow = ({ index, stop, places, allSelectedIds, onChange, onRemove, canRemove }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
    {/* Connector number */}
    <div className="flex flex-col items-center flex-shrink-0 pt-1">
      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow">
        {index + 1}
      </div>
    </div>

    {/* Fields */}
    <div className="flex-1 flex flex-col sm:flex-row gap-3 min-w-0">
      {/* Destination — takes remaining space */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Destination</label>
        <PlaceDropdown
          places={places}
          value={stop.placeId}
          onChange={id => onChange(index, 'placeId', id)}
          placeholder="Choose destination…"
          excludeIds={allSelectedIds.filter(id => id !== stop.placeId)}
        />
      </div>

      {/* Nights — fixed width so +/− never overflow */}
      <div className="sm:w-36 flex-shrink-0">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Nights</label>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onChange(index, 'nights', Math.max(1, stop.nights - 1))}
            className="w-8 h-9 rounded-l-lg bg-white border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition font-bold text-gray-600 flex items-center justify-center flex-shrink-0 text-lg leading-none"
          >−</button>
          <input
            type="number"
            min={1}
            value={stop.nights}
            onChange={e => onChange(index, 'nights', Math.max(1, Number(e.target.value)))}
            className="w-12 h-9 text-center font-bold text-emerald-600 border-t border-b border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(index, 'nights', stop.nights + 1)}
            className="w-8 h-9 rounded-r-lg bg-white border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition font-bold text-gray-600 flex items-center justify-center flex-shrink-0 text-lg leading-none"
          >+</button>
        </div>
      </div>
    </div>

    {/* Remove */}
    {canRemove && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="flex-shrink-0 mt-1 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
        title="Remove stop"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const TripPlanner = () => {
  const [places, setPlaces]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [startId, setStartId]           = useState('');
  const [stops, setStops]               = useState([{ placeId: '', nights: 2 }]);
  const [budgetLevel, setBudgetLevel]   = useState('moderate');
  const [tripName, setTripName]         = useState('');
  const [errors, setErrors]             = useState([]);
  const [result, setResult]             = useState(null);

  // Load dataset
  useEffect(() => {
    fetch(DATA_CSV)
      .then(r => r.text())
      .then(txt => { setPlaces(parseCSV(txt)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Stop helpers ──────────────────────────
  const addStop = () => setStops(prev => [...prev, { placeId: '', nights: 2 }]);

  const removeStop = (idx) => setStops(prev => prev.filter((_, i) => i !== idx));

  const updateStop = (idx, field, val) =>
    setStops(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));

  // All selected IDs (start + stops) for duplicate-prevention
  const allSelectedIds = [startId, ...stops.map(s => s.placeId)].filter(Boolean);

  // ── Route calculation ─────────────────────
  const buildRoute = () => {
    const validationErrors = [];

    if (!startId) validationErrors.push('Please select a starting location.');

    const filledStops = stops.filter(s => s.placeId);
    if (filledStops.length === 0) validationErrors.push('Add at least one destination stop.');

    stops.forEach((s, i) => {
      if (!s.placeId) validationErrors.push(`Stop ${i + 1}: no destination selected.`);
    });

    // Duplicate detection
    const ids = [startId, ...stops.map(s => s.placeId)].filter(Boolean);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      const dupeNames = [...new Set(dupes)].map(id => places.find(p => p.id === id)?.name).filter(Boolean);
      validationErrors.push(`Duplicate locations: ${dupeNames.join(', ')}`);
    }

    if (validationErrors.length > 0) { setErrors(validationErrors); setResult(null); return; }

    setErrors([]);

    // Build ordered location objects
    const startPlace = places.find(p => p.id === startId);
    const stopPlaces = stops.map(s => ({
      ...places.find(p => p.id === s.placeId),
      nights: s.nights,
    }));

    // Leg distances
    const allPoints = [startPlace, ...stopPlaces];
    const legs = [];
    let totalDistanceKm = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
      const from = allPoints[i];
      const to   = allPoints[i + 1];
      const km   = Math.round(haversineKm(from, to));
      legs.push({ from: from.name, to: to.name, km });
      totalDistanceKm += km;
    }

    const totalNights = stopPlaces.reduce((sum, s) => sum + (s.nights || 0), 0);
    const totalDays   = totalNights + 1;   // travel day
    const budgetRate  = BUDGET_OPTIONS.find(b => b.value === budgetLevel)?.ratePerNight || 7000;
    const totalCost   = totalNights * budgetRate;

    // Route string e.g. "Islamabad → Hunza Valley → Swat Valley"
    const routeString = [startPlace, ...stopPlaces].map(p => p.name).join(' → ');

    setResult({
      routeString,
      startPlace,
      stopPlaces,
      legs,
      totalDistanceKm: Math.round(totalDistanceKm),
      totalNights,
      totalDays,
      totalCost,
      budgetLevel,
    });
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavBar />

      {/* Hero */}
      <div className="relative h-72 bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop)' }}
        />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Custom Route Trip Planner
          </h1>
          <p className="text-lg text-emerald-50 drop-shadow-md max-w-2xl">
            Build your own route across Pakistan's best destinations.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            Loading destinations…
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Left: Route Builder ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Trip Name */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name (optional)</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={e => setTripName(e.target.value)}
                  placeholder="e.g., Northern Pakistan Adventure"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none transition text-sm"
                />
              </div>

              {/* Starting Location */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Starting Location
                </h2>
                <PlaceDropdown
                  places={places}
                  value={startId}
                  onChange={setStartId}
                  placeholder="Where does your journey begin?"
                  excludeIds={allSelectedIds.filter(id => id !== startId)}
                  showMyLocation={true}
                />
                {startId && (() => {
                  const p = places.find(x => x.id === startId);
                  return p ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">{p.category}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{p.city}, {p.province}</span>
                      {p.rating > 0 && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center gap-1"><Star className="w-3 h-3" />{p.rating}</span>}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Stops */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  Destination Stops
                </h2>

                <div className="space-y-3">
                  {stops.map((stop, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <div className="flex justify-center">
                          <ArrowDown className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                      <StopRow
                        index={idx}
                        stop={stop}
                        places={places}
                        allSelectedIds={allSelectedIds}
                        onChange={updateStop}
                        onRemove={removeStop}
                        canRemove={stops.length > 1}
                      />
                    </React.Fragment>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addStop}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Stop
                </button>
              </div>

              {/* Budget */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Budget Level
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {BUDGET_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBudgetLevel(opt.value)}
                      className={`p-4 rounded-xl border-2 transition font-semibold text-center ${
                        budgetLevel === opt.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{opt.emoji}</div>
                      <div className="text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">~PKR {opt.ratePerNight.toLocaleString()}/night</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                  {errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {e}
                    </div>
                  ))}
                </div>
              )}

              {/* Calculate button */}
              <button
                type="button"
                onClick={buildRoute}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg rounded-xl transition shadow-lg"
              >
                Calculate Route & Cost
              </button>
            </div>

            {/* ── Right: Summary Card ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Dataset info */}
              <div className="bg-white rounded-2xl shadow-md p-5">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Available Destinations
                </h3>
                <p className="text-3xl font-bold text-emerald-600">{places.length}</p>
                <p className="text-xs text-gray-500 mt-1">tourism destinations from dataset</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...new Set(places.map(p => p.province))].map(prov => (
                    <span key={prov} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200">
                      {prov}
                    </span>
                  ))}
                </div>
              </div>

              {/* Route summary (shown after calculate) */}
              {result ? (
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="font-bold text-lg mb-1">
                    {tripName || 'Trip Summary'}
                  </h3>

                  {/* Route string */}
                  <div className="mt-4 mb-5 bg-white/10 rounded-xl p-3 text-sm font-semibold leading-relaxed">
                    <p className="text-emerald-100 text-xs uppercase tracking-wide mb-1.5">Route</p>
                    {result.routeString}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-emerald-200 text-xs uppercase tracking-wide">Total Stops</p>
                      <p className="text-3xl font-bold">{result.stopPlaces.length}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-xs uppercase tracking-wide">Total Distance</p>
                      <p className="text-3xl font-bold">{result.totalDistanceKm} <span className="text-base font-semibold">km</span></p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-xs uppercase tracking-wide">Total Days</p>
                      <p className="text-3xl font-bold">{result.totalDays}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-xs uppercase tracking-wide">Est. Cost</p>
                      <p className="text-2xl font-bold">PKR {result.totalCost.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Leg breakdown */}
                  <div>
                    <p className="text-emerald-200 text-xs uppercase tracking-wide mb-2">Leg Distances</p>
                    <div className="space-y-1.5">
                      {result.legs.map((leg, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-white/10 rounded-lg px-3 py-2">
                          <span className="truncate pr-2">{leg.from} → {leg.to}</span>
                          <span className="font-bold flex-shrink-0">{leg.km} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-48 text-center gap-3">
                  <Navigation className="w-10 h-10 text-gray-300" />
                  <p className="text-gray-400 text-sm">Build your route and click<br /><strong>Calculate Route & Cost</strong> to see the summary.</p>
                </div>
              )}

              {/* Stop details (shown after calculate) */}
              {result && (
                <div className="bg-white rounded-2xl shadow-md p-5 space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Stop Details
                  </h3>
                  {result.stopPlaces.map((stop, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{stop.name}</p>
                        <p className="text-xs text-gray-500">{stop.city}, {stop.province}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full">{stop.category}</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />{stop.nights} night{stop.nights !== 1 ? 's' : ''}
                          </span>
                          {stop.rating > 0 && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />{stop.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
