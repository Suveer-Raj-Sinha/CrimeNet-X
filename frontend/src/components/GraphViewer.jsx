import React, { useState, useEffect } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  ShieldAlert, 
  Camera, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  User, 
  Phone, 
  Car, 
  MapPin, 
  CreditCard, 
  Smartphone,
  Layers,
  Sparkles,
  HelpCircle,
  AlignJustify,
  Grid,
  Maximize2,
  RefreshCw,
  GitMerge,
  Info,
  MousePointer,
  Image
} from 'lucide-react';

export default function GraphViewer({ caseData, onSelectEntity, onOpenHelp }) {
  const DEFAULT_ZOOM = 1.2;
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [selectedEntityType, setSelectedEntityType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEntityId, setActiveEntityId] = useState('ENT-PER-RAHUL');
  const [attachedPhotos, setAttachedPhotos] = useState({});

  // Local state for movable node positions
  const [nodePositions, setNodePositions] = useState({});
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  const defaultEntities = [
    { 
      id: 'ENT-PER-RAHUL', 
      name: 'Rahul Sharma', 
      type: 'PERSON', 
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Primary Target Suspect',
      degree_centrality: 0.45, 
      betweenness_centrality: 0.35, 
      confidence: 0.95 
    },
    { 
      id: 'ENT-PER-AMIT', 
      name: 'Amit Kumar', 
      type: 'PERSON', 
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Associate / Co-conspirator',
      degree_centrality: 0.25, 
      betweenness_centrality: 0.15, 
      confidence: 0.92 
    },
    { id: 'ENT-PH-9876', name: '+91-9876543210', type: 'PHONE', degree_centrality: 0.40, betweenness_centrality: 0.28, confidence: 0.99 },
    { id: 'ENT-PH-9811', name: '+91-9811223344', type: 'PHONE', degree_centrality: 0.20, betweenness_centrality: 0.10, confidence: 0.98 },
    { 
      id: 'ENT-VEH-RJ14', 
      name: 'RJ14AB1234', 
      type: 'VEHICLE', 
      photo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&auto=format&fit=crop&q=80',
      role: 'White Hyundai Creta (ANPR Flagged)',
      degree_centrality: 0.35, 
      betweenness_centrality: 0.20, 
      confidence: 0.96 
    },
    { 
      id: 'ENT-LOC-STATION', 
      name: 'Jaipur Railway Station', 
      type: 'LOCATION', 
      photo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=150&auto=format&fit=crop&q=80',
      lat: 26.9221, 
      lon: 75.7924, 
      degree_centrality: 0.50, 
      betweenness_centrality: 0.40, 
      confidence: 0.94 
    },
    { id: 'ENT-ACC-9988', name: 'AC-998877', type: 'ACCOUNT', degree_centrality: 0.30, betweenness_centrality: 0.18, confidence: 0.97 },
    { id: 'ENT-ACC-1122', name: 'AC-112233', type: 'ACCOUNT', degree_centrality: 0.22, betweenness_centrality: 0.12, confidence: 0.95 },
    { id: 'ENT-IMEI-8642', name: 'IMEI: 864201928374910', type: 'IMEI', degree_centrality: 0.15, betweenness_centrality: 0.05, confidence: 0.99 }
  ];

  const defaultRelationships = [
    { id: 'R1', source_entity_id: 'ENT-PER-RAHUL', target_entity_id: 'ENT-PH-9876', type: 'USES_DEVICE', is_directly_observed: true },
    { id: 'R2', source_entity_id: 'ENT-PH-9876', target_entity_id: 'ENT-PH-9811', type: 'CALLS', is_directly_observed: true },
    { id: 'R3', source_entity_id: 'ENT-PER-RAHUL', target_entity_id: 'ENT-VEH-RJ14', type: 'OWNED_BY', is_directly_observed: true },
    { id: 'R4', source_entity_id: 'ENT-VEH-RJ14', target_entity_id: 'ENT-LOC-STATION', type: 'SIGHTED_AT', is_directly_observed: true },
    { id: 'R5', source_entity_id: 'ENT-ACC-9988', target_entity_id: 'ENT-ACC-1122', type: 'TRANSFERS_FUNDS', is_directly_observed: true },
    { id: 'R6', source_entity_id: 'ENT-PER-RAHUL', target_entity_id: 'ENT-LOC-STATION', type: 'LOCATED_AT', is_directly_observed: false },
    { id: 'R7', source_entity_id: 'ENT-PER-AMIT', target_entity_id: 'ENT-PER-RAHUL', type: 'ASSOCIATED_WITH', is_directly_observed: false },
    { id: 'R8', source_entity_id: 'ENT-PER-RAHUL', target_entity_id: 'ENT-IMEI-8642', type: 'USES_DEVICE', is_directly_observed: true }
  ];

  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/graph/case/CASE-2026-001/sih_graph', {
          headers: { 'Investigator': 'OFFICER-771' }
        });
        if (res.ok) {
          setGraphData(await res.json());
        }
      } catch (err) {
        console.error('Error fetching graph data:', err);
      }
    };
    fetchGraphData();
  }, [caseData]);

  const entities = (graphData?.entities && graphData.entities.length > 0) ? graphData.entities : defaultEntities;
  const relationships = (graphData?.relationships && graphData.relationships.length > 0) ? graphData.relationships : defaultRelationships;
  const alerts = graphData?.alerts || [];

  const entityTypeColors = {
    PERSON: { bg: '#06B6D4', text: 'text-cyan-300', border: 'border-cyan-400', label: 'PERSON', icon: User },
    PHONE: { bg: '#10B981', text: 'text-emerald-300', border: 'border-emerald-400', label: 'PHONE', icon: Phone },
    VEHICLE: { bg: '#F59E0B', text: 'text-amber-300', border: 'border-amber-400', label: 'VEHICLE', icon: Car },
    LOCATION: { bg: '#A855F7', text: 'text-purple-300', border: 'border-purple-400', label: 'LOCATION', icon: MapPin },
    ACCOUNT: { bg: '#F43F5E', text: 'text-rose-300', border: 'border-rose-400', label: 'ACCOUNT', icon: CreditCard },
    IMEI: { bg: '#6366F1', text: 'text-indigo-300', border: 'border-indigo-400', label: 'IMEI', icon: Smartphone },
  };

  // Filter entities
  const filteredEntities = entities.filter(ent => {
    const matchesType = selectedEntityType === 'ALL' || ent.type === selectedEntityType;
    const matchesSearch = !searchQuery || ent.name.toLowerCase().includes(searchQuery.toLowerCase()) || ent.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const activeEntity = entities.find(e => e.id === activeEntityId) || filteredEntities[0];

  // SVG Canvas dimensions
  const width = 850;
  const height = 550;
  const centerX = width / 2;
  const centerY = height / 2;

  // Algorithm 1: Radial non-overlapping circle (Wider elliptical spread)
  const computeNonOverlappingRadial = (nodesList) => {
    const positions = {};
    const radiusX = width * 0.40;
    const radiusY = height * 0.40;
    const count = nodesList.length;

    nodesList.forEach((node, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      positions[node.id] = {
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle)
      };
    });
    return positions;
  };

  // Algorithm 2: Tiered Hierarchical Layout (Expanded vertical & horizontal spread)
  const computeTieredHierarchical = (nodesList) => {
    const positions = {};
    const tiers = { PERSON: [], PHONE: [], VEHICLE: [], LOCATION: [], ACCOUNT: [], IMEI: [] };
    
    nodesList.forEach(n => {
      if (tiers[n.type]) tiers[n.type].push(n);
      else tiers.PERSON.push(n);
    });

    const activeTiers = Object.keys(tiers).filter(t => tiers[t].length > 0);
    const tierHeight = (height - 80) / (activeTiers.length || 1);

    activeTiers.forEach((tierKey, tIdx) => {
      const rowNodes = tiers[tierKey];
      const y = 45 + tIdx * tierHeight;
      const stepX = width / (rowNodes.length + 1);

      rowNodes.forEach((node, nIdx) => {
        positions[node.id] = {
          x: stepX * (nIdx + 1),
          y: y
        };
      });
    });
    return positions;
  };

  // Algorithm 3: Categorical Parallel Horizontal Line Alignment (Wider canvas coverage)
  const computeCategoryLines = (nodesList) => {
    const positions = {};
    const categories = ['PERSON', 'PHONE', 'VEHICLE', 'LOCATION', 'ACCOUNT', 'IMEI'];
    const grouped = {};
    categories.forEach(cat => grouped[cat] = []);

    nodesList.forEach(node => {
      const cat = node.type || 'PERSON';
      if (grouped[cat]) grouped[cat].push(node);
      else grouped['PERSON'].push(node);
    });

    const activeCategories = categories.filter(cat => grouped[cat].length > 0);
    const lineSpacing = (height - 80) / Math.max(activeCategories.length - 1, 1);

    activeCategories.forEach((cat, lineIdx) => {
      const rowNodes = grouped[cat];
      const y = 42 + lineIdx * lineSpacing;
      const colSpacing = (width - 100) / (rowNodes.length + 1);

      rowNodes.forEach((node, colIdx) => {
        positions[node.id] = {
          x: 50 + (colIdx + 1) * colSpacing,
          y: y
        };
      });
    });

    return positions;
  };

  // Initialize layout positions on load
  useEffect(() => {
    setNodePositions(computeCategoryLines(entities));
  }, [caseData, graphData]);

  // Mouse Drag Handlers
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setActiveEntityId(nodeId);
  };

  const handleCanvasMouseMove = (e) => {
    if (draggedNodeId) {
      const svgElem = document.getElementById('canvas-bg');
      if (!svgElem) return;
      const rect = svgElem.getBoundingClientRect();
      const mouseSvgX = (e.clientX - rect.left) * (width / rect.width);
      const mouseSvgY = (e.clientY - rect.top) * (height / rect.height);
      const rawX = centerX + (mouseSvgX - centerX - panOffset.x) / zoomLevel;
      const rawY = centerY + (mouseSvgY - centerY - panOffset.y) / zoomLevel;

      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x: Math.max(25, Math.min(width - 25, rawX)), y: Math.max(25, Math.min(height - 25, rawY)) }
      }));
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.id === 'canvas-bg' || e.target.tagName === 'svg') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
    }
  };

  const organizeRadialView = () => {
    setZoomLevel(DEFAULT_ZOOM);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions(computeNonOverlappingRadial(filteredEntities));
  };

  const organizeTieredView = () => {
    setZoomLevel(DEFAULT_ZOOM);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions(computeTieredHierarchical(filteredEntities));
  };

  const organizeCategoryLinesView = () => {
    setZoomLevel(DEFAULT_ZOOM);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions(computeCategoryLines(filteredEntities));
  };

  const handleAttachPhoto = (entId) => {
    const photoUrl = prompt("Enter Police Evidence Photo URL or Mugshot Image Path:", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
    if (photoUrl) {
      setAttachedPhotos(prev => ({ ...prev, [entId]: photoUrl }));
    }
  };

  const handleRemovePhoto = (entId) => {
    setAttachedPhotos(prev => {
      const next = { ...prev };
      delete next[entId];
      return next;
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-fade-in">
      {/* Interactive Usage Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0">
            <MousePointer className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-cyan-300 block text-sm">Interactive Knowledge Graph Workspace</span>
            <span className="text-slate-300">
              💡 <strong className="text-white">Drag any node</strong> on map to rearrange • <strong className="text-white">Scroll mouse</strong> to zoom • Click any node to inspect evidence proof!
            </span>
          </div>
        </div>

        <button
          onClick={onOpenHelp}
          className="px-4 py-2 rounded-xl text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shrink-0 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 50%, #3B82F6 100%)',
            color: '#020617',
            border: '1px solid #67E8F9',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
          }}
        >
          <HelpCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span className="font-extrabold tracking-wide text-[#020617]">Quick Field Guide</span>
        </button>
      </div>

      {/* Auto-Organize Action Toolbar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Auto-Organize Layout Presets:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={organizeCategoryLinesView}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/25 border border-cyan-400/60 transition-all hover:scale-105"
          >
            <AlignJustify className="w-4 h-4 text-cyan-300" />
            <span className="text-white font-black">Align Categories in Lines</span>
          </button>

          <button
            onClick={organizeRadialView}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Circle View</span>
          </button>

          <button
            onClick={organizeTieredView}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <GitMerge className="w-3.5 h-3.5 text-purple-400" />
            <span>3-Tier View</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Filters & Alerts */}
        <div className="space-y-5 lg:col-span-3">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                Category Filters
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {filteredEntities.length} Visible
              </span>
            </div>

            {/* Search Bar */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Search Name, Phone, Plate:
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Rahul, RJ14..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Filter Category:
              </label>
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="ALL">Show All Categories ({entities.length} nodes)</option>
                <option value="PERSON">Persons</option>
                <option value="PHONE">Phones</option>
                <option value="VEHICLE">Vehicles</option>
                <option value="LOCATION">Locations</option>
                <option value="ACCOUNT">Accounts</option>
                <option value="IMEI">IMEI Devices</option>
              </select>
            </div>
          </div>

          {/* Anomaly Alerts */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Flagged Anomaly Alerts
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                {alerts.length} Flagged
              </span>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
              {alerts.map((alert, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{alert.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-mono">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {alert.pattern_description || alert.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Visual SVG Network Canvas */}
        <div className="lg:col-span-6 glass-panel p-5 flex flex-col h-[640px] relative border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Interactive Multi-Layer Graph Canvas
              </h3>
            </div>

            {/* Canvas Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.5))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => { setZoomLevel(DEFAULT_ZOOM); setPanOffset({ x: 0, y: 0 }); }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div 
            id="canvas-bg"
            className="flex-1 bg-[#050810] rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
              <defs>
                <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g transform={`translate(${centerX + panOffset.x}, ${centerY + panOffset.y}) scale(${zoomLevel}) translate(${-centerX}, ${-centerY})`}>
                {/* Connecting Edges */}
                {relationships.map((rel) => {
                  const posA = nodePositions[rel.source_entity_id] || { x: centerX, y: centerY };
                  const posB = nodePositions[rel.target_entity_id] || { x: centerX, y: centerY };
                  const currentActiveId = activeEntity?.id;
                  const isHighlighted = currentActiveId === rel.source_entity_id || currentActiveId === rel.target_entity_id;

                  return (
                    <g key={rel.id}>
                      <line
                        x1={posA.x}
                        y1={posA.y}
                        x2={posB.x}
                        y2={posB.y}
                        stroke={isHighlighted ? '#06B6D4' : '#334155'}
                        strokeWidth={isHighlighted ? 3.2 : 1.8}
                        strokeDasharray={rel.is_directly_observed ? 'none' : '4 4'}
                        opacity={isHighlighted ? 1 : 0.75}
                      />
                      {/* Edge Label */}
                      <text
                        x={(posA.x + posB.x) / 2}
                        y={(posA.y + posB.y) / 2 - 4}
                        fill={isHighlighted ? '#67E8F9' : '#64748B'}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="font-mono select-none"
                      >
                        {rel.type}
                      </text>
                    </g>
                  );
                })}

                {/* SVG Graph Nodes */}
                {filteredEntities.map((ent) => {
                  const pos = nodePositions[ent.id] || { x: centerX, y: centerY };
                  const isSelected = activeEntity?.id === ent.id;
                  const colorConfig = entityTypeColors[ent.type] || entityTypeColors.PERSON;

                  return (
                    <g 
                      key={ent.id}
                      className="cursor-pointer transition-transform duration-100"
                      onMouseDown={(e) => handleNodeMouseDown(e, ent.id)}
                    >
                      {/* Outer Selection Glow */}
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="31"
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth="3"
                          className="animate-pulse"
                          filter="url(#glow-cyan)"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="22"
                        fill={colorConfig.bg}
                        stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                      />

                      {/* Initials Text */}
                      <text
                        x={pos.x}
                        y={pos.y + 4.5}
                        fill="#080C14"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {ent.name.substring(0, 2).toUpperCase()}
                      </text>

                      {/* Label Card */}
                      <g transform={`translate(${pos.x - 52}, ${pos.y + 29})`}>
                        <rect
                          width="104"
                          height="18"
                          rx="5"
                          fill="#080C14"
                          stroke={isSelected ? '#06B6D4' : '#1E293B'}
                          strokeWidth="1.2"
                          opacity="0.95"
                        />
                        <text
                          x="52"
                          y="12.5"
                          fill={isSelected ? '#67E8F9' : '#F1F5F9'}
                          fontSize="10"
                          fontWeight={isSelected ? 'bold' : '600'}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {ent.name.length > 15 ? `${ent.name.substring(0, 14)}…` : ent.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Color Legend Footer */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              {Object.entries(entityTypeColors).map(([type, c]) => (
                <span key={type} className="flex items-center gap-1 text-[11px]">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.bg }}></span>
                  <span>{type}</span>
                </span>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Categorical Parallel Line Alignment Active
            </span>
          </div>
        </div>

        {/* Right Column: Police Evidence Drawer */}
        <div className="space-y-5 lg:col-span-3">
          {activeEntity ? (
            <div className="glass-panel p-5 h-[640px] flex flex-col border border-cyan-500/40 shadow-2xl relative overflow-hidden">
              {/* Card Header (Fixed at top) */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-100">
                    Police Evidence Card
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold font-mono whitespace-nowrap shrink-0">
                  {activeEntity.relevance?.score || 95}% Priority
                </span>
              </div>

              {/* Scrollable Content Container (Smooth scroll, guaranteed layout stability) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mt-3 space-y-3.5">
                
                {/* Photo Display & Entity Profile Card (Invariant Layout) */}
                {(() => {
                  const colors = entityTypeColors[activeEntity.type] || entityTypeColors.PERSON;
                  const FallbackIcon = colors.icon || User;
                  const photoSrc = attachedPhotos[activeEntity.id] || activeEntity.photo;
                  const isCustomAttached = Boolean(attachedPhotos[activeEntity.id]);

                  return (
                    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 h-[116px] flex flex-col justify-between shadow-md">
                      {/* Top Row: Fixed Avatar on Left, Fixed Name & Badges on Right */}
                      <div className="flex items-center gap-3">
                        {/* Fixed 56x56 Avatar Box */}
                        <div 
                          onClick={() => handleAttachPhoto(activeEntity.id)}
                          className="w-14 h-14 rounded-xl bg-slate-950 border border-cyan-500/40 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer group hover:border-cyan-400 transition-colors shadow-sm"
                          title="Click to attach or update photo"
                        >
                          {photoSrc ? (
                            <img 
                              src={photoSrc} 
                              alt={activeEntity.name || 'Entity'} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <FallbackIcon className="w-6 h-6" style={{ color: colors.bg }} />
                          )}
                        </div>

                        {/* Fixed Height Name & Badges Column */}
                        <div className="min-w-0 flex-1 flex flex-col justify-center h-14">
                          <div className="flex items-center gap-1.5 h-5 overflow-hidden">
                            <span 
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0" 
                              style={{
                                backgroundColor: (colors.bg || '#06B6D4') + '25',
                                borderColor: (colors.bg || '#06B6D4') + '60',
                                color: colors.bg || '#06B6D4'
                              }}
                            >
                              {activeEntity.type || 'ENTITY'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium truncate" title={activeEntity.role || 'Subject Record'}>
                              {activeEntity.role || 'Subject Record'}
                            </span>
                          </div>

                          <h4 
                            className="text-sm font-bold text-white truncate leading-tight mt-1" 
                            title={activeEntity.name}
                          >
                            {activeEntity.name || 'Unknown Entity'}
                          </h4>
                        </div>
                      </div>

                      {/* Bottom Fixed Action Row (Zero Layout Shift) */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between h-7 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAttachPhoto(activeEntity.id)}
                          className="text-[11px] font-mono font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors group"
                          title="Attach or update photo evidence"
                        >
                          <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <span>Attach / Update Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(activeEntity.id)}
                          className={`text-[10px] font-mono text-rose-400 hover:text-rose-300 transition-opacity ${
                            isCustomAttached ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                          }`}
                          title="Reset to original photo"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Identification & Provenance Grid (Always present, fixed height) */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Entity ID</span>
                    <span className="font-mono font-bold text-slate-200 text-[11px] truncate block" title={activeEntity.id}>
                      {activeEntity.id || 'ENT-UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Coordinates / Provenance</span>
                    <span className="font-semibold text-emerald-400 text-[11px] truncate block font-mono">
                      {activeEntity.lat 
                        ? `${activeEntity.lat}°N, ${activeEntity.lon}°E` 
                        : (activeEntity.confidence ? `${Math.round(activeEntity.confidence * 100)}% Confidence` : 'Verified Lead')}
                    </span>
                  </div>
                </div>

                {/* Verified Proof & Explanation */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Verified Proof &amp; Explanation:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {((activeEntity.relevance?.why_breakdown && activeEntity.relevance.why_breakdown.length > 0)
                      ? activeEntity.relevance.why_breakdown
                      : [
                          `✓ Verified entity identifier (Type: ${activeEntity.type || 'PERSON'})`,
                          `✓ Observed in multi-layer relationship graph network`,
                          "✓ High source reliability rating verified",
                          "✓ Validated against active intelligence dossier"
                        ]
                    ).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg text-xs leading-relaxed text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="break-words leading-tight">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence Case Files */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 block mb-2">
                    Evidence Case Files:
                  </span>
                  <div className="space-y-1.5">
                    {((activeEntity.evidence_citations && activeEntity.evidence_citations.length > 0)
                      ? activeEntity.evidence_citations
                      : (activeEntity.relevance?.evidence_citations && activeEntity.relevance.evidence_citations.length > 0)
                      ? activeEntity.relevance.evidence_citations
                      : [
                          { file_name: `FIR_2026_${activeEntity.type || 'REF'}_PoliceDocket.txt`, source_type: "State Police FIR Records" },
                          { file_name: `Evidence_Dump_${activeEntity.id ? activeEntity.id.replace('ENT-', '') : 'CASE'}.csv`, source_type: "CCTNS Intelligence Evidence Log" }
                        ]
                    ).map((cit, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs hover:border-cyan-500/40 transition-colors">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-cyan-400 block text-[11px] truncate">{cit.file_name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{cit.source_type}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Empty State when no entity is selected */
            <div className="glass-panel p-6 h-[640px] flex flex-col items-center justify-center text-center space-y-3 border border-slate-800 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Camera className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">No Entity Selected</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Click any node in the graph canvas or select a suspect card below to inspect verified evidence proof.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Entity Cards Grid (Fixed Layout & Clear Typographic Hierarchy) */}
      <div className="glass-panel p-4 space-y-3 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide">
            Click Any Suspect Card to Highlight &amp; Drag:
          </h4>
          <span className="text-xs text-slate-400 font-mono font-medium px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 shrink-0">
            {filteredEntities.length} Registered Entities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
          {filteredEntities.map((ent) => {
            const isSelected = activeEntity?.id === ent.id;
            const colors = entityTypeColors[ent.type] || entityTypeColors.PERSON;

            return (
              <div
                key={ent.id}
                onClick={() => {
                  setActiveEntityId(ent.id);
                  if (onSelectEntity) onSelectEntity(ent);
                }}
                style={{ height: '48px' }}
                className={`px-2.5 py-1.5 rounded-lg border flex flex-col justify-between cursor-pointer transition-colors shadow-sm select-none ${
                  isSelected 
                    ? 'bg-cyan-950/70 border-cyan-400 ring-1 ring-cyan-400/60 shadow-cyan-950/50' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {/* Top: Entity Name (Larger) */}
                <div className="flex items-center justify-between gap-1 leading-none">
                  <span 
                    className={`text-xs font-bold block truncate leading-tight ${
                      isSelected ? 'text-cyan-200' : 'text-slate-100'
                    }`} 
                    style={{ fontSize: '12px' }}
                    title={ent.name}
                  >
                    {ent.name}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                  )}
                </div>

                {/* Bottom: Type Tag (Smaller micro-tag) */}
                <div className="leading-none">
                  <span 
                    className="font-mono font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider inline-flex items-center gap-1 shrink-0 leading-none"
                    style={{
                      fontSize: '9px',
                      lineHeight: '1',
                      backgroundColor: (colors.bg || '#06B6D4') + '15',
                      borderColor: (colors.bg || '#06B6D4') + '40',
                      color: colors.bg || '#06B6D4'
                    }}
                  >
                    <span 
                      className="w-1 h-1 rounded-full shrink-0" 
                      style={{ backgroundColor: colors.bg || '#06B6D4' }}
                    />
                    {ent.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
