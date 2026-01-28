import React, { useState } from 'react';
import { Clock, TrendingUp, Target, LayoutGrid, ChevronLeft } from 'lucide-react';
import FleetEvolution from './FleetEvolution';
import FleetAreaChart from './FleetAreaChart';
import FleetBubbleChart from './FleetBubbleChart';
import { Aircraft } from '../types/aircraft';

interface VisualizationDashboardProps {
  aircraftData: Aircraft[];
  onBack: () => void;
  onAircraftClick?: (aircraft: Aircraft) => void;
}

type ViewType = 'evolution' | 'area' | 'bubble';

const VIEWS: Array<{
  id: ViewType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'evolution',
    label: 'Tijdsanimatie',
    description: 'Bekijk hoe de vloot evolueert door de tijd',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: 'area',
    label: 'Vlootsterkte',
    description: 'Gestapelde weergave per dienst over tijd',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'bubble',
    label: 'Bubble Analyse',
    description: 'Ontdek outliers en patronen',
    icon: <Target className="w-5 h-5" />,
  },
];

const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({
  aircraftData,
  onBack,
  onAircraftClick,
}) => {
  const [activeView, setActiveView] = useState<ViewType>('evolution');

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Terug</span>
            </button>

            {/* Title */}
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-orange-400" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Data Visualisaties
              </h1>
            </div>

            {/* View Tabs - moved to header */}
            <div className="flex gap-2">
              {VIEWS.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                    activeView === view.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                  title={view.description}
                >
                  <div className={activeView === view.id ? 'text-blue-200' : 'text-slate-400'}>
                    {view.icon}
                  </div>
                  <span className="hidden md:inline">{view.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content - fills remaining space */}
      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4">
        {activeView === 'evolution' && (
          <FleetEvolution aircraftData={aircraftData} />
        )}

        {activeView === 'area' && (
          <FleetAreaChart aircraftData={aircraftData} />
        )}

        {activeView === 'bubble' && (
          <FleetBubbleChart
            aircraftData={aircraftData}
            onAircraftClick={onAircraftClick}
          />
        )}
      </div>

      {/* Footer hint - compact */}
      <div className="flex-shrink-0 text-center py-2 text-xs text-slate-500 bg-slate-900/50">
        {activeView === 'evolution' && 'Space = Play/Pause | ← → = Navigeer'}
        {activeView === 'area' && 'Hover voor details | Klik diensten om te filteren'}
        {activeView === 'bubble' && 'Klik bubble voor details'}
      </div>
    </div>
  );
};

export default VisualizationDashboard;
