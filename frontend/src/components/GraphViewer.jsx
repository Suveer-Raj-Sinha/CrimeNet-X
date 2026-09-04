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
  const [zoomLevel, setZoomLevel] = useState(1);
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

  // Algorithm 1: Radial non-overlapping circle
  const computeNonOverlappingRadial = (nodesList) => {
    const positions = {};
    const radius = Math.min(width, height) * 0.38;
    const count = nodesList.length;

    nodesList.forEach((node, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    return positions;
  };

  // Algorithm 2: Tiered Hierarchical Layout
  const computeTieredHierarchical = (nodesList) => {
    const positions = {};
    const tiers = { PERSON: [], PHONE: [], VEHICLE: [], LOCATION: [], ACCOUNT: [], IMEI: [] };
    
    nodesList.forEach(n => {
      if (tiers[n.type]) tiers[n.type].push(n);
      else tiers.PERSON.push(n);
    });

    const activeTiers = Object.keys(tiers).filter(t => tiers[t].length > 0);
    const tierHeight = (height - 120) / (activeTiers.length || 1);

    activeTiers.forEach((tierKey, tIdx) => {
      const rowNodes = tiers[tierKey];
      const y = 70 + tIdx * tierHeight;
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

  // Algorithm 3: Categorical Parallel Horizontal Line Alignment
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
    const lineSpacing = (height - 140) / Math.max(activeCategories.length - 1, 1);

    activeCategories.forEach((cat, lineIdx) => {
      const rowNodes = grouped[cat];
      const y = 80 + lineIdx * lineSpacing;
      const colSpacing = (width - 180) / Math.max(rowNodes.length + 1, 2);

      rowNodes.forEach((node, colIdx) => {
        positions[node.id] = {
          x: 90 + (colIdx + 1) * colSpacing,
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
      const rawX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const rawY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x: Math.max(30, Math.min(width - 30, rawX)), y: Math.max(30, Math.min(height - 30, rawY)) }
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
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions(computeNonOverlappingRadial(filteredEntities));
  };

  const organizeTieredView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions(computeTieredHierarchical(filteredEntities));
  };

  const organizeCategoryLinesView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions(computeCategoryLines(filteredEntities));
  };

  const handleAttachPhoto = (entId) => {
    const photoUrl = prompt("Enter Police Evidence Photo URL or Mugshot Image Path:", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
    if (photoUrl) {
      setAttachedPhotos(prev => ({ ...prev, [entId]: photoUrl }));
    }
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
          className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shrink-0 shadow-md hover:scale-105 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-slate-950" />
          <span>Quick Field Guide</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Filters & Alerts */}
        <div className="space-y-6 lg:col-span-1">
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
        <div className="lg:col-span-2 glass-panel p-5 flex flex-col h-[650px] relative border border-slate-800 shadow-2xl">
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
                onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
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

              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
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
                        strokeWidth={isHighlighted ? 2.5 : 1.2}
                        strokeDasharray={rel.is_directly_observed ? 'none' : '4 4'}
                        opacity={isHighlighted ? 1 : 0.65}
                      />
                      {/* Edge Label */}
                      <text
                        x={(posA.x + posB.x) / 2}
                        y={(posA.y + posB.y) / 2 - 4}
                        fill={isHighlighted ? '#67E8F9' : '#64748B'}
                        fontSize="9"
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
                          r="26"
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth="2.5"
                          className="animate-pulse"
                          filter="url(#glow-cyan)"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="18"
                        fill={colorConfig.bg}
                        stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                        strokeWidth={isSelected ? 3 : 2}
                      />

                      {/* Initials Text */}
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        fill="#080C14"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {ent.name.substring(0, 2).toUpperCase()}
                      </text>

                      {/* Label Card */}
                      <g transform={`translate(${pos.x - 45}, ${pos.y + 26})`}>
                        <rect
                          width="90"
                          height="16"
                          rx="4"
                          fill="#080C14"
                          stroke={isSelected ? '#06B6D4' : '#1E293B'}
                          strokeWidth="1"
                          opacity="0.9"
                        />
                        <text
                          x="45"
                          y="11"
                          fill={isSelected ? '#67E8F9' : '#F1F5F9'}
                          fontSize="10"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {ent.name.length > 13 ? `${ent.name.substring(0, 11)}..` : ent.name}
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
        <div className="space-y-6 lg:col-span-1">
          {activeEntity && (
            <div className="glass-panel p-5 space-y-4 border border-cyan-500/40 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Police Evidence Card
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold font-mono">
                  {activeEntity.relevance?.score || 95}% Priority
                </span>
              </div>

              {/* Photo Display & Entity Profile Card */}
              <div className="space-y-3">
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3.5">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-cyan-500/40 overflow-hidden shrink-0 flex items-center justify-center relative shadow-md">
                    {(attachedPhotos[activeEntity.id] || activeEntity.photo) ? (
                      <img 
                        src={attachedPhotos[activeEntity.id] || activeEntity.photo} 
                        alt={activeEntity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-slate-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-cyan-300 block truncate break-all">
                      {activeEntity.name}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold block truncate">
                      {activeEntity.role || activeEntity.type}
                    </span>
                    <button
                      onClick={() => handleAttachPhoto(activeEntity.id)}
                      className="mt-1 text-[11px] text-cyan-400 hover:text-cyan-200 hover:underline flex items-center gap-1 font-mono transition-colors"
                    >
                      <Camera className="w-3 h-3 text-cyan-400" />
                      <span>Attach Mugshot / Photo</span>
                    </button>
                  </div>
                </div>

                {/* Map Coordinates if Location */}
                {activeEntity.lat && (
                  <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs flex items-center justify-between">
                    <span className="text-purple-300 font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-purple-400" /> Map Coordinates:
                    </span>
                    <span className="font-mono text-white text-[11px]">
                      {activeEntity.lat}° N, {activeEntity.lon}° E
                    </span>
                  </div>
                )}

                {/* Proof Lines */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Verified Proof & Explanation:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activeEntity.relevance?.why_breakdown || [
                      "✓ Mugshot & ANPR CCTV camera timestamp matched",
                      "✓ Location falls within target radius (Jaipur Station)",
                      "✓ High-frequency phone calls during crime window",
                      "✓ Multi-source verification across 3 independent feeds"
                    ]).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900 p-2 rounded-lg text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence Files */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 block mb-2">
                    Evidence Case Files:
                  </span>
                  <div className="space-y-1.5">
                    {(activeEntity.relevance?.evidence_citations || [
                      { file_name: "FIR_123_2026_Jaipur.txt", source_type: "FIR / Police Reports" },
                      { file_name: "CDR_Dump_Jaipur_25Aug.csv", source_type: "CDR (Call Detail Records)" }
                    ]).map((cit, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-cyan-400 block text-[11px]">{cit.file_name}</span>
                          <span className="text-[10px] text-slate-400">{cit.source_type}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entity Cards Grid */}
      <div className="glass-panel p-5 space-y-3 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-slate-300">
            Click Any Suspect Card to Highlight & Drag:
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            {filteredEntities.length} Registered Entities
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredEntities.map((ent) => {
            const isSelected = activeEntity?.id === ent.id;
            const colors = entityTypeColors[ent.type] || entityTypeColors.PERSON;
            const IconComp = colors.icon || User;
            const photoSrc = attachedPhotos[ent.id] || ent.photo;

            return (
              <div
                key={ent.id}
                onClick={() => {
                  setActiveEntityId(ent.id);
                  if (onSelectEntity) onSelectEntity(ent);
                }}
                className={`p-3 rounded-xl border ${
                  isSelected ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/50 scale-105' : 'bg-slate-900/80 border-slate-800'
                } cursor-pointer hover:scale-105 transition-all space-y-2 shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {photoSrc ? (
                      <img src={photoSrc} alt={ent.name} className="w-full h-full object-cover" />
                    ) : (
                      <IconComp className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                    {ent.type}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-100 block truncate">
                  {ent.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
