import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Aircraft } from '../types/aircraft';

interface FleetAreaChartProps {
  aircraftData: Aircraft[];
}

// Service colors
const SERVICE_COLORS: Record<string, string> = {
  'KLu': '#0055A4',
  'MLD': '#003DA5',
  'MLKNIL': '#FF6B35',
  'LVA': '#8B4513',
  'LSK': '#4A7C59',
  'Overig': '#6B7280',
};

// Historical periods for reference lines
const HISTORICAL_EVENTS = [
  { year: 1913, label: 'Oprichting LVA', color: '#22c55e' },
  { year: 1939, label: 'Start WO2', color: '#ef4444' },
  { year: 1945, label: 'Einde WO2', color: '#22c55e' },
  { year: 1949, label: 'NAVO', color: '#3b82f6' },
  { year: 1991, label: 'Einde Koude Oorlog', color: '#a855f7' },
];

// Get user abbreviation
const getUserAbbr = (user: string): string => {
  if (user.includes('KLu') || user.includes('Klu') || user.includes('KLU')) return 'KLu';
  if (user.includes('MLD')) return 'MLD';
  if (user.includes('MLKNIL')) return 'MLKNIL';
  if (user.includes('LVA')) return 'LVA';
  if (user.includes('LSK')) return 'LSK';
  return 'Overig';
};

