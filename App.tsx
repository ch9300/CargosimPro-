import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Container3D } from './components/Container3D';
import { CONTAINERS, DEFAULT_ITEMS, COLORS } from './constants';
import { CargoItem, PlacedItem, PackResult, Point3D } from './types';
import { calculatePacking } from './services/packer';
import { Sliders } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [containerId, setContainerId] = useState<string>(CONTAINERS[2].id); // Default 40HQ
  const [items, setItems] = useState<CargoItem[]>(DEFAULT_ITEMS);
  const [gap, setGap] = useState<number>(20); // Default 20mm gap
  
  // Simulation Results
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [cog, setCog] = useState<Point3D | undefined>(undefined);
  const [stats, setStats] = useState<{ vol: number; count: number; rate: number; weightRate: number }>({ vol: 0, count: 0, rate: 0, weightRate: 0 });
  
  // Animation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const currentContainer = CONTAINERS.find(c => c.id === containerId) || CONTAINERS[0];

  // Handlers
  const handleAddItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: 'New Item',
      length: 500,
      width: 400,
      height: 300,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      quantity: 10,
      weight: 15,
      allowRotation: true
    }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleUpdateItem = (index: number, field: keyof CargoItem, value: any) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleClear = () => {
    setItems([]);
    setPlacedItems([]);
    setVisibleCount(0);
    setCog(undefined);
    setStats({ vol: 0, count: 0, rate: 0, weightRate: 0 });
  };

  const handleDownloadReport = () => {
    if (placedItems.length === 0) return;

    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Step,Instance ID,Item Name,Dimensions (LxWxH),Weight (kg),Position (X,Y,Z),Volume (m3)\n";

    // CSV Rows
    placedItems.forEach((item, index) => {
      const vol = (item.length * item.width * item.height) / 1e9;
      // Coordinate correction for export (Bottom-Left-Front based on corner)
      const startX = (item.position[0] + currentContainer.length / 2 - item.length / 2).toFixed(0);
      const startY = (item.position[1] + currentContainer.height / 2 - item.height / 2).toFixed(0);
      const startZ = (item.position[2] + currentContainer.width / 2 - item.width / 2).toFixed(0);

      const row = [
        index + 1,
        item.id,
        item.name,
        `${item.length}x${item.width}x${item.height}`,
        item.weight,
        `${startX},${startY},${startZ}`,
        vol.toFixed(4)
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `loading_plan_${currentContainer.name.replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    setVisibleCount(0);
    setPlacedItems([]);
    setCog(undefined);

    // Small delay to allow UI to render loading state
    setTimeout(() => {
      const result: PackResult = calculatePacking(currentContainer, items, gap);
      setPlacedItems(result.placedItems);
      setCog(result.centerOfGravity);
      setStats({
        vol: parseFloat((result.volumeUtilization).toFixed(1)),
        count: result.itemCount,
        rate: parseFloat(result.volumeUtilization.toFixed(1)),
        weightRate: result.weightUtilization
      });
      
      // Auto-Animation Logic
      let current = 0;
      const total = result.placedItems.length;
      const intervalTime = Math.max(2, Math.min(30, 1500 / total));

      if (total === 0) {
        setIsSimulating(false);
        return;
      }

      const timer = setInterval(() => {
        current += 1;
        if (total > 200) current += 2;
        
        if(current > total) current = total;
        setVisibleCount(current);
        
        if (current >= total) {
          clearInterval(timer);
          setIsSimulating(false);
        }
      }, intervalTime);
    }, 100);
  }, [currentContainer, items, gap]);

  // Initial Run
  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] text-slate-800 overflow-hidden font-sans">
      <Sidebar 
        containers={CONTAINERS}
        selectedContainer={containerId}
        onSelectContainer={setContainerId}
        items={items}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateItem={handleUpdateItem}
        onSimulate={runSimulation}
        onClear={handleClear}
        onDownload={handleDownloadReport}
        isSimulating={isSimulating}
        gap={gap}
        setGap={setGap}
        weightUtil={stats.weightRate}
      />

      <main className="flex-1 relative flex flex-col h-full">
        <div className="flex-1 relative z-0 shadow-inner bg-slate-50/50">
          <Container3D 
            container={currentContainer} 
            items={placedItems} 
            visibleCount={visibleCount}
            cog={cog}
          />
        </div>

        {/* Floating HUD - Professional Style */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
           <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl px-8 py-4 shadow-xl shadow-slate-200/50 flex gap-10 text-slate-700 ring-1 ring-slate-900/5">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Volume Util</div>
                <div className="text-3xl font-bold tracking-tight text-blue-600">{stats.rate}%</div>
              </div>
              <div className="w-px bg-slate-200"></div>
               <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Weight Util</div>
                <div className={`text-3xl font-bold tracking-tight ${stats.weightRate > 100 ? 'text-red-600' : 'text-emerald-600'}`}>
                   {stats.weightRate.toFixed(1)}%
                </div>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Status</div>
                <div className="text-xl font-bold flex items-center gap-2 mt-1">
                  {isSimulating ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                      <span className="text-blue-600 text-lg">Processing</span>
                    </>
                  ) : (
                    <>
                      <span className={`h-3 w-3 rounded-full ${stats.weightRate > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                      <span className={`${stats.weightRate > 100 ? 'text-red-600' : 'text-emerald-600'} text-lg`}>
                          {stats.weightRate > 100 ? 'Overweight' : 'Optimal'}
                      </span>
                    </>
                  )}
                </div>
              </div>
           </div>
        </div>
        
        {/* Timeline Control (Step Slider) - UX Improvement */}
        {placedItems.length > 0 && !isSimulating && (
           <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 w-96 bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Sliders size={14} /> Loading Sequence
                 </span>
                 <span className="text-xs font-mono font-bold text-blue-600">
                    Step {visibleCount} / {placedItems.length}
                 </span>
              </div>
              <input 
                 type="range" 
                 min="0" 
                 max={placedItems.length} 
                 value={visibleCount} 
                 onChange={(e) => setVisibleCount(parseInt(e.target.value))}
                 className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
           </div>
        )}

        <div className="absolute bottom-6 right-6 z-10">
          <div className="bg-white/90 backdrop-blur text-slate-500 text-[10px] font-medium px-4 py-2 rounded-full shadow-lg border border-slate-100 select-none">
             Left Click: Rotate <span className="mx-1 text-slate-300">|</span> Right Click: Pan <span className="mx-1 text-slate-300">|</span> Scroll: Zoom
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;