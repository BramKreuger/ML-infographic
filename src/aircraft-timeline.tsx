import React, { useState, useMemo } from 'react';
import { Search, Filter, Info, Plane, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const AircraftTimeline = () => {
  const [aircraftData, setAircraftData] = useState([]);
  const [selectedUser, setSelectedUser] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredAircraft, setHoveredAircraft] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState(null);

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
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
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
      
      setAircraftData(cleaned);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Fout bij het laden van het bestand. Controleer of het een geldig Excel bestand is.');
    }
  };

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
  const timelineHeight = Math.max(600, filteredData.length * 25);
  const timelineWidth = 2500; // Much wider for more scrolling

  // Calculate position
  const getXPosition = (year) => {
    return ((year - minYear) / yearRange) * 100;
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

  // Show upload screen if no data
  if (aircraftData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 text-center">
          <Plane className="w-20 h-20 text-orange-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Nederlandse Militaire Luchtvaart
          </h2>
          <p className="text-slate-300 mb-6">
            Upload het Excel bestand om de interactieve tijdlijn te zien
          </p>
          
          <label className="block">
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-all duration-200 hover:scale-105">
              <Upload className="w-5 h-5" />
              <span className="font-semibold">Upload Excel Bestand</span>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          <p className="text-slate-400 text-sm mt-4">
            Ondersteunde formaten: .xlsx, .xls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <style>{scrollbarStyles}</style>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-10 h-10 text-orange-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Nederlandse Militaire Luchtvaart
              </h1>
            </div>
            <p className="text-slate-300 text-lg">Interactieve tijdlijn 1817-2025</p>
          </div>
          
          {/* Re-upload button */}
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Nieuw bestand</span>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto mb-6 bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek vliegtuigtype..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/20 backdrop-blur rounded-lg p-4 border border-blue-500/30">
          <div className="text-3xl font-bold text-blue-400">{stats.types}</div>
          <div className="text-sm text-slate-300">Vliegtuigtypen</div>
        </div>
        <div className="bg-orange-500/20 backdrop-blur rounded-lg p-4 border border-orange-500/30">
          <div className="text-3xl font-bold text-orange-400">{stats.total}</div>
          <div className="text-sm text-slate-300">Totaal Toestellen</div>
        </div>
        <div className="bg-purple-500/20 backdrop-blur rounded-lg p-4 border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400">{stats.withMuseum}</div>
          <div className="text-sm text-slate-300">Met Museumstatus</div>
        </div>
        <div className="bg-green-500/20 backdrop-blur rounded-lg p-4 border border-green-500/30">
          <div className="text-3xl font-bold text-green-400">{stats.averageService}</div>
          <div className="text-sm text-slate-300">Gem. Dienstjaren</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto bg-slate-800/30 backdrop-blur rounded-xl p-6 border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="relative" style={{ width: `${timelineWidth}px`, height: `${timelineHeight}px` }}>
            {/* Year markers */}
            <div className="absolute top-0 left-0 right-0 h-12 border-b border-slate-600">
              {[1820, 1850, 1880, 1910, 1940, 1970, 2000, 2020].map(year => (
                <div
                  key={year}
                  className="absolute top-0 bottom-0 border-l border-slate-600/50"
                  style={{ left: `${getXPosition(year)}%` }}
                >
                  <span className="absolute -top-1 left-2 text-xs text-slate-400 font-medium">
                    {year}
                  </span>
                </div>
              ))}
            </div>

            {/* Aircraft bars */}
            <div className="absolute top-14 left-0 right-0">
              {filteredData.map((aircraft, index) => {
                const startX = getXPosition(aircraft.startYear);
                const endX = getXPosition(aircraft.endYear);
                const width = endX - startX;
                const yPos = index * 25;
                const color = getUserColor(aircraft.user);
                const isHovered = hoveredAircraft === aircraft.name;

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
                        isHovered || width > 10 ? 'opacity-100' : 'opacity-0'
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

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-6 bg-slate-800/30 backdrop-blur rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">Legenda</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'KLu (Koninklijke Luchtmacht)', color: '#0055A4' },
            { label: 'MLD (Marine Luchtvaartdienst)', color: '#003DA5' },
            { label: 'MLKNIL (ML Koninklijk Nederlands-Indië)', color: '#FF6B35' },
            { label: 'LVA (Luchtvaartafdeling)', color: '#8B4513' },
            { label: 'LSK (Luchtvaart Brigade)', color: '#4A7C59' }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-slate-400 text-sm mt-4">💡 Klik op een vliegtuig voor meer informatie van ipms.nl</p>
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