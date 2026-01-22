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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Terug naar Tijdlijn</span>
            </button>

            {/* Title */}
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-6 h-6 text-orange-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Data Visualisaties
              </h1>
            </div>

            {/* Spacer */}
            <div className="w-40" />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className={activeView === view.id ? 'text-blue-200' : 'text-slate-400'}>
                {view.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold">{view.label}</div>
                <div className={`text-xs ${activeView === view.id ? 'text-blue-200' : 'text-slate-500'}`}>
                  {view.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
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

      {/* Footer hint */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full border border-slate-700 text-sm text-slate-400">
        {activeView === 'evolution' && 'Druk op Space om af te spelen, pijltjes om te navigeren'}
        {activeView === 'area' && 'Hover over de grafiek voor details, klik op diensten om te filteren'}
        {activeView === 'bubble' && 'Klik op een bubble voor vliegtuig details'}
      </div>
    </div>
  );
};

export default VisualizationDashboard;
