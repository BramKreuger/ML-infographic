import React, { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Target } from 'lucide-react';
import { Aircraft } from '../types/aircraft';

interface FleetBubbleChartProps {
  aircraftData: Aircraft[];
  onAircraftClick?: (aircraft: Aircraft) => void;
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

// Get user abbreviation
const getUserAbbr = (user: string): string => {
  if (user.includes('KLu') || user.includes('Klu') || user.includes('KLU')) return 'KLu';
  if (user.includes('MLD')) return 'MLD';
  if (user.includes('MLKNIL')) return 'MLKNIL';
  if (user.includes('LVA')) return 'LVA';
  if (user.includes('LSK')) return 'LSK';
  return 'Overig';
};

const FleetBubbleChart: React.FC<FleetBubbleChartProps> = ({ aircraftData, onAircraftClick }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Transform data for scatter chart
  const scatterData = useMemo(() => {
    return aircraftData.map(aircraft => ({
      ...aircraft,
      x: aircraft.startYear,
      y: aircraft.endYear - aircraft.startYear, // Service duration
      z: Math.max(aircraft.totalCount, 5), // Bubble size (min 5 for visibility)
      service: getUserAbbr(aircraft.user),
      color: SERVICE_COLORS[getUserAbbr(aircraft.user)],
    }));
  }, [aircraftData]);

  // Filter by selected service
  const filteredData = useMemo(() => {
    if (!selectedService) return scatterData;
    return scatterData.filter(d => d.service === selectedService);
  }, [scatterData, selectedService]);

  // Calculate statistics
  const stats = useMemo(() => {
    const longestService = [...aircraftData].sort((a, b) =>
      (b.endYear - b.startYear) - (a.endYear - a.startYear)
    )[0];

    const largestFleet = [...aircraftData].sort((a, b) => b.totalCount - a.totalCount)[0];

    const avgServiceYears = aircraftData.reduce((sum, a) =>
      sum + (a.endYear - a.startYear), 0) / aircraftData.length;

    return { longestService, largestFleet, avgServiceYears };
  }, [aircraftData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 shadow-xl max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: data.color }}
            />
            <p className="text-white font-bold text-lg">{data.name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Dienst:</span>
              <span className="text-white">{data.service}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Periode:</span>
              <span className="text-white">{data.startYear} - {data.endYear}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Diensttijd:</span>
              <span className="text-blue-400 font-semibold">{data.y} jaar</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Aantal:</span>
              <span className="text-orange-400 font-semibold">{data.totalCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Type:</span>
              <span className="text-white capitalize">{data.aircraftType}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
            Klik voor meer details
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
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Vloot Analyse</h2>
          <span className="text-slate-400 text-xs">X: Introductie | Y: Diensttijd | Grootte: Aantal</span>
        </div>

        {/* Service Filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedService(null)}
            className={`px-2 py-1 rounded text-xs transition-all ${
              !selectedService
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Alle
          </button>
          {Object.entries(SERVICE_COLORS).map(([service, color]) => (
            <button
              key={service}
              onClick={() => setSelectedService(selectedService === service ? null : service)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                selectedService === service
                  ? 'bg-slate-600 text-white ring-1'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              style={{
                outlineColor: selectedService === service ? color : undefined,
                outlineWidth: selectedService === service ? '2px' : undefined,
                outlineStyle: selectedService === service ? 'solid' : undefined
              }}
            >
              <div
                className="w-2 h-2 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="hidden lg:inline">{service}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis
              type="number"
              dataKey="x"
              name="Introductiejaar"
              domain={[1900, 2025]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: 'Introductiejaar',
                position: 'bottom',
                fill: '#94a3b8',
                fontSize: 12,
                offset: 0
              }}
            />

            <YAxis
              type="number"
              dataKey="y"
              name="Diensttijd"
              domain={[0, 80]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: 'Diensttijd (jaren)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 12
              }}
            />

            <ZAxis
              type="number"
              dataKey="z"
              range={[50, 1000]}
              name="Aantal"
            />

            {/* Reference lines for historical events */}
            <ReferenceLine
              x={1939}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: 'WO2', position: 'top', fill: '#ef4444', fontSize: 10 }}
            />
            <ReferenceLine
              x={1945}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{ value: 'Einde WO2', position: 'top', fill: '#22c55e', fontSize: 10 }}
            />
            <ReferenceLine
              x={1991}
              stroke="#a855f7"
              strokeDasharray="5 5"
              label={{ value: 'Einde Koude Oorlog', position: 'top', fill: '#a855f7', fontSize: 10 }}
            />

            {/* Average service line */}
            <ReferenceLine
              y={stats.avgServiceYears}
              stroke="#f97316"
              strokeDasharray="10 5"
              label={{
                value: `Gem: ${stats.avgServiceYears.toFixed(1)} jaar`,
                position: 'right',
                fill: '#f97316',
                fontSize: 10
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              data={filteredData}
              onClick={(data) => onAircraftClick?.(data)}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.7}
                  stroke={entry.color}
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2 mt-3 flex-shrink-0">
        {/* Longest serving */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-2 border border-blue-500/30">
          <div className="text-blue-400 text-[10px] font-semibold">Langste dienst</div>
          <div className="text-white font-bold text-sm truncate">{stats.longestService?.name}</div>
          <div className="text-blue-300 text-lg font-bold">
            {stats.longestService ? stats.longestService.endYear - stats.longestService.startYear : 0} jaar
          </div>
        </div>

        {/* Largest fleet */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-2 border border-orange-500/30">
          <div className="text-orange-400 text-[10px] font-semibold">Grootste vloot</div>
          <div className="text-white font-bold text-sm truncate">{stats.largestFleet?.name}</div>
          <div className="text-orange-300 text-lg font-bold">
            {stats.largestFleet?.totalCount} stuks
          </div>
        </div>

        {/* Average service */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-2 border border-purple-500/30">
          <div className="text-purple-400 text-[10px] font-semibold">Gem. diensttijd</div>
          <div className="text-purple-300 text-lg font-bold">
            {stats.avgServiceYears.toFixed(1)} jaar
          </div>
          <div className="text-slate-400 text-[10px]">per type</div>
        </div>
      </div>
    </div>
  );
};

export default FleetBubbleChart;
