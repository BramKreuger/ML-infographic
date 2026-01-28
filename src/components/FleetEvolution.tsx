import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';
import { Aircraft } from '../types/aircraft';

interface FleetEvolutionProps {
  aircraftData: Aircraft[];
}

// Color mapping for different users
const getUserColor = (user: string): string => {
  const colorMap: Record<string, string> = {
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

// Get user abbreviation
const getUserAbbr = (user: string): string => {
  if (user.includes('KLu') || user.includes('Klu') || user.includes('KLU')) return 'KLu';
  if (user.includes('MLD')) return 'MLD';
  if (user.includes('MLKNIL')) return 'MLKNIL';
  if (user.includes('LVA')) return 'LVA';
  if (user.includes('LSK')) return 'LSK';
  return 'Overig';
};

const FleetEvolution: React.FC<FleetEvolutionProps> = ({ aircraftData }) => {
  const [currentYear, setCurrentYear] = useState(1913);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(200); // ms per year

  const minYear = 1917;
  const maxYear = 2025;

  // Get active aircraft for current year
  const activeAircraft = useMemo(() => {
    return aircraftData.filter(
      a => a.startYear <= currentYear && a.endYear >= currentYear
    );
  }, [aircraftData, currentYear]);

  // Get aircraft introduced this year
  const introducedThisYear = useMemo(() => {
    return aircraftData.filter(a => a.startYear === currentYear);
  }, [aircraftData, currentYear]);

  // Get aircraft retired this year
  const retiredThisYear = useMemo(() => {
    return aircraftData.filter(a => a.endYear === currentYear && a.endYear < 2025);
  }, [aircraftData, currentYear]);

  // Calculate stats by service
  const statsByService = useMemo(() => {
    const stats: Record<string, { count: number; totalAircraft: number }> = {
      'KLu': { count: 0, totalAircraft: 0 },
      'MLD': { count: 0, totalAircraft: 0 },
      'MLKNIL': { count: 0, totalAircraft: 0 },
      'LVA': { count: 0, totalAircraft: 0 },
      'LSK': { count: 0, totalAircraft: 0 },
      'Overig': { count: 0, totalAircraft: 0 },
    };

    activeAircraft.forEach(a => {
      const abbr = getUserAbbr(a.user);
      stats[abbr].count++;
      stats[abbr].totalAircraft += a.totalCount;
    });

    return stats;
  }, [activeAircraft]);

  // Play/pause animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentYear(prev => {
        if (prev >= maxYear) {
          setIsPlaying(false);
          return maxYear;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        setCurrentYear(prev => Math.max(minYear, prev - 1));
      } else if (e.code === 'ArrowRight') {
        setCurrentYear(prev => Math.min(maxYear, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get historical period for current year
  const getCurrentPeriod = useCallback((year: number) => {
    if (year < 1913) return { name: 'Pre-Luchtvaart', color: 'slate' };
    if (year <= 1918) return { name: 'Oprichting & WO1', color: 'red' };
    if (year <= 1939) return { name: 'Interbellum', color: 'green' };
    if (year <= 1945) return { name: 'WO2', color: 'red' };
    if (year <= 1949) return { name: 'Indonesië', color: 'orange' };
    if (year <= 1991) return { name: 'Koude Oorlog', color: 'blue' };
    if (year <= 2001) return { name: 'Post-Koude Oorlog', color: 'purple' };
    return { name: 'Modern', color: 'sky' };
  }, []);

  const period = getCurrentPeriod(currentYear);

  return (
    <div className="h-full bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-4 flex flex-col">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Vloot Evolutie</h2>
        </div>

        {/* Period indicator */}
        <div className={`px-3 py-1 rounded-lg bg-${period.color}-500/20 border border-${period.color}-500/30`}>
          <span className={`text-${period.color}-400 font-semibold text-sm`}>{period.name}</span>
        </div>

        {/* Year Display */}
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            {currentYear}
          </div>
          <div className="text-slate-400 text-xs">
            {activeAircraft.length} types actief
          </div>
        </div>
      </div>

      {/* Timeline Slider + Controls Row */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <button
          onClick={() => setCurrentYear(minYear)}
          className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          title="Naar begin"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentYear(prev => Math.max(minYear, prev - 10))}
          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs transition-colors"
        >
          -10
        </button>

        <button
          onClick={() => setIsPlaying(prev => !prev)}
          className={`p-2 rounded-full ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={() => setCurrentYear(prev => Math.min(maxYear, prev + 10))}
          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs transition-colors"
        >
          +10
        </button>

        <button
          onClick={() => setCurrentYear(maxYear)}
          className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          title="Naar einde"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Timeline Slider */}
        <div className="flex-1">
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, #334155 ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, #334155 100%)`
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>{minYear}</span>
            <span>1950</span>
            <span>1980</span>
            <span>2000</span>
            <span>{maxYear}</span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-1">
          {[{ label: '1x', value: 200 }, { label: '2x', value: 100 }, { label: '4x', value: 50 }].map(speed => (
            <button
              key={speed.value}
              onClick={() => setPlaySpeed(speed.value)}
              className={`px-2 py-0.5 rounded text-xs ${playSpeed === speed.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats by Service */}
      <div className="grid grid-cols-6 gap-2 mb-3 flex-shrink-0">
        {Object.entries(statsByService).map(([service, data]) => (
          <div
            key={service}
            className="bg-slate-900/50 rounded-lg p-2 border border-slate-700"
            style={{ borderLeftColor: getUserColor(service), borderLeftWidth: '3px' }}
          >
            <div className="text-[10px] text-slate-400">{service}</div>
            <div className="text-lg font-bold text-white">{data.count}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* New Introductions */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-green-400 font-semibold text-sm flex items-center gap-1">
              <span>+</span>
              Nieuw in {currentYear}
            </h3>
            <span className="text-green-400 bg-green-500/20 px-2 py-0.5 rounded text-xs">
              {introducedThisYear.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {introducedThisYear.length === 0 ? (
              <p className="text-slate-500 text-xs italic">Geen nieuwe vliegtuigen</p>
            ) : (
              introducedThisYear.map((a, i) => (
                <div
                  key={`intro-${i}`}
                  className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1"
                >
                  <span className="text-white text-xs truncate">{a.name}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: getUserColor(a.user) + '40', color: getUserColor(a.user) }}
                  >
                    {getUserAbbr(a.user)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Retirements */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-red-400 font-semibold text-sm flex items-center gap-1">
              <span>-</span>
              Uit dienst in {currentYear}
            </h3>
            <span className="text-red-400 bg-red-500/20 px-2 py-0.5 rounded text-xs">
              {retiredThisYear.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {retiredThisYear.length === 0 ? (
              <p className="text-slate-500 text-xs italic">Geen vliegtuigen uit dienst</p>
            ) : (
              retiredThisYear.map((a, i) => (
                <div
                  key={`retire-${i}`}
                  className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1"
                >
                  <span className="text-white text-xs truncate">{a.name}</span>
                  <span className="text-slate-400 text-[10px] flex-shrink-0">
                    {a.endYear - a.startYear}j
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Fleet Visual */}
      <div className="mt-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-slate-400 text-xs">Actieve vloot ({activeAircraft.length} types)</h3>
        </div>
        <div className="flex flex-wrap gap-0.5">
          {activeAircraft.slice(0, 80).map((a, i) => (
            <div
              key={`active-${i}`}
              className="w-2.5 h-2.5 rounded-sm transition-all duration-300 hover:scale-150 cursor-pointer"
              style={{ backgroundColor: getUserColor(a.user) }}
              title={`${a.name} (${a.user})`}
            />
          ))}
          {activeAircraft.length > 80 && (
            <span className="text-slate-500 text-[10px] ml-1">+{activeAircraft.length - 80}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetEvolution;
