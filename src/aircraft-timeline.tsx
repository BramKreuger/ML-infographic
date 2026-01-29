import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Info, Plane, Loader2, ZoomIn, ZoomOut, TrendingUp, Target } from 'lucide-react';
import * as XLSX from 'xlsx';
import { fetchAircraftInfo } from './services/ipmsService';
import FleetAreaChart from './components/FleetAreaChart';
import FleetBubbleChart from './components/FleetBubbleChart';

type ViewType = 'timeline' | 'area' | 'bubble';

// Type definitions
interface Aircraft {
  name: string;
  user: string;
  startYear: number;
  endYear: number;
  totalCount: number;
  klu: number;
  mld: number;
  mlknil: number;
  notes: string;
  museum: string;
  wreckAssessment: number;
  foto: string;
  localImage: string;
  preservationStatus: string;
  aircraftType: string; // vliegtuig, helikopter, drijvervliegtuig, vliegboot, UAV
}

interface AircraftInfoImageData {
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  description?: string;
  title?: string;
  language?: string;
  isSchematic?: boolean;
  attribution?: {
    required?: boolean;
    text: string;
    license: string;
    link: string;
  };
}

interface AircraftInfo {
  story: string;
  imageUrl: string | null;
  imageData?: AircraftInfoImageData | null;
  source: string;
  sourceUrl: string;
}