const FleetAreaChart: React.FC<FleetAreaChartProps> = ({ aircraftData }) => {
  const [showEvents, setShowEvents] = useState(true);
  const [chartMode, setChartMode] = useState<'types' | 'count'>('types');
  const [selectedServices, setSelectedServices] = useState<string[]>(['KLu', 'MLD', 'MLKNIL', 'LVA', 'LSK', 'Overig']);

  // Generate time series data
  const chartData = useMemo(() => {
    const data: Array<{
      year: number;
      KLu: number;
      MLD: number;
      MLKNIL: number;
      LVA: number;
      LSK: number;
      Overig: number;
      total: number;
    }> = [];

    // Generate data for each year from 1917 to 2025
    for (let year = 1917; year <= 2025; year++) {
      const activeByService: Record<string, number> = {
        'KLu': 0,
        'MLD': 0,
        'MLKNIL': 0,
        'LVA': 0,
        'LSK': 0,
        'Overig': 0,
      };

      // Count aircraft active in this year
      aircraftData.forEach(aircraft => {
        if (aircraft.startYear <= year && aircraft.endYear >= year) {
          const service = getUserAbbr(aircraft.user);
          if (chartMode === 'types') {
            activeByService[service]++;
          } else {
            activeByService[service] += aircraft.totalCount;
          }
        }
      });

      data.push({
        year,
        KLu: activeByService['KLu'],
        MLD: activeByService['MLD'],
        MLKNIL: activeByService['MLKNIL'],
        LVA: activeByService['LVA'],
        LSK: activeByService['LSK'],
        Overig: activeByService['Overig'],
        total: Object.values(activeByService).reduce((a, b) => a + b, 0),
      });
    }

    return data;
  }, [aircraftData, chartMode]);

  // Calculate peak stats
  const peakStats = useMemo(() => {
    let maxTypes = 0;
    let maxTypesYear = 0;
    let maxCount = 0;
    let maxCountYear = 0;

    chartData.forEach(d => {
      if (d.total > maxTypes && chartMode === 'types') {
        maxTypes = d.total;
        maxTypesYear = d.year;
      }
      if (d.total > maxCount && chartMode === 'count') {
        maxCount = d.total;
        maxCountYear = d.year;
      }
    });

    return { maxTypes, maxTypesYear, maxCount, maxCountYear };
  }, [chartData, chartMode]);

  // Toggle service visibility
  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

      return (
        <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              entry.value > 0 && (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 text-sm">{entry.name}</span>
                  </div>
                  <span className="text-white font-semibold">{entry.value}</span>
                </div>
              )
            ))}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Totaal</span>
                <span className="text-blue-400 font-bold">{total}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Vlootsterkte door de Tijd</h2>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setChartMode('types')}
              className={`px-2 py-1 rounded text-xs ${chartMode === 'types' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Types
            </button>
            <button
              onClick={() => setChartMode('count')}
              className={`px-2 py-1 rounded text-xs ${chartMode === 'count' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Aantallen
            </button>
          </div>

          <button
            onClick={() => setShowEvents(prev => !prev)}
            className={`px-2 py-1 rounded text-xs ${showEvents ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Events
          </button>

          {/* Service Toggle - compact */}
          <div className="flex gap-1">
            {Object.entries(SERVICE_COLORS).map(([service, color]) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                  selectedServices.includes(service)
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-500'
                }`}
                title={service}
              >
                <div
                  className="w-2 h-2 rounded"
                  style={{
                    backgroundColor: color,
                    opacity: selectedServices.includes(service) ? 1 : 0.3
                  }}
                />
                <span className="hidden lg:inline">{service}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {Object.entries(SERVICE_COLORS).map(([service, color]) => (
                <linearGradient key={service} id={`gradient-${service}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.2} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: chartMode === 'types' ? 'Aantal types' : 'Totaal vliegtuigen',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 12
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Historical event markers */}
            {showEvents && HISTORICAL_EVENTS.map(event => (
              <ReferenceLine
                key={event.year}
                x={event.year}
                stroke={event.color}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: event.label,
                  position: 'top',
                  fill: event.color,
                  fontSize: 10
                }}
              />
            ))}

            {/* Stacked areas - reverse order for proper layering */}
            {selectedServices.includes('Overig') && (
              <Area
                type="monotone"
                dataKey="Overig"
                stackId="1"
                stroke={SERVICE_COLORS.Overig}
                fill={`url(#gradient-Overig)`}
                name="Overig"
              />
            )}
            {selectedServices.includes('LSK') && (
              <Area
                type="monotone"
                dataKey="LSK"
                stackId="1"
                stroke={SERVICE_COLORS.LSK}
                fill={`url(#gradient-LSK)`}
                name="LSK"
              />
            )}
            {selectedServices.includes('LVA') && (
              <Area
                type="monotone"
                dataKey="LVA"
                stackId="1"
                stroke={SERVICE_COLORS.LVA}
                fill={`url(#gradient-LVA)`}
                name="LVA"
              />
            )}
            {selectedServices.includes('MLKNIL') && (
              <Area
                type="monotone"
                dataKey="MLKNIL"
                stackId="1"
                stroke={SERVICE_COLORS.MLKNIL}
                fill={`url(#gradient-MLKNIL)`}
                name="MLKNIL"
              />
            )}
            {selectedServices.includes('MLD') && (
              <Area
                type="monotone"
                dataKey="MLD"
                stackId="1"
                stroke={SERVICE_COLORS.MLD}
                fill={`url(#gradient-MLD)`}
                name="MLD"
              />
            )}
            {selectedServices.includes('KLu') && (
              <Area
                type="monotone"
                dataKey="KLu"
                stackId="1"
                stroke={SERVICE_COLORS.KLu}
                fill={`url(#gradient-KLu)`}
                name="KLu"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mt-3 flex-shrink-0">
        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
          <div className="text-slate-400 text-[10px]">Piek jaar</div>
          <div className="text-lg font-bold text-blue-400">
            {chartMode === 'types' ? peakStats.maxTypesYear : peakStats.maxCountYear}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
          <div className="text-slate-400 text-[10px]">Max {chartMode === 'types' ? 'types' : 'vliegtuigen'}</div>
          <div className="text-lg font-bold text-orange-400">
            {chartMode === 'types' ? peakStats.maxTypes : peakStats.maxCount}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
          <div className="text-slate-400 text-[10px]">Huidig (2025)</div>
          <div className="text-lg font-bold text-green-400">
            {chartData.find(d => d.year === 2025)?.total || 0}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
          <div className="text-slate-400 text-[10px]">Totaal ooit</div>
          <div className="text-lg font-bold text-purple-400">
            {aircraftData.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetAreaChart;
