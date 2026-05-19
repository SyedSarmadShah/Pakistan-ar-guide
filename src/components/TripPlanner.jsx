import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { generateItinerary, exportItineraryJSON, exportItineraryICS } from '../utils/itinerary';
import { getUserProfile } from '../utils/userProfile';

const DATA_CSV = '/recommendation and chatbot/places_dataset.csv';
const STORAGE_KEY = 'savedItineraries_v1';

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
  const [travelStyle, setTravelStyle] = useState('');
  const [perDayCapacity, setPerDayCapacity] = useState(3);
  const [defaultDurationHours, setDefaultDurationHours] = useState(2);
  const [places, setPlaces] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [saved, setSaved] = useState([]);
  const [title, setTitle] = useState('My Trip');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetch(DATA_CSV).then(r => r.text()).then(txt => setPlaces(parseSimpleCSV(txt))).catch(()=>setPlaces([]));
    const s = localStorage.getItem(STORAGE_KEY);
    setSaved(s ? JSON.parse(s) : []);
  }, []);

  const generate = () => {
    const profile = getUserProfile();
    const ctx = { userLocation: null, currentSeason: '' };
    const opts = { days, budgetLevel, travelStyle, perDayCapacity, defaultDurationHours };
    const result = generateItinerary(opts, places, profile, ctx);
    setItinerary(result);

    if (result && result.meta && result.meta.fallbackUsed) {
      setStatusMessage('No places matched the filters; showing top recommendations instead.');
    } else if (result && result.meta && result.meta.sourceCount === 0) {
      setStatusMessage('No places available for the selected filters.');
    } else {
      setStatusMessage('');
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Trip Planner (MVP)</h1>

        <div className="bg-white p-4 rounded shadow mb-6 space-y-3">
          <div className="flex gap-3">
            <input className="flex-1 p-2 border rounded" placeholder="Itinerary title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input type="number" min={1} value={days} onChange={(e)=>setDays(Number(e.target.value))} className="w-24 p-2 border rounded" />
          </div>

          <div className="flex gap-3 flex-wrap">
            <select value={budgetLevel} onChange={e=>setBudgetLevel(e.target.value)} className="p-2 border rounded">
              <option value="">Any budget</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input placeholder="Travel style (e.g. family, adventure)" value={travelStyle} onChange={e=>setTravelStyle(e.target.value)} className="flex-1 p-2 border rounded" />

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 mr-1">Per-day capacity</label>
              <input type="number" min={1} value={perDayCapacity} onChange={(e)=>setPerDayCapacity(Number(e.target.value))} className="w-28 p-2 border rounded" aria-label="Per-day capacity" />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 mr-1">Default duration (hrs)</label>
              <input type="number" min={1} value={defaultDurationHours} onChange={(e)=>setDefaultDurationHours(Number(e.target.value))} className="w-28 p-2 border rounded" aria-label="Default duration hours" />
            </div>

            <button onClick={generate} className="bg-emerald-600 text-white px-4 py-2 rounded">Generate</button>
          </div>

          {statusMessage && <div className="mt-2 text-sm text-orange-600">{statusMessage}</div>}
          <div className="mt-2 text-sm text-gray-500">Hints: <span className="font-medium">Per-day capacity</span> = how many places to visit per day. <span className="font-medium">Default duration</span> = estimated hours spent at each place.</div>
          <div className="text-sm text-gray-500">Uses top-ranked places from dataset and groups them across days (heuristic).</div>
        </div>

        {itinerary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Generated Itinerary</h2>
            {itinerary.days.map(d => (
              <div key={d.day} className="bg-white p-4 rounded shadow mb-3">
                <h3 className="font-bold">Day {d.day}</h3>
                    <ul className="mt-2 space-y-1">
                      {d.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{it.place}</div>
                            <div className="text-sm text-gray-500">{it.city} • est {it.estDurationHours}h</div>
                          </div>
                          <div className="text-xs text-gray-400">Rec. score: {Math.round(it.recommendedScore || 0)}</div>
                        </li>
                      ))}
                    </ul>
              </div>
            ))}

            <div className="flex gap-2">
              <button onClick={saveItinerary} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              <button onClick={exportJSON} className="px-4 py-2 bg-gray-700 text-white rounded">Export JSON</button>
              <button onClick={exportICS} className="px-4 py-2 bg-orange-600 text-white rounded">Export ICS</button>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-3">Saved Itineraries</h2>
          {saved.length === 0 ? <div className="text-sm text-gray-500">No saved itineraries</div> : (
            <ul className="space-y-3">
              {saved.map(s => (
                <li key={s.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-gray-500">Saved {new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportItineraryJSON(s.itinerary, `${s.title.replace(/\s+/g,'_')}.json`)} className="px-3 py-1 bg-gray-200 rounded">JSON</button>
                    <button onClick={() => exportItineraryICS(s.itinerary, `${s.title.replace(/\s+/g,'_')}.ics`)} className="px-3 py-1 bg-gray-200 rounded">ICS</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
