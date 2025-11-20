import React from 'react';
import { CargoItem, ContainerType } from '../types';
import { Trash2, Plus, Play, RefreshCw, Box, Download, Rotate3D, Settings, Scale, AlertTriangle } from 'lucide-react';

interface SidebarProps {
  containers: ContainerType[];
  selectedContainer: string;
  onSelectContainer: (id: string) => void;
  items: CargoItem[];
  onUpdateItem: (index: number, field: keyof CargoItem, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSimulate: () => void;
  onClear: () => void;
  onDownload: () => void;
  isSimulating: boolean;
  gap: number;
  setGap: (val: number) => void;
  weightUtil: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  containers,
  selectedContainer,
  onSelectContainer,
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onSimulate,
  onClear,
  onDownload,
  isSimulating,
  gap,
  setGap,
  weightUtil
}) => {
  const selectedC = containers.find(c => c.id === selectedContainer);

  return (
    <div className="w-[400px] bg-white border-r border-slate-200 h-full flex flex-col shadow-xl font-sans z-20">
      <div className="px-6 py-5 border-b border-slate-100 bg-white">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
          <div className="bg-blue-600 text-white p-1.5 rounded-md">
             <Box size={20} />
          </div>
          CargoSim <span className="text-blue-600">Pro</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 pl-1">Advanced Load Planning System</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
        
        {/* 1. Container Select */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">01</span>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Container Selection</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {containers.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectContainer(c.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm relative overflow-hidden
                  ${selectedContainer === c.id 
                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold ${selectedContainer === c.id ? 'text-blue-700' : 'text-slate-700'}`}>{c.name}</span>
                    {selectedContainer === c.id && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{c.length}x{c.width}x{c.height}mm</span>
                  <span>Max: {(c.maxWeight/1000).toFixed(1)}T</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Parameters */}
         <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-slate-400" />
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Parameters</h2>
              </div>
           </div>
           <div className="flex items-center justify-between gap-4">
              <label className="text-xs text-slate-600 font-medium">Stacking Gap (mm)</label>
              <div className="flex items-center">
                <input 
                    type="number" 
                    value={gap} 
                    onChange={(e) => setGap(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
           </div>
         </section>
         
         {/* Weight Util Bar */}
         {weightUtil > 0 && (
           <section className={`p-4 rounded-xl border shadow-sm ${weightUtil > 100 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex justify-between items-center mb-1">
                 <span className={`text-xs font-bold ${weightUtil > 100 ? 'text-red-700' : 'text-emerald-700'}`}>Weight Load</span>
                 <span className={`text-xs font-mono font-bold ${weightUtil > 100 ? 'text-red-700' : 'text-emerald-700'}`}>{weightUtil.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                 <div 
                    className={`h-full rounded-full ${weightUtil > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(weightUtil, 100)}%` }}
                 ></div>
              </div>
              {weightUtil > 100 && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-red-600 font-bold">
                      <AlertTriangle size={12} /> Overweight! Items may be rejected.
                  </div>
              )}
           </section>
         )}

        {/* 3. Cargo List */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">02</span>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cargo Manifest</h2>
            </div>
            <button 
              onClick={onClear}
              className="text-[11px] font-medium text-slate-500 hover:text-red-600 transition flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
            >
              Reset List
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm group hover:shadow-md hover:border-blue-200 transition-all duration-200">
                
                {/* Header Line */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Color Picker */}
                    <div className="w-8 h-8 rounded-lg shadow-sm relative overflow-hidden ring-1 ring-black/5 flex-shrink-0">
                       <input 
                        type="color" 
                        value={item.color}
                        onChange={(e) => onUpdateItem(idx, 'color', e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0"
                       />
                    </div>
                    
                    <div className="flex-1">
                         <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => onUpdateItem(idx, 'name', e.target.value)}
                        className="block w-full text-sm font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 placeholder-slate-300"
                        placeholder="Item Name"
                        />
                         <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(idx)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="col-span-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">L</label>
                    <input 
                      type="number" 
                      value={item.length}
                      onChange={(e) => onUpdateItem(idx, 'length', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono text-slate-700 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">W</label>
                    <input 
                      type="number" 
                      value={item.width}
                      onChange={(e) => onUpdateItem(idx, 'width', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono text-slate-700 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">H</label>
                    <input 
                      type="number" 
                      value={item.height}
                      onChange={(e) => onUpdateItem(idx, 'height', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono text-slate-700 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[9px] uppercase font-bold text-blue-600 block mb-1">Qty</label>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-xs font-bold text-blue-700 text-center focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                 {/* Weight Row */}
                 <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="col-span-1 relative">
                         <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Weight (kg)</label>
                         <input 
                          type="number" 
                          value={item.weight}
                          onChange={(e) => onUpdateItem(idx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono text-slate-700 focus:bg-white focus:border-blue-500 outline-none pl-6"
                        />
                        <Scale size={10} className="absolute left-2 top-[22px] text-slate-400" />
                    </div>
                 </div>

                {/* Toggles */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                   <label className="flex items-center cursor-pointer gap-2 select-none group-hover:text-blue-600 transition-colors">
                      <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={item.allowRotation}
                            onChange={() => onUpdateItem(idx, 'allowRotation', !item.allowRotation)}
                        />
                        <div className={`w-8 h-4 rounded-full shadow-inner transition-colors ${item.allowRotation ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${item.allowRotation ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                         <Rotate3D size={12} /> Allow Rotation
                      </span>
                   </label>
                </div>
              </div>
            ))}

            <button 
              onClick={onAddItem}
              className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 text-xs font-bold uppercase tracking-wide transition flex justify-center items-center gap-2"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-slate-200 bg-white space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <button 
          onClick={onSimulate}
          disabled={isSimulating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm"
        >
          {isSimulating ? (
             <>
              <RefreshCw size={18} className="animate-spin" /> Calculating...
             </>
          ) : (
             <>
              <Play size={18} fill="currentColor" /> Generate Load Plan
             </>
          )}
        </button>

        <button 
          onClick={onDownload}
          disabled={isSimulating || items.length === 0}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 rounded-xl transition flex justify-center items-center gap-2 text-xs shadow-sm"
        >
          <Download size={14} /> Export Report (.CSV)
        </button>
      </div>
    </div>
  );
};