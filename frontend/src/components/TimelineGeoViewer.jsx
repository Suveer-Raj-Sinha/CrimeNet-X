import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Layers, 
  ShieldAlert, 
  Compass, 
  Play,
  Pause,
  RotateCcw,
  Plus,
  Filter,
  Maximize2,
  Minimize2,
  Activity,
  Radio,
  FileDown,
  Phone,
  Car,
  CreditCard,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function TimelineGeoViewer() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [coLocationEvents, setCoLocationEvents] = useState([]);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/analytics/case/CASE-2026-001/timeline_geo', {
          headers: { 'Investigator': 'OFFICER-771' }
        });
        if (res.ok) {
          const data = await res.json();
          setTimelineEvents(data.timeline_events || []);
          setCoLocationEvents(data.co_location_events || []);
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
      }
    };
    fetchTimelineData();
  }, []);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedMapPin, setSelectedMapPin] = useState(null);
  
  // Playback & Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const playbackSpeed = 2000; // ms per step
  
  // GIS Layer Toggles
  const [mapLayer, setMapLayer] = useState('mapnik'); // 'mapnik', 'hot'
  const [geoFenceRadius, setGeoFenceRadius] = useState(1.5); // km
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New Event Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customEvents, setCustomEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    location: '',
    lat: '26.9124',
    lon: '75.7873',
    modality: 'CDR (Call Detail Records)',
    confidence: '0.95'
  });

  // ESC key listener for Add GPS Log modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    if (isAddModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

  // Default initial timeline evidence
  const defaultEvents = useMemo(() => [
    {
      id: 'EVT-1',
      timestamp: '2026-08-25T20:15:00',
      modality: 'Financial Transactions',
      summary: 'Fund transfer ₹1,50,000 from AC-998877 to AC-112233',
      location: 'Online Banking (Jaipur Branch)',
      lat: 26.9124,
      lon: 75.7873,
      confidence: 0.98,
      entities: ['Rahul Sharma', 'AC-998877']
    },
    {
      id: 'EVT-2',
      timestamp: '2026-08-25T21:10:00',
      modality: 'CCTV / ANPR Metadata',
      summary: 'Vehicle RJ14AB1234 captured by ANPR Toll Gate 2 (Speed: 72 km/h)',
      location: 'Jaipur Expressway Toll Plaza',
      lat: 26.8912,
      lon: 75.7512,
      confidence: 0.96,
      entities: ['RJ14AB1234', 'Rahul Sharma']
    },
    {
      id: 'EVT-3',
      timestamp: '2026-08-25T21:20:00',
      modality: 'CDR (Call Detail Records)',
      summary: 'Call burst (+919876543210 -> +919811223344, Duration: 180s)',
      location: 'Jaipur Railway Station Tower #4',
      lat: 26.9221,
      lon: 75.7924,
      confidence: 0.99,
      entities: ['+919876543210', '+919811223344']
    },
    {
      id: 'EVT-4',
      timestamp: '2026-08-25T21:32:00',
      modality: 'CCTV / ANPR Metadata',
      summary: 'White Hyundai Creta RJ14AB1234 parked near North Gate',
      location: 'Jaipur Railway Station Parking',
      lat: 26.9235,
      lon: 75.7930,
      confidence: 0.94,
      entities: ['RJ14AB1234', 'Rahul Sharma']
    },
    {
      id: 'EVT-5',
      timestamp: '2026-08-25T21:45:00',
      modality: 'GPS Location Ping',
      summary: 'Mobile IMEI #86420192 pinged at Platform 2 Wi-Fi AP',
      location: 'Railway Station Concourse',
      lat: 26.9228,
      lon: 75.7918,
      confidence: 0.97,
      entities: ['IMEI:86420192', 'Rahul Sharma']
    }
  ], []);

  const defaultCoLocations = useMemo(() => [
    {
      target_location: 'Jaipur Railway Station Radius (1.5 km)',
      lat: 26.9221,
      lon: 75.7924,
      time_window: '21:15 - 21:45 (25 Aug 2026)',
      co_located_entities: ['Rahul Sharma', '+919876543210', 'RJ14AB1234', 'IMEI:86420192'],
      independent_feeds_count: 4,
      lead_summary: 'CDR cell tower logs, ANPR camera captures, Wi-Fi AP pings, and banking transfers confirm target cluster presence.'
    }
  ], []);

  // Helper: Normalize Timeline Event objects safely
  const normalizeEvent = (evt, idx) => {
    if (!evt) return defaultEvents[0];
    return {
      id: evt.event_id || evt.id || `EVT-${idx}`,
      timestamp: evt.timestamp || '2026-08-25T21:00:00',
      modality: evt.event_type || evt.modality || 'CDR / Evidence Log',
      summary: evt.title || evt.summary || 'Evidence observation logged',
      location: evt.location_name || evt.location || 'Jaipur Target Region',
      lat: typeof evt.latitude === 'number' ? evt.latitude : (typeof evt.lat === 'number' ? evt.lat : 26.9124 + (idx * 0.004)),
      lon: typeof evt.longitude === 'number' ? evt.longitude : (typeof evt.lon === 'number' ? evt.lon : 75.7873 + (idx * 0.004)),
      confidence: evt.confidence || 0.95,
      entities: Array.isArray(evt.participating_entities) ? evt.participating_entities : (Array.isArray(evt.entities) ? evt.entities : [])
    };
  };

  // Helper: Normalize Co-Location Event objects safely
  const normalizeCoLocation = (co) => {
    if (!co) return defaultCoLocations[0];
    return {
      target_location: co.location_name || co.target_location || 'Jaipur Co-Location Cluster',
      lat: typeof co.latitude === 'number' ? co.latitude : (typeof co.lat === 'number' ? co.lat : 26.9221),
      lon: typeof co.longitude === 'number' ? co.longitude : (typeof co.lon === 'number' ? co.lon : 75.7924),
      time_window: co.time_window || co.timestamp || '21:15 - 21:45 (25 Aug 2026)',
      co_located_entities: Array.isArray(co.entities_present) ? co.entities_present : (Array.isArray(co.co_located_entities) ? co.co_located_entities : ['Rahul Sharma', '+919876543210']),
      independent_feeds_count: Array.isArray(co.sources) ? co.sources.length : (co.independent_feeds_count || 3),
      lead_summary: co.lead_summary || `Geospatial & temporal correlation of ${Array.isArray(co.sources) ? co.sources.join(', ') : 'multi-source'} evidence pings.`
    };
  };

  // Memoized lists to prevent re-render loops
  const normalizedEventsList = useMemo(() => {
    const rawEvents = (timelineEvents && timelineEvents.length > 0) ? timelineEvents : defaultEvents;
    return [...rawEvents.map(normalizeEvent), ...customEvents];
  }, [timelineEvents, defaultEvents, customEvents]);

  const normalizedCoLocations = useMemo(() => {
    const rawCoLocations = (coLocationEvents && coLocationEvents.length > 0) ? coLocationEvents : defaultCoLocations;
    return rawCoLocations.map(normalizeCoLocation);
  }, [coLocationEvents, defaultCoLocations]);

  // Filter events by modality (Memoized)
  const filteredEvents = useMemo(() => {
    return normalizedEventsList.filter(evt => {
      if (activeFilter === 'ALL') return true;
      const modStr = (evt.modality || '').toUpperCase();
      if (activeFilter === 'CDR') return modStr.includes('CDR') || modStr.includes('TELECOM') || modStr.includes('CALL');
      if (activeFilter === 'ANPR') return modStr.includes('ANPR') || modStr.includes('CCTV') || modStr.includes('CAMERA');
      if (activeFilter === 'FIN') return modStr.includes('FINANCIAL') || modStr.includes('BANK') || modStr.includes('TRANSFER');
      if (activeFilter === 'GPS') return modStr.includes('GPS') || modStr.includes('WI-FI') || modStr.includes('LOCATION');
      return true;
    });
  }, [normalizedEventsList, activeFilter]);

  const activePin = selectedMapPin || filteredEvents[playbackIndex] || filteredEvents[0] || normalizedEventsList[0];

  // Auto Playback Effect (Stable Dependencies)
  useEffect(() => {
    let timer;
    if (isPlaying && filteredEvents.length > 0) {
      timer = setInterval(() => {
        setPlaybackIndex((prev) => {
          const next = (prev + 1) % filteredEvents.length;
          setSelectedMapPin(filteredEvents[next]);
          return next;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, filteredEvents.length]);

  // Helper: Haversine distance calculator between coordinates
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (typeof lat1 !== 'number' || typeof lat2 !== 'number') return '0.00';
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleAddCustomEvent = (e) => {
    e.preventDefault();
    const newEvtObj = {
      id: `EVT-USER-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modality: newEvent.modality,
      summary: newEvent.summary || 'User Ingested Evidence Point',
      location: newEvent.location || 'Custom Target Coordinate',
      lat: parseFloat(newEvent.lat) || 26.9124,
      lon: parseFloat(newEvent.lon) || 75.7873,
      confidence: parseFloat(newEvent.confidence) || 0.95,
      entities: ['Investigative Lead']
    };
    setCustomEvents(prev => [...prev, newEvtObj]);
    setSelectedMapPin(newEvtObj);
    setIsAddModalOpen(false);
    setNewEvent({
      summary: '',
      location: '',
      lat: '26.9124',
      lon: '75.7873',
      modality: 'CDR (Call Detail Records)',
      confidence: '0.95'
    });
  };

  const handleExportGISData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(normalizedEventsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "CRIMENET_GIS_Timeline_Export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Modality Icon Helper
  const getModalityBadge = (modalityStr) => {
    const uppercaseMod = (modalityStr || '').toUpperCase();
    if (uppercaseMod.includes('CDR') || uppercaseMod.includes('CALL')) {
      return { icon: Phone, color: 'bg-cyan-950 text-cyan-300 border-cyan-500/50' };
    }
    if (uppercaseMod.includes('ANPR') || uppercaseMod.includes('CCTV')) {
      return { icon: Car, color: 'bg-emerald-950 text-emerald-300 border-emerald-500/50' };
    }
    if (uppercaseMod.includes('FINANCIAL') || uppercaseMod.includes('BANK')) {
      return { icon: CreditCard, color: 'bg-amber-950 text-amber-300 border-amber-500/50' };
    }
    return { icon: MapPin, color: 'bg-purple-950 text-purple-300 border-purple-500/50' };
  };

  // Helper: Format distinct, informative Map Point button labels
  const formatMapPointLabel = (evt, idx) => {
    const num = idx + 1;
    const modalityTag = evt.modality ? evt.modality.split(' ')[0].replace(/[^a-zA-Z]/g, '') : 'Log';
    
    let locTag = '';
    if (evt.location) {
      const words = evt.location.split(' ').filter(w => w.length > 2 && w.toLowerCase() !== 'jaipur');
      locTag = words.length > 0 ? words[0] : 'Jaipur';
    } else {
      locTag = 'Point';
    }
    return `📍 #${num} ${modalityTag}: ${locTag}`;
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in relative ${isFullscreen ? 'fixed inset-0 z-[99999] bg-[#060a14] overflow-y-auto p-6' : ''}`}>
      {/* Background Wrapper - Blurs website content when Add Modal is open */}
      <div className={`space-y-6 transition-all duration-300 ${isAddModalOpen ? 'blur-md brightness-40 pointer-events-none select-none' : ''}`}>
        {/* Premium Header Banner */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
                <Compass className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black tracking-wide text-white flex items-center gap-2">
                Tactical GIS Map & Chronological Intelligence Timeline
              </h2>
              <p className="text-xs text-slate-300 font-semibold mt-0.5 flex items-center gap-2">
                <span>CDR Cell Towers</span> • <span>ANPR Cameras</span> • <span>GPS Pings</span> • <span>Geofence Velocity Analyzer</span>
              </p>
            </div>
          </div>

          {/* Action Controls Cluster */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 border border-cyan-400/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white font-black">Add GPS Log</span>
            </button>

            <button
              onClick={handleExportGISData}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              title="Export Timeline & Coordinates JSON"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Export KML/GIS</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen GIS Workspace"}
            >
              {isFullscreen ? <Minimize2 className="w-4.5 h-4.5 text-cyan-400" /> : <Maximize2 className="w-4.5 h-4.5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Cyber Control & Modality Filter Bar */}
        <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-800 bg-[#090e1a]/90 shadow-xl">
          {/* Modality Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar py-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Feeds Filter:
            </span>
            {[
              { id: 'ALL', label: 'All Feeds 🌐', activeClass: 'from-cyan-950 to-blue-950 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]' },
              { id: 'CDR', label: 'CDR Towers 📞', activeClass: 'from-cyan-950 to-teal-950 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]' },
              { id: 'ANPR', label: 'ANPR Cameras 🚗', activeClass: 'from-emerald-950 to-teal-950 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(10,185,129,0.35)]' },
              { id: 'FIN', label: 'Financial 💳', activeClass: 'from-amber-950 to-orange-950 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]' },
              { id: 'GPS', label: 'GPS / Wi-Fi 📍', activeClass: 'from-purple-950 to-indigo-950 text-purple-300 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)]' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setActiveFilter(f.id); setPlaybackIndex(0); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? `bg-gradient-to-r ${f.activeClass} border ring-1 ring-white/20 scale-105`
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Timeline Player Scrubber Bar */}
          <div className="flex items-center space-x-3 bg-slate-950/90 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-md ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="text-white font-black">{isPlaying ? 'Pause' : 'Play Timeline'}</span>
            </button>

            <button
              onClick={() => { setPlaybackIndex(0); setSelectedMapPin(filteredEvents[0]); }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Reset Timeline to Beginning"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>

            <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono font-black pl-1">
              <span className="text-cyan-400 text-sm">{filteredEvents.length > 0 ? playbackIndex + 1 : 0}</span>
              <span className="text-slate-600">/</span>
              <span>{filteredEvents.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interactive GIS Map Viewer (2 Cols) */}
          <div className="lg:col-span-2 glass-panel p-5 space-y-4 flex flex-col h-[650px] border border-cyan-500/30 relative shadow-2xl">
            {/* Map Title & Layers Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                  Live Interactive GIS Spatial Map
                </h3>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                {/* Geofence Radius Selector - Styled dark slate with zero white background */}
                <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-400 text-[11px] font-bold shrink-0">Fence:</span>
                  <select
                    value={geoFenceRadius}
                    onChange={(e) => setGeoFenceRadius(parseFloat(e.target.value))}
                    className="bg-slate-900 text-cyan-300 font-mono font-bold text-xs border border-slate-700/80 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer shadow-inner"
                  >
                    <option value={0.5} className="bg-slate-950 text-slate-100">500m Radius</option>
                    <option value={1.5} className="bg-slate-950 text-slate-100">1.5 km Radius</option>
                    <option value={3.0} className="bg-slate-950 text-slate-100">3.0 km Radius</option>
                    <option value={5.0} className="bg-slate-950 text-slate-100">5.0 km Radius</option>
                  </select>
                </div>

                {/* Layers Selector */}
                <button
                  onClick={() => setMapLayer(mapLayer === 'mapnik' ? 'hot' : 'mapnik')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
                  title="Toggle Map Style Layer"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="capitalize font-mono text-[11px]">{mapLayer} Mode</span>
                </button>
              </div>
            </div>

          {/* Interactive OpenStreetMap Tile Canvas - Guaranteed 480px HD Height */}
          <div 
            style={{ minHeight: '460px', height: '480px' }}
            className="w-full bg-[#070b14] rounded-xl border border-slate-800 relative overflow-hidden shadow-inner flex-1"
          >
            <iframe
              key={`${activePin.lat}-${activePin.lon}-${mapLayer}`}
              title="Real Police Investigation Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(activePin.lon - 0.025).toFixed(4)},${(activePin.lat - 0.02).toFixed(4)},${(activePin.lon + 0.025).toFixed(4)},${(activePin.lat + 0.02).toFixed(4)}&layer=${mapLayer}&marker=${activePin.lat},${activePin.lon}`}
              className="absolute inset-0 w-full h-full filter brightness-95 contrast-105 border-0"
            />

            {/* Unified Tactical GIS HUD Overlay Box - Explicit 300px Width pinned Top-Left to clear zoom controls */}
            <div className="absolute top-3 left-3 w-72 sm:w-80 max-w-[calc(100%-4rem)] bg-[#080d1a]/95 border-2 border-cyan-500/60 p-3.5 rounded-xl space-y-2 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-md pointer-events-none z-10">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce shrink-0" />
                  <span className="truncate">{activePin.location || activePin.summary}</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-extrabold bg-purple-950/90 px-2 py-0.5 rounded-full border border-purple-500/50 shadow-sm shrink-0">
                  {typeof activePin.lat === 'number' ? activePin.lat.toFixed(4) : activePin.lat}° N, {typeof activePin.lon === 'number' ? activePin.lon.toFixed(4) : activePin.lon}° E
                </span>
              </div>

              <p className="text-xs text-slate-100 font-semibold leading-relaxed">
                {activePin.summary}
              </p>
              
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800">
                <span className="font-mono text-cyan-400 font-black flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {activePin.timestamp}
                </span>
                <span className="text-emerald-400 font-black font-mono text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  {Math.round((activePin.confidence || 0.95) * 100)}% Match
                </span>
              </div>

              {/* Sequential Movement Analysis - Integrated directly in HUD to prevent overlap */}
              {playbackIndex > 0 && filteredEvents[playbackIndex - 1] && (
                <div className="pt-1.5 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Sequential Distance:
                    </span>
                    <span className="font-mono text-amber-300 font-black text-xs bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/50">
                      {calculateDistanceKm(
                        filteredEvents[playbackIndex - 1].lat,
                        filteredEvents[playbackIndex - 1].lon,
                        activePin.lat,
                        activePin.lon
                      )} km
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Quick Location Map Pin Selectors - Distinct & Informative Labels */}
            <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wide">Map Points:</span>
              {filteredEvents.map((evt, idx) => (
                <button
                  key={evt.id}
                  onClick={() => { setSelectedMapPin(evt); setPlaybackIndex(idx); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    activePin.id === evt.id
                      ? 'bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-slate-950 font-black shadow-lg border border-cyan-300 shadow-cyan-500/40 ring-2 ring-cyan-400/50 scale-105'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {formatMapPointLabel(evt, idx)}
                </button>
              ))}
            </div>
          </div>

        {/* Right Column: Multi-Feed Co-Location & Chronological Timeline (1 Col - Fixed Height Matching Map) */}
        <div className="space-y-6 lg:col-span-1 flex flex-col h-[650px]">
          {/* Co-Location Cluster Cards */}
          {normalizedCoLocations.map((co, idx) => (
            <div key={idx} className="glass-panel p-5 space-y-3.5 border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-gradient-to-r from-purple-950/50 via-slate-900/90 to-indigo-950/50 rounded-2xl relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  Geofenced Co-Location Cluster
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono font-bold border border-purple-500/50 shadow-sm">
                  {co.independent_feeds_count} Feeds
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100">{co.target_location}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{co.lead_summary}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                {(co.co_located_entities || []).map((ent, eIdx) => (
                  <span key={eIdx} className="px-2.5 py-1 rounded-xl bg-slate-950 text-cyan-300 text-xs font-black border border-cyan-500/40 shadow-sm">
                    ✓ {ent}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Chronological Event Stream - Fills Remaining Height with Smooth Internal Scrollbar */}
          <div className="glass-panel p-5 space-y-4 border border-slate-800 flex-1 flex flex-col min-h-0 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Chronological Sequence ({filteredEvents.length})
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase">
                {activeFilter}
              </span>
            </div>

            {/* Scrollable Events List */}
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {filteredEvents.map((evt, idx) => {
                const isActive = activePin.id === evt.id;
                const badge = getModalityBadge(evt.modality);
                const BadgeIcon = badge.icon;
                
                const modStr = (evt.modality || '').toUpperCase();
                let borderAccent = 'border-l-purple-500';
                if (modStr.includes('CDR') || modStr.includes('CALL')) borderAccent = 'border-l-cyan-400';
                else if (modStr.includes('ANPR') || modStr.includes('CCTV')) borderAccent = 'border-l-emerald-400';
                else if (modStr.includes('FINANCIAL') || modStr.includes('BANK')) borderAccent = 'border-l-amber-400';
                
                return (
                  <div
                    key={evt.id}
                    onClick={() => { setSelectedMapPin(evt); setPlaybackIndex(idx); }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 relative ${
                      isActive 
                        ? `bg-gradient-to-r from-[#0c162d] via-[#0a1326] to-[#080f1e] border-l-4 ${borderAccent} border-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]` 
                        : `bg-slate-900/80 border-slate-800 border-l-4 ${borderAccent}/60 hover:border-cyan-500/50 hover:bg-slate-900`
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-cyan-400 font-black">{evt.timestamp}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{evt.modality}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-100 font-semibold leading-relaxed">{evt.summary}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {evt.location}
                      </span>
                      <span className="text-emerald-400 font-black font-mono">
                        {Math.round((evt.confidence || 0.95) * 100)}% Match
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Standard Web Dialog Box: Add Custom GPS Evidence Point Modal */}
      {isAddModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', isolation: 'isolate' }}
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 animate-fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gps-dialog-title"
        >
          {/* Dialog Container */}
          <div 
            style={{ backgroundColor: '#0b1120', opacity: 1 }}
            className="max-w-lg w-full max-h-[85vh] rounded-2xl border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative my-auto overflow-hidden text-slate-100 flex flex-col transition-all duration-200 transform scale-100"
          >
            {/* Top Decorative Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shrink-0"></div>

            {/* Dialog Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-start justify-between gap-4 relative shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0 shadow-inner">
                  <Plus className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 id="gps-dialog-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Add GPS Evidence Log
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Ingest manual coordinate logs into the real-time timeline.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Close Dialog (Esc)"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Body Form */}
            <form onSubmit={handleAddCustomEvent} className="flex flex-col flex-1 min-h-0">
              <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[50vh] custom-scrollbar flex-1">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Event Summary / Description:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Target spotted entering bank ATM"
                    value={newEvent.summary}
                    onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Location Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank ATM, MI Road"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Latitude (°N):
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent.lat}
                      onChange={(e) => setNewEvent({ ...newEvent, lat: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 text-cyan-300 font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Longitude (°E):
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent.lon}
                      onChange={(e) => setNewEvent({ ...newEvent, lon: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 text-cyan-300 font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Data Modality:
                  </label>
                  <select
                    value={newEvent.modality}
                    onChange={(e) => setNewEvent({ ...newEvent, modality: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="CDR (Call Detail Records)">CDR (Call Detail Records)</option>
                    <option value="CCTV / ANPR Metadata">CCTV / ANPR Metadata</option>
                    <option value="Financial Transactions">Financial Transactions</option>
                    <option value="GPS Location Ping">GPS Location Ping</option>
                  </select>
                </div>
              </div>

              {/* Dialog Footer Actions (Pinned at bottom) */}
              <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-500/25 border border-cyan-400/50 transition-all cursor-pointer hover:shadow-cyan-500/40"
                >
                  Save GPS Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