const AircraftTimeline = () => {
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [selectedUser, setSelectedUser] = useState('Alle');
  const [selectedPreservation, setSelectedPreservation] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredAircraft, setHoveredAircraft] = useState<string | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.8);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 600 });
  const timelineContainerRef = React.useRef<HTMLDivElement | null>(null);
  const yearMarkersRef = React.useRef<HTMLDivElement | null>(null);
  const periodBannerRef = React.useRef<HTMLDivElement | null>(null);

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar {
      overscroll-behavior-x: contain;
      overscroll-behavior-y: contain;
    }
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

  // Historical periods for Dutch military aviation
  const historicalPeriods = [
    {
      name: 'Oprichting & WO1',
      startYear: 1913,
      endYear: 1918,
      color: 'rgba(239, 68, 68, 0.06)', // Red for war - more subtle
      borderColor: 'rgba(239, 68, 68, 0.15)',
      description: 'Oprichting Luchtvaartafdeling (LVA) en Eerste Wereldoorlog'
    },
    {
      name: 'Interbellum',
      startYear: 1918,
      endYear: 1939,
      color: 'rgba(34, 197, 94, 0.05)', // Green for peace - more subtle
      borderColor: 'rgba(34, 197, 94, 0.15)',
      description: 'Groei en ontwikkeling tussen de wereldoorlogen'
    },
    {
      name: 'WO2',
      startYear: 1939,
      endYear: 1945,
      color: 'rgba(220, 38, 38, 0.08)', // Dark red for war - more subtle
      borderColor: 'rgba(220, 38, 38, 0.2)',
      description: 'Tweede Wereldoorlog'
    },
    {
      name: 'Indonesië',
      startYear: 1945,
      endYear: 1949,
      color: 'rgba(249, 115, 22, 0.06)', // Orange - more subtle
      borderColor: 'rgba(249, 115, 22, 0.15)',
      description: 'Indonesische Onafhankelijkheidsoorlog'
    },
    {
      name: 'Koude Oorlog',
      startYear: 1949,
      endYear: 1991,
      color: 'rgba(59, 130, 246, 0.05)', // Blue for cold war - more subtle
      borderColor: 'rgba(59, 130, 246, 0.15)',
      description: 'NATO-periode en Koude Oorlog'
    },
    {
      name: 'Post-Koude Oorlog',
      startYear: 1991,
      endYear: 2001,
      color: 'rgba(168, 85, 247, 0.05)', // Purple - more subtle
      borderColor: 'rgba(168, 85, 247, 0.15)',
      description: 'Nieuwe wereldorde na val van de Berlijnse Muur'
    },
    {
      name: 'Modern',
      startYear: 2001,
      endYear: 2025,
      color: 'rgba(14, 165, 233, 0.05)', // Sky blue - more subtle
      borderColor: 'rgba(14, 165, 233, 0.15)',
      description: 'War on Terror en moderne conflicten'
    }
  ];

  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [aircraftInfo, setAircraftInfo] = useState<AircraftInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [selectedType, setSelectedType] = useState('Alle');
  const [activeView, setActiveView] = useState<ViewType>('timeline');

  // Generate IPMS search link
  const getIPMSSearchLink = (aircraftName: string) => {
    return `https://www.ipms.nl/zoeken?searchword=${encodeURIComponent(aircraftName)}`;
  };

  // Handle aircraft click - fetch info from IPMS via OpenAI
  const handleAircraftClick = async (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setAircraftInfo(null); // Reset previous info
    setIsLoadingInfo(true);

    // Priority: Local image > Foto column > Wikipedia scraper
    // Check local image FIRST before any external calls
    let finalImageUrl: string | null = null;
    let finalImageData: AircraftInfoImageData | null = null;

    // 1. Try local image first (from data_v2.xlsx.files folder)
    if (aircraft.localImage) {
      try {
        const response = await fetch(aircraft.localImage);
        if (response.ok) {
          finalImageUrl = aircraft.localImage;
          finalImageData = {
            url: aircraft.localImage,
            attribution: {
              required: false,
              text: 'Collectie Nederlandse Militaire Luchtvaart',
              link: '#',
              license: ''
            }
          } as AircraftInfoImageData;
        }
      } catch (e) {
        console.log(`Local image not found for ${aircraft.name}, checking other sources`);
      }
    }

    // 2. If no local image, try Foto column from Excel
    if (!finalImageUrl && aircraft.foto && aircraft.foto.trim() !== '') {
      finalImageUrl = aircraft.foto;
      finalImageData = {
        url: aircraft.foto,
        attribution: {
          required: false,
          text: 'Foto uit database',
          link: aircraft.foto,
          license: ''
        }
      } as AircraftInfoImageData;
    }

    try {
      // Fetch story info (external CORS calls are disabled, uses cache/fallback)
      const info = await fetchAircraftInfo(aircraft.name);

      // Use local image if found, otherwise fall back to info.imageUrl (if any)
      setAircraftInfo({
        ...info,
        imageUrl: finalImageUrl || info.imageUrl,
        imageData: finalImageData || info.imageData
      });

    } catch (error) {
      console.error('Error loading aircraft info:', error);

      // Even on error, show local image if available
      setAircraftInfo({
        story: finalImageUrl ? 'Geen verhaal beschikbaar.' : 'Er ging iets mis bij het ophalen van de informatie. Probeer het later opnieuw.',
        imageUrl: finalImageUrl,
        imageData: finalImageData || undefined,
        source: finalImageUrl ? 'Lokale collectie' : 'Error',
        sourceUrl: 'https://www.ipms.nl/artikelen/nedmil-luchtvaart'
      });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  // Categorize preservation status
  const categorizePreservation = (wreckMuseum: string, wreckAssessment: number): string => {
    if (!wreckMuseum || wreckMuseum === 'Geen resten') {
      return 'lost';
    }

    const lowerText = wreckMuseum.toLowerCase();

    if (lowerText.includes('vliegend') || lowerText.includes('flying')) {
      return 'flying';
    }
    if (lowerText.includes('museum') || lowerText.includes('aviodrome') || lowerText.includes('nmm')) {
      return 'preserved';
    }
    if (lowerText.includes('wrak') || lowerText.includes('wreck') || wreckAssessment > 0) {
      return 'wreck';
    }

    return 'other';
  };

  // Process Excel data from ArrayBuffer
  const processExcelData = (arrayBuffer: ArrayBuffer): Aircraft[] => {
    const workbook = XLSX.read(arrayBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(firstSheet);

    let rowIndex = 0; // Track actual data row index for image mapping

    const cleaned = rawData
      .filter((a: any) => a.Typenaam && a['Jaar invoering'])
      .map((a: any): Aircraft => {
        rowIndex++; // Increment for each valid aircraft row

        const startYear = a['Jaar invoering'];
        let endYear = a['Jaar uit dienst'];

        // Handle "heden" or empty endYear
        if (!endYear || endYear === 'heden' || isNaN(endYear)) {
          endYear = 2025;
        }

        // If endYear === startYear, add 1 year minimum visibility
        if (endYear === startYear) {
          endYear = startYear + 1;
        }

        const wreckMuseum = a['Wrak - museaal - vliegend'] || '';
        const wreckAssessment = a['Wrak assesment'] || 0;
        const foto = a.Foto || '';
        const aircraftType = a.type || a.Type || 'vliegtuig';

        // Generate image path based on row index (image001.jpg, image002.jpg, etc.)
        const imageNumber = String(rowIndex).padStart(3, '0');
        const localImagePath = `/data_v2.xlsx.files/image${imageNumber}.jpg`;

        return {
          name: a.Typenaam,
          user: a.Gebruikers || 'Onbekend',
          startYear: startYear,
          endYear: endYear,
          totalCount: a.Totaal || a['Aantal Klu'] || 0,
          klu: a['Aantal Klu'] || 0,
          mld: a['Aantal MLD'] || 0,
          mlknil: a['Aantal MLKNIL'] || 0,
          notes: a.Bijzonderheden || '',
          museum: wreckMuseum,
          wreckAssessment: wreckAssessment,
          foto: foto,
          localImage: localImagePath,
          preservationStatus: categorizePreservation(wreckMuseum, wreckAssessment),
          aircraftType: aircraftType
        };
      });

    return cleaned;
  };

  // Auto-load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch('/data_v3.xlsx');
        if (!response.ok) {
          throw new Error('Kon het Excel bestand niet laden. Zorg ervoor dat data_v2.xlsx in de public folder staat.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = processExcelData(arrayBuffer);
        setAircraftData(data);
      } catch (error: any) {
        console.error('Error loading data:', error);
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (timelineContainerRef.current) {
        setContainerSize({
          width: timelineContainerRef.current.offsetWidth,
          height: timelineContainerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
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
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLDivElement;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // Prevent scrolling past the end
    if (container.scrollLeft > maxScroll) {
      container.scrollLeft = maxScroll;
      return;
    }

    const scrollLeft = container.scrollLeft;
    setScrollLeft(scrollLeft);

    // Sync year markers and period banner horizontal scroll
    if (yearMarkersRef.current) {
      yearMarkersRef.current.scrollLeft = scrollLeft;
    }
    if (periodBannerRef.current) {
      periodBannerRef.current.scrollLeft = scrollLeft;
    }
  };

  // Mouse wheel zoom handler
  const handleWheel = (e: WheelEvent) => {
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
  const getUserColor = (user: string): string => {
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

  // Get wreck assessment gradient overlay color
  const getWreckAssessmentColor = (assessment: number, preservationStatus: string): string => {
    if (preservationStatus === 'flying') {
      return 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, transparent 100%)'; // Green for flying
    }
    if (preservationStatus === 'preserved') {
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, transparent 100%)'; // Blue for museum
    }
    if (assessment > 0) {
      // Orange gradient intensity based on assessment (0-52 scale)
      const intensity = Math.min(assessment / 52, 1);
      return `linear-gradient(135deg, rgba(251, 146, 60, ${0.2 + intensity * 0.4}) 0%, transparent 100%)`;
    }
    return 'transparent';
  };

  // Get aircraft type info (icon and color)
  const getAircraftTypeInfo = (type: string): { icon: string; label: string; color: string } => {
    const typeMap: { [key: string]: { icon: string; label: string; color: string } } = {
      'vliegtuig': { icon: '✈️', label: 'Vliegtuig', color: 'rgba(59, 130, 246, 0.3)' },
      'helikopter': { icon: '🚁', label: 'Helikopter', color: 'rgba(168, 85, 247, 0.3)' },
      'drijvervliegtuig': { icon: '🛩️', label: 'Drijvervliegtuig', color: 'rgba(14, 165, 233, 0.3)' },
      'vliegboot': { icon: '🚤', label: 'Vliegboot', color: 'rgba(6, 182, 212, 0.3)' },
      'UAV': { icon: '🎮', label: 'UAV/Drone', color: 'rgba(239, 68, 68, 0.3)' },
      'vliegtuig - drijvervliegtuig': { icon: '🛩️', label: 'Vliegtuig/Drijver', color: 'rgba(14, 165, 233, 0.3)' },
    };
    return typeMap[type.toLowerCase()] || typeMap['vliegtuig'];
  };

  // Filter data
  const filteredData = useMemo(() => {
    return aircraftData.filter(aircraft => {
      const matchesUser = selectedUser === 'Alle' || aircraft.user.includes(selectedUser);
      const matchesSearch = aircraft.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPreservation = selectedPreservation === 'Alle' ||
        (selectedPreservation === 'Bewaard' && (aircraft.preservationStatus === 'preserved' || aircraft.preservationStatus === 'flying')) ||
        (selectedPreservation === 'Vliegend' && aircraft.preservationStatus === 'flying') ||
        (selectedPreservation === 'Wrakken' && aircraft.preservationStatus === 'wreck') ||
        (selectedPreservation === 'Verloren' && aircraft.preservationStatus === 'lost');
      const matchesType = selectedType === 'Alle' || aircraft.aircraftType.toLowerCase().includes(selectedType.toLowerCase());
      return matchesUser && matchesSearch && matchesPreservation && matchesType;
    });
  }, [aircraftData, selectedUser, searchTerm, selectedPreservation, selectedType]);

  // Get unique aircraft types for filter
  const uniqueTypes = useMemo((): string[] => {
    const types = new Set<string>();
    aircraftData.forEach(a => {
      if (a.aircraftType) types.add(a.aircraftType);
    });
    return ['Alle', ...Array.from(types).sort()];
  }, [aircraftData]);

  // Prevent scroll beyond boundaries using requestAnimationFrame
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    let animationFrameId: number | null = null;

    const clampScroll = () => {
      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);

      // Clamp horizontal scroll
      if (container.scrollLeft < 0) {
        container.scrollLeft = 0;
      } else if (container.scrollLeft > maxScrollLeft) {
        container.scrollLeft = maxScrollLeft;
      }

      // Clamp vertical scroll
      if (container.scrollTop < 0) {
        container.scrollTop = 0;
      } else if (container.scrollTop > maxScrollTop) {
        container.scrollTop = maxScrollTop;
      }
    };

    const handleScrollClamp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(clampScroll);
    };

    container.addEventListener('scroll', handleScrollClamp, { passive: true });

    // Also clamp on zoom changes
    clampScroll();

    return () => {
      container.removeEventListener('scroll', handleScrollClamp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [zoomLevel, containerSize.width, filteredData.length]);

  // Get unique users for filter
  const uniqueUsers = useMemo((): string[] => {
    const users = new Set<string>();
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
  const minYear = 1917;
  const maxYear = 2025;
  const yearRange = maxYear - minYear;

  // Dynamic height and width based on zoom
  const baseWidth = containerSize.width; // At 1x zoom, timeline fills container exactly
  const timelineWidth = baseWidth * zoomLevel;

  // Calculate actual needed height
  const neededHeight = filteredData.length * 25 + 30;
  const timelineHeight = Math.max(neededHeight, containerSize.height); // Always show all aircraft

  // Calculate position
  const getXPosition = (year: number): number => {
    return ((year - minYear) / yearRange) * 100;
  };

  // Generate year markers based on zoom level
  const getYearMarkers = (): number[] => {
    let interval: number;
    if (zoomLevel >= 2.5) interval = 10; // Very zoomed in - every 10 years
    else if (zoomLevel >= 1.5) interval = 20; // Medium zoom - every 20 years
    else interval = 30; // Zoomed out - every 30 years

    const markers: number[] = [];
    for (let year = Math.ceil(minYear / interval) * interval; year <= maxYear; year += interval) {
      markers.push(year);
    }
    return markers;
  };

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.reduce((sum, a) => sum + a.totalCount, 0);
    const preserved = filteredData.filter(a => a.preservationStatus === 'preserved' || a.preservationStatus === 'flying').length;
    const flying = filteredData.filter(a => a.preservationStatus === 'flying').length;
    const wrecks = filteredData.filter(a => a.preservationStatus === 'wreck').length;

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
      preserved,
      flying,
      wrecks,
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
      {/* Header with Tabs */}
      <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto w-full px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-orange-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Nederlandse Militaire Luchtvaart
              </h1>
              <span className="text-slate-400 text-sm ml-2">1917-2025</span>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeView === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>Tijdlijn</span>
              </button>
              <button
                onClick={() => setActiveView('area')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeView === 'area'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Vlootsterkte</span>
              </button>
              <button
                onClick={() => setActiveView('bubble')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeView === 'bubble'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Bubble Analyse</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <>
          {/* Controls */}
          <div className="max-w-7xl mx-auto w-full px-6 pb-3">
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

            {/* Preservation Filter */}
            <div className="relative">
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <select
                value={selectedPreservation}
                onChange={(e) => setSelectedPreservation(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="Alle">Alle status</option>
                <option value="Bewaard">Bewaard</option>
                <option value="Vliegend">Vliegend</option>
                <option value="Wrakken">Wrakken</option>
                <option value="Verloren">Verloren</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm pointer-events-none">✈️</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'Alle' ? 'Alle types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
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
              <div className="flex items-center gap-1">
                <span className="font-bold text-green-400">{stats.preserved}</span>
                <span className="text-slate-400">bewaard</span>
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
      <div className="w-full px-6 flex-1 flex flex-col min-h-0 mb-8">
        <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700 overflow-hidden flex-1 flex flex-col relative">
          {/* Period Labels - STICKY BANNER */}
          <div
            ref={periodBannerRef}
            className="year-markers-container sticky top-0 left-0 right-0 h-7 border-b border-slate-600/50 bg-slate-900/95 backdrop-blur z-30 overflow-x-hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="relative h-full" style={{ width: `${timelineWidth}px` }}>
              {historicalPeriods.map((period) => {
                const startX = getXPosition(period.startYear);
                const endX = getXPosition(period.endYear);
                const width = endX - startX;
                const isHovered = hoveredPeriod === period.name;

                return (
                  <div
                    key={period.name}
                    className="absolute top-0 bottom-0 cursor-pointer transition-all duration-200"
                    style={{
                      left: `${startX}%`,
                      width: `${width}%`,
                      borderRight: `1px solid ${period.borderColor}`
                    }}
                    onMouseEnter={() => setHoveredPeriod(period.name)}
                    onMouseLeave={() => setHoveredPeriod(null)}
                  >
                    <div
                      className={`h-full flex items-center justify-center px-2 transition-all duration-200 ${
                        isHovered ? 'bg-white/10' : ''
                      }`}
                      style={{
                        backgroundColor: isHovered ? period.color.replace('0.15', '0.3') : 'transparent'
                      }}
                    >
                      <span className={`text-[10px] font-semibold transition-all duration-200 ${
                        isHovered ? 'text-white scale-105' : 'text-slate-400'
                      }`}>
                        {period.name}
                      </span>
                    </div>

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-40 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <div className="text-xs text-white font-semibold">{period.name}</div>
                        <div className="text-[10px] text-slate-300">{period.startYear} - {period.endYear}</div>
                        <div className="text-[10px] text-slate-400 mt-1 max-w-xs">{period.description}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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
              {/* Period Background Zones */}
              <div className="absolute top-0 left-0 z-0" style={{ width: `${timelineWidth}px`, height: `${timelineHeight}px` }}>
                {historicalPeriods.map((period) => {
                  const startX = getXPosition(period.startYear);
                  const endX = getXPosition(period.endYear);
                  const width = endX - startX;

                  return (
                    <div
                      key={`bg-${period.name}`}
                      className="absolute top-0"
                      style={{
                        left: `${startX}%`,
                        width: `${width}%`,
                        height: `${timelineHeight}px`,
                        backgroundColor: period.color,
                        borderRight: `1px solid ${period.borderColor}`
                      }}
                    />
                  );
                })}
              </div>

              {/* Aircraft bars */}
              <div className="absolute top-0 left-0 z-10" style={{ width: `${timelineWidth}px` }}>
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
                        boxShadow: isHovered ? `0 0 20px ${color}` : 'none',
                        backgroundImage: getWreckAssessmentColor(aircraft.wreckAssessment, aircraft.preservationStatus)
                      }}
                    />

                    {/* Label with type icon */}
                    <div
                      className={`absolute left-1 top-0 h-full flex items-center gap-1 text-xs font-medium transition-opacity duration-200 ${
                        shouldShowLabel ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      <span className="text-[10px] opacity-80">{getAircraftTypeInfo(aircraft.aircraftType).icon}</span>
                      <span>{aircraft.name}</span>
                    </div>

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute left-0 top-6 z-50 bg-slate-900 border border-slate-600 rounded-lg p-4 shadow-xl w-96">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getAircraftTypeInfo(aircraft.aircraftType).icon}</span>
                            <div className="font-bold text-xl text-blue-400">{aircraft.name}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {aircraft.preservationStatus === 'flying' && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-semibold">Vliegend</span>
                            )}
                            {aircraft.preservationStatus === 'preserved' && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-semibold">Museum</span>
                            )}
                            {aircraft.preservationStatus === 'wreck' && aircraft.wreckAssessment > 0 && (
                              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-semibold">🔧 {aircraft.wreckAssessment}</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">Type:</span>
                            <span className="font-medium text-slate-300 capitalize">{aircraft.aircraftType}</span>
                          </div>
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
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-orange-400 text-sm font-semibold">🏛️ Museum:</span>
                                {aircraft.wreckAssessment > 0 && (
                                  <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">{aircraft.wreckAssessment}/52</span>
                                )}
                              </div>
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

      {/* Collapsible Footer - Legend & Minimap */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 shadow-2xl z-40 transition-all duration-500 ease-in-out"
        style={{
          height: isFooterExpanded ? 'auto' : '24px',
          maxHeight: isFooterExpanded ? '50vh' : '24px'
        }}
        onMouseEnter={() => setIsFooterExpanded(true)}
        onMouseLeave={() => setIsFooterExpanded(false)}
      >
        {/* Collapsed state - thin bar with hint and credits */}
        {!isFooterExpanded && (
          <div className="h-6 flex items-center justify-between px-4 cursor-pointer">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Info className="w-3 h-3" />
              <span>Hover voor legenda & overzicht</span>
            </div>
            <div className="text-xs text-slate-400">
              Door:{' '}
              <a href="https://www.linkedin.com/in/bram-kreuger-6ab96a160/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Bram Kreuger</a>
              {' '}& <a href="https://www.linkedin.com/in/baskreuger/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Bas Kreuger</a>
              {' '}| <a href="https://www.cultureelerfgoed.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">RCE</a>
            </div>
          </div>
        )}

        {/* Expanded state */}
        {isFooterExpanded && (
          <div className="max-w-7xl mx-auto p-4 overflow-y-auto max-h-[50vh]">
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
                  {[1920, 1960, 2000].map(year => (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Colors */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-sm">Gebruikers</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
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

              {/* Aircraft Types */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">✈️</span>
                  <span className="font-semibold text-sm">Vliegtuigtypes</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { icon: '✈️', label: 'Vliegtuig' },
                    { icon: '🚁', label: 'Helikopter' },
                    { icon: '🛩️', label: 'Drijvervliegtuig' },
                    { icon: '🚤', label: 'Vliegboot' },
                    { icon: '🎮', label: 'UAV / Drone' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-sm w-4">{item.icon}</span>
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preservation Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-sm">Behouds Status</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-3 rounded" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, transparent 100%)' }} />
                    <span className="text-xs text-slate-300">Nog vliegend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-3 rounded" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, transparent 100%)' }} />
                    <span className="text-xs text-slate-300">In museum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-3 rounded" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.4) 0%, transparent 100%)' }} />
                    <span className="text-xs text-slate-300">Wrakken/resten</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-3 rounded bg-slate-700/30" />
                    <span className="text-xs text-slate-300">Geen resten</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits in expanded state */}
            <div className="mt-4 pt-3 border-t border-slate-700 text-center text-xs text-slate-400">
              Website gebouwd door:{' '}
              <a href="https://www.linkedin.com/in/bram-kreuger-6ab96a160/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Bram Kreuger</a>
              {' '}| Onderzoek en data verzameling door:{' '}
              <a href="https://www.linkedin.com/in/baskreuger/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Bas Kreuger</a>
              {' '}| In opdracht van de{' '}
              <a href="https://www.cultureelerfgoed.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">RCE</a>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* Area Chart View */}
      {activeView === 'area' && (
        <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4">
          <FleetAreaChart aircraftData={aircraftData} />
        </div>
      )}

      {/* Bubble Chart View */}
      {activeView === 'bubble' && (
        <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4">
          <FleetBubbleChart
            aircraftData={aircraftData}
            onAircraftClick={handleAircraftClick}
          />
        </div>
      )}

      {/* Credits Footer */}
      <div className="flex-shrink-0 bg-slate-900/95 border-t border-slate-700 py-2 px-4 text-center text-xs text-slate-400">
        Website gebouwd door:{' '}
        <a href="https://www.linkedin.com/in/bram-kreuger-6ab96a160/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
          Bram Kreuger
        </a>
        {' '}| Onderzoek en data verzameling door:{' '}
        <a href="https://www.linkedin.com/in/baskreuger/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
          Bas Kreuger
        </a>
        {' '}| In opdracht van de{' '}
        <a href="https://www.cultureelerfgoed.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 hover:underline">
          RCE
        </a>
      </div>

      {/* Aircraft Info Panel */}
      {selectedAircraft && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
          setSelectedAircraft(null);
          setAircraftInfo(null);
        }}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-blue-500/50 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getAircraftTypeInfo(selectedAircraft.aircraftType).icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAircraft.name}</h2>
                  <p className="text-blue-100 text-sm">{selectedAircraft.user} • <span className="capitalize">{selectedAircraft.aircraftType}</span></p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAircraft(null);
                  setAircraftInfo(null);
                }}
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
                  <div className="mt-3 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-orange-400 text-sm font-semibold">🏛️ Museum & Behoud</div>
                      {selectedAircraft.wreckAssessment > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Wrak score:</span>
                          <span className="text-xs font-bold text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
                            {selectedAircraft.wreckAssessment}/52
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">{selectedAircraft.museum}</p>
                    {selectedAircraft.preservationStatus === 'flying' && (
                      <div className="mt-2 flex items-center gap-1 text-green-400 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold">Nog vliegend</span>
                      </div>
                    )}
                    {selectedAircraft.preservationStatus === 'preserved' && (
                      <div className="mt-2 flex items-center gap-1 text-blue-400 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-semibold">In museum bewaard</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI-Generated Story */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Verhaal</h3>
                </div>

                {isLoadingInfo && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <span className="ml-3 text-slate-300">Informatie wordt opgehaald...</span>
                  </div>
                )}

                {!isLoadingInfo && aircraftInfo && (
                  <div className="space-y-4">
                    {/* Image with Attribution */}
                    {aircraftInfo.imageUrl && aircraftInfo.imageData && (
                      <div className="rounded-lg overflow-hidden border border-slate-600 bg-slate-900/50">
                        <img
                          src={aircraftInfo.imageUrl}
                          alt={aircraftInfo.imageData.description || selectedAircraft.name}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {aircraftInfo.imageData.attribution && (
                          <div className="p-2 bg-slate-800/80 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <a
                                href={aircraftInfo.imageData.attribution.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 underline"
                              >
                                {aircraftInfo.imageData.attribution.text}
                              </a>
                              <span className="mx-1">•</span>
                              <span>{aircraftInfo.imageData.attribution.license}</span>
                              {aircraftInfo.imageData.isSchematic && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span className="text-orange-400">Schematische tekening</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Story */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-4 border border-slate-600">
                      <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                        {aircraftInfo.story}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-slate-400">Bron:</span>
                          <a
                            href={aircraftInfo.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs font-semibold underline ${
                              aircraftInfo.source.includes('IPMS') ? 'text-blue-400 hover:text-blue-300' :
                              aircraftInfo.source.includes('Wikipedia') ? 'text-green-400 hover:text-green-300' :
                              'text-orange-400 hover:text-orange-300'
                            }`}
                          >
                            {aircraftInfo.source}
                          </a>
                        </div>
                        {aircraftInfo.source.includes('AI Kennis') && (
                          <p className="text-[10px] text-slate-500 italic ml-5">
                            Geen online bron beschikbaar - gegenereerd uit AI kennis
                          </p>
                        )}
                      </div>
                    </div>

                    {/* IPMS Links */}
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
                        Meer op IPMS.nl
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
                        Alfabetische lijst
                      </a>
                    </div>
                  </div>
                )}

                {!isLoadingInfo && !aircraftInfo && (
                  <div className="text-center py-8 text-slate-400">
                    Klik op een vliegtuig om informatie te laden
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AircraftTimeline;