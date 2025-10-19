import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Info, Plane, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import * as XLSX from 'xlsx';

const AircraftTimeline = () => {
  const [aircraftData, setAircraftData] = useState([]);
  const [selectedUser, setSelectedUser] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredAircraft, setHoveredAircraft] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1.8);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineContainerRef = React.useRef(null);
  const yearMarkersRef = React.useRef(null);

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      height: 12px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, #3b82f6, #f97316);
      border-radius: 10px;
      border: 2px solid rgba(30, 41, 59, 0.5);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(90deg, #2563eb, #ea580c);
    }
    .year-markers-container::-webkit-scrollbar {
      display: none;
    }
  `;

  // Generate IPMS search link
  const getIPMSSearchLink = (aircraftName) => {
    // Try to create a smart URL based on the aircraft name
    const cleanName = aircraftName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/\./g, '');
    
    return `https://www.ipms.nl/zoeken?searchword=${encodeURIComponent(aircraftName)}`;
  };

  // Handle aircraft click - simplified without AI fetch
  const handleAircraftClick = (aircraft) => {
    setSelectedAircraft(aircraft);
    // No longer fetching - just show the panel with links
  };

  // Process Excel data from ArrayBuffer
  const processExcelData = (arrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(firstSheet);

    const cleaned = rawData
      .filter(a => a.Typenaam && a['Jaar invoering'])
      .map(a => ({
        name: a.Typenaam,
        user: a.Gebruikers || 'Onbekend',
        startYear: a['Jaar invoering'],
        endYear: a['Jaar uit dienst'] || 2025,
        totalCount: a.Totaal || 0,
        klu: a['Aantal Klu'] || 0,
        mld: a['Aantal MLD'] || 0,
        mlknil: a['Aantal MLKNIL'] || 0,
        notes: a.Bijzonderheden || '',
        museum: a['Wrak - museaal - vliegend'] || ''
      }));

    return cleaned;
  };

  // Auto-load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch('/data.xlsx');
        if (!response.ok) {
          throw new Error('Kon het Excel bestand niet laden. Zorg ervoor dat data.xlsx in de public folder staat.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = processExcelData(arrayBuffer);
        setAircraftData(data);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-scroll to 1910 on mount
  useEffect(() => {
    if (timelineContainerRef.current && aircraftData.length > 0) {
      // Calculate position for 1910
      const targetYear = 1910;
      const scrollPercentage = ((targetYear - minYear) / yearRange);
      const scrollPosition = scrollPercentage * timelineWidth;

      // Center 1910 in the viewport
      const containerWidth = timelineContainerRef.current.offsetWidth;
      const centeredScroll = scrollPosition - (containerWidth * 0.3); // Show 1910 at 30% from left

      timelineContainerRef.current.scrollLeft = Math.max(0, centeredScroll);
    }
  }, [aircraftData, zoomLevel]);

  // Track scroll position for minimap and sync year markers
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    setScrollLeft(scrollLeft);

    // Sync year markers horizontal scroll
    if (yearMarkersRef.current) {
      yearMarkersRef.current.scrollLeft = scrollLeft;
    }
  };

  // Mouse wheel zoom handler
  const handleWheel = (e) => {
    // Check if Ctrl key is pressed (common zoom shortcut)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const delta = e.deltaY;
      const zoomLevels = [1, 1.5, 2, 2.5, 3];
      const currentIndex = zoomLevels.indexOf(zoomLevel);

      if (delta < 0 && currentIndex < zoomLevels.length - 1) {
        // Zoom in
        setZoomLevel(zoomLevels[currentIndex + 1]);
      } else if (delta > 0 && currentIndex > 0) {
        // Zoom out
        setZoomLevel(zoomLevels[currentIndex - 1]);
      }
    }
  };

  // Add wheel event listener
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [zoomLevel]);

  // Color mapping for different users
  const getUserColor = (user) => {
    const colorMap = {
      'KLu': '#0055A4',
      'Klu': '#0055A4',
      'KLU': '#0055A4',
      'MLD': '#003DA5',
      'MLKNIL': '#FF6B35',
      'LVA': '#8B4513',
      'LSK': '#4A7C59',
      'ML': '#2E5C8A',
      'RAF': '#5B92E5',
    };
    
    for (const [key, color] of Object.entries(colorMap)) {
      if (user.includes(key)) return color;
    }
    return '#6B7280';
  };

  // Filter data
  const filteredData = useMemo(() => {
    return aircraftData.filter(aircraft => {
      const matchesUser = selectedUser === 'Alle' || aircraft.user.includes(selectedUser);
      const matchesSearch = aircraft.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesUser && matchesSearch;
    });
  }, [aircraftData, selectedUser, searchTerm]);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set();
    aircraftData.forEach(a => {
      if (a.user.includes('KLu') || a.user.includes('Klu') || a.user.includes('KLU')) users.add('KLu');
      if (a.user.includes('MLD')) users.add('MLD');
      if (a.user.includes('MLKNIL')) users.add('MLKNIL');
      if (a.user.includes('LVA')) users.add('LVA');
      if (a.user.includes('LSK')) users.add('LSK');
    });
    return ['Alle', ...Array.from(users).sort()];
  }, [aircraftData]);

  // Timeline constants
  const minYear = 1817;
  const maxYear = 2025;
  const yearRange = maxYear - minYear;

  // Dynamic height and width based on zoom
  const baseWidth = 1200; // Base width at 1x zoom
  const timelineWidth = baseWidth * zoomLevel;
  const timelineHeight = Math.min(window.innerHeight - 500, Math.max(400, filteredData.length * 20));

  // Calculate position
  const getXPosition = (year) => {
    return ((year - minYear) / yearRange) * 100;
  };

  // Generate year markers based on zoom level
  const getYearMarkers = () => {
    let interval;
    if (zoomLevel >= 2.5) interval = 10; // Very zoomed in - every 10 years
    else if (zoomLevel >= 1.5) interval = 20; // Medium zoom - every 20 years
    else interval = 30; // Zoomed out - every 30 years

    const markers = [];
    for (let year = Math.ceil(minYear / interval) * interval; year <= maxYear; year += interval) {
      markers.push(year);
    }
    return markers;
  };

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.reduce((sum, a) => sum + a.totalCount, 0);
    const withMuseum = filteredData.filter(a => a.museum).length;
    
    // Calculate average service years correctly
    let totalServiceYears = 0;
    let countWithService = 0;
    
    filteredData.forEach(a => {
      // Only count if we have both start and end year, and end year is not current year (still in service)
      if (a.startYear && a.endYear && a.endYear < 2025) {
        totalServiceYears += (a.endYear - a.startYear);
        countWithService++;
      }
    });
    
    const averageService = countWithService > 0 ? Math.round(totalServiceYears / countWithService) : 0;
    
    return {
      types: filteredData.length,
      total,
      withMuseum,
      averageService
    };
  }, [filteredData]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 text-center">
          <Loader2 className="w-20 h-20 text-blue-400 mx-auto mb-6 animate-spin" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Nederlandse Militaire Luchtvaart
          </h2>
          <p className="text-slate-300 mb-6">
            Data wordt geladen...
          </p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (loadError || aircraftData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 text-center">
          <Plane className="w-20 h-20 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Nederlandse Militaire Luchtvaart
          </h2>

          {loadError ? (
            <div className="mb-6">
              <p className="text-red-400 mb-2">Fout bij het laden van data</p>
              <p className="text-slate-400 text-sm">{loadError}</p>
              <p className="text-slate-500 text-xs mt-4">
                Zorg ervoor dat 'data.xlsx' aanwezig is in de public folder.
              </p>
            </div>
          ) : (
            <p className="text-slate-300 mb-6">
              Geen data beschikbaar
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <style>{scrollbarStyles}</style>
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 py-3">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Nederlandse Militaire Luchtvaart
          </h1>
          <span className="text-slate-400 text-sm ml-2">1817-2025</span>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto w-full px-4 pb-2">
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-2 border border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Zoek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* User Filter */}
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Stats inline */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-bold text-blue-400">{stats.types}</span>
                <span className="text-slate-400">types</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-orange-400">{stats.total}</span>
                <span className="text-slate-400">totaal</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              {[1, 1.5, 2, 2.5, 3].map(level => (
                <button
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    zoomLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level}x
                </button>
              ))}
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] text-slate-500 ml-1">Ctrl+scroll</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto w-full px-4 flex-1 flex flex-col min-h-0 mb-52">
        <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700 overflow-hidden flex-1 flex flex-col relative">
          {/* Year markers - FIXED STICKY HEADER */}
          <div
            ref={yearMarkersRef}
            className="year-markers-container sticky top-0 left-0 right-0 h-8 border-b border-slate-600 bg-slate-800/95 backdrop-blur z-20 overflow-x-hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="relative h-full" style={{ width: `${timelineWidth}px` }}>
              {getYearMarkers().map(year => (
                <div
                  key={year}
                  className="absolute top-0 bottom-0 border-l border-slate-600/50"
                  style={{ left: `${getXPosition(year)}%` }}
                >
                  <span className="absolute top-1 left-1 text-[10px] text-slate-300 font-semibold bg-slate-800/80 px-1 rounded">
                    {year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1" ref={timelineContainerRef} onScroll={handleScroll}>
            <div className="relative" style={{ width: `${timelineWidth}px`, height: `${timelineHeight}px` }}>
              {/* Aircraft bars */}
              <div className="absolute top-0 left-0 right-0">
              {filteredData.map((aircraft, index) => {
                const startX = getXPosition(aircraft.startYear);
                const endX = getXPosition(aircraft.endYear);
                const width = endX - startX;
                const yPos = index * 25;
                const color = getUserColor(aircraft.user);
                const isHovered = hoveredAircraft === aircraft.name;

                // Dynamic label visibility based on zoom level
                const getMinWidth = () => {
                  if (zoomLevel >= 2.5) return 2;  // High zoom - show almost all names
                  if (zoomLevel >= 2) return 5;    // Medium zoom - show more names
                  if (zoomLevel >= 1.5) return 8;  // Low-medium zoom - show medium names
                  return 12;                        // Low zoom - only large names
                };
                const shouldShowLabel = isHovered || width > getMinWidth();

                return (
                  <div
                    key={`${aircraft.name}-${index}`}
                    className="absolute group cursor-pointer transition-all duration-200"
                    style={{
                      left: `${startX}%`,
                      width: `${width}%`,
                      top: `${yPos}px`,
                      height: '20px'
                    }}
                    onMouseEnter={() => setHoveredAircraft(aircraft.name)}
                    onMouseLeave={() => setHoveredAircraft(null)}
                    onClick={() => handleAircraftClick(aircraft)}
                  >
                    {/* Bar */}
                    <div
                      className={`h-full rounded transition-all duration-200 ${
                        isHovered ? 'opacity-100 scale-105' : 'opacity-80'
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: isHovered ? `0 0 20px ${color}` : 'none'
                      }}
                    />

                    {/* Label */}
                    <div
                      className={`absolute left-2 top-0 text-xs font-medium transition-opacity duration-200 ${
                        shouldShowLabel ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      {aircraft.name}
                    </div>

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute left-0 top-6 z-50 bg-slate-900 border border-slate-600 rounded-lg p-4 shadow-xl w-96">
                        <div className="font-bold text-xl mb-3 text-blue-400">{aircraft.name}</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">Gebruiker:</span>
                            <span className="font-medium text-white">{aircraft.user}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">Periode:</span>
                            <span className="font-medium text-white">{aircraft.startYear} - {aircraft.endYear}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">Aantal:</span>
                            <span className="font-medium text-white">{aircraft.totalCount}</span>
                          </div>
                          {aircraft.klu > 0 && (
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">KLu:</span>
                              <span className="font-medium text-white">{aircraft.klu}</span>
                            </div>
                          )}
                          {aircraft.mld > 0 && (
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">MLD:</span>
                              <span className="font-medium text-white">{aircraft.mld}</span>
                            </div>
                          )}
                          {aircraft.mlknil > 0 && (
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">MLKNIL:</span>
                              <span className="font-medium text-white">{aircraft.mlknil}</span>
                            </div>
                          )}
                          {aircraft.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                              <span className="text-slate-400 text-sm font-semibold">Bijzonderheden:</span>
                              <p className="text-sm mt-2 text-slate-200 leading-relaxed">{aircraft.notes}</p>
                            </div>
                          )}
                          {aircraft.museum && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                              <span className="text-orange-400 text-sm font-semibold">🏛️ Museum:</span>
                              <p className="text-sm mt-2 text-slate-200 leading-relaxed">{aircraft.museum}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Fixed Legend & Minimap at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto p-4">
          {/* Minimap */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-sm">Timeline Overzicht</span>
            </div>
            <div className="relative h-12 bg-slate-800/50 rounded-lg overflow-hidden border border-slate-600">
              {/* Background bars - all aircraft */}
              <div className="absolute inset-0">
                {aircraftData.map((aircraft, index) => {
                  const startX = getXPosition(aircraft.startYear);
                  const endX = getXPosition(aircraft.endYear);
                  const width = endX - startX;
                  const color = getUserColor(aircraft.user);

                  return (
                    <div
                      key={`minimap-${aircraft.name}-${index}`}
                      className="absolute top-0 bottom-0 opacity-40"
                      style={{
                        left: `${startX}%`,
                        width: `${width}%`,
                        backgroundColor: color
                      }}
                    />
                  );
                })}
              </div>

              {/* Viewport indicator */}
              {timelineContainerRef.current && (
                <div
                  className="absolute top-0 bottom-0 border-2 border-blue-400 bg-blue-400/20"
                  style={{
                    left: `${(scrollLeft / timelineWidth) * 100}%`,
                    width: `${(timelineContainerRef.current.offsetWidth / timelineWidth) * 100}%`
                  }}
                />
              )}

              {/* Year labels on minimap */}
              <div className="absolute inset-0 pointer-events-none">
                {[1820, 1880, 1940, 2000].map(year => (
                  <div
                    key={`minimap-year-${year}`}
                    className="absolute top-0 bottom-0 border-l border-slate-500/30"
                    style={{ left: `${getXPosition(year)}%` }}
                  >
                    <span className="absolute bottom-0 left-1 text-[10px] text-slate-400">
                      {year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm">Legenda</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: 'KLu (Koninklijke Luchtmacht)', color: '#0055A4' },
              { label: 'MLD (Marine Luchtvaartdienst)', color: '#003DA5' },
              { label: 'MLKNIL (ML Koninklijk Nederlands-Indië)', color: '#FF6B35' },
              { label: 'LVA (Luchtvaartafdeling)', color: '#8B4513' },
              { label: 'LSK (Luchtvaart Brigade)', color: '#4A7C59' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aircraft Info Panel */}
      {selectedAircraft && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAircraft(null)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-blue-500/50 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Plane className="w-7 h-7 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAircraft.name}</h2>
                  <p className="text-blue-100 text-sm">{selectedAircraft.user}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAircraft(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {/* Basic Info */}
              <div className="p-4 border-b border-slate-700">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Periode</div>
                    <div className="text-white font-semibold">{selectedAircraft.startYear} - {selectedAircraft.endYear}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Diensttijd</div>
                    <div className="text-white font-semibold">{selectedAircraft.endYear - selectedAircraft.startYear} jaar</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {selectedAircraft.klu > 0 && (
                    <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
                      <div className="text-blue-300 text-xs">KLu</div>
                      <div className="text-white font-bold text-lg">{selectedAircraft.klu}</div>
                    </div>
                  )}
                  {selectedAircraft.mld > 0 && (
                    <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
                      <div className="text-blue-300 text-xs">MLD</div>
                      <div className="text-white font-bold text-lg">{selectedAircraft.mld}</div>
                    </div>
                  )}
                  {selectedAircraft.mlknil > 0 && (
                    <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-500/30">
                      <div className="text-orange-300 text-xs">MLKNIL</div>
                      <div className="text-white font-bold text-lg">{selectedAircraft.mlknil}</div>
                    </div>
                  )}
                  <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30">
                    <div className="text-purple-300 text-xs">Totaal</div>
                    <div className="text-white font-bold text-lg">{selectedAircraft.totalCount}</div>
                  </div>
                </div>

                {selectedAircraft.notes && (
                  <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Bijzonderheden</div>
                    <p className="text-slate-200 text-sm leading-relaxed">{selectedAircraft.notes}</p>
                  </div>
                )}

                {selectedAircraft.museum && (
                  <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="text-orange-400 text-sm font-semibold mb-1">🏛️ Museum & Behoud</div>
                    <p className="text-slate-200 text-sm leading-relaxed">{selectedAircraft.museum}</p>
                  </div>
                )}
              </div>

              {/* IPMS Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Meer informatie</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-600/20 to-orange-600/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-slate-200 text-sm mb-3">
                      Voor uitgebreide informatie, foto's en technische details over de <strong>{selectedAircraft.name}</strong>.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={getIPMSSearchLink(selectedAircraft.name)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 text-sm font-semibold"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Zoek op IPMS.nl
                      </a>
                      
                      <a 
                        href="https://www.ipms.nl/artikelen/nedmil-luchtvaart" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Alle vliegtuigen
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tip voor uitgebreide info
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Vraag Claude in de chat: <em className="text-blue-300">"Zoek informatie over {selectedAircraft.name} op ipms.nl"</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AircraftTimeline;