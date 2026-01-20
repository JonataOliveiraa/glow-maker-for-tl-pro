import React, { useState, useRef, useEffect } from 'react';

const LayerPanel = ({ layers, activeLayerId, onSelectLayer, onAddLayer, onRemoveLayer, onToggleVisible, onDuplicate, onMoveLayer, width, setWidth }) => {
  const isResizing = useRef(false);

  // Resize Handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      // Limita largura entre 200px e 500px
      const newWidth = Math.max(200, Math.min(500, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setWidth]);

  return (
    <div 
        className="h-full bg-[#111] border-r border-gray-800 flex flex-col z-20 flex-shrink-0 relative group"
        style={{ width: `${width}px` }}
    >
       {/* Conteúdo */}
       <div className="p-4 border-b border-gray-800 bg-[#141414] flex justify-between items-center">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <i className="ri-stack-line"></i> Camadas
           </h2>
           <span className="text-[9px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">{layers.length}</span>
       </div>

       <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll bg-[#0f0f0f]">
           {[...layers].reverse().map((layer, reverseIndex) => {
               const realIndex = layers.length - 1 - reverseIndex;
               return (
               <div 
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className={`
                      relative p-2 rounded cursor-pointer border transition-all flex items-center justify-between group/item
                      ${activeLayerId === layer.id ? 'bg-[#1f1f1f] border-cyan-700/50' : 'bg-transparent border-transparent hover:bg-[#1a1a1a] hover:border-gray-800'}
                  `}
               >
                   <div className="flex items-center gap-3 overflow-hidden">
                       <div className="flex flex-col gap-0.5 opacity-30 group-hover/item:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); onMoveLayer(realIndex, 1); }} className="hover:text-white text-gray-600"><i className="ri-arrow-up-s-fill text-xs block -mb-1"></i></button>
                           <button onClick={(e) => { e.stopPropagation(); onMoveLayer(realIndex, -1); }} className="hover:text-white text-gray-600"><i className="ri-arrow-down-s-fill text-xs block -mt-1"></i></button>
                       </div>

                       <div className="w-8 h-8 bg-black rounded border border-gray-800 flex items-center justify-center relative">
                            <div className="w-full h-full opacity-50" style={{backgroundColor: layer.color}}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className={`text-white text-xs ${["ri-focus-3-line", "ri-donut-chart-line", "ri-cloudy-line", "ri-star-line", "ri-shape-2-line"][layer.shapeMode]}`}></i>
                            </div>
                       </div>
                       
                       <div className="flex flex-col min-w-0">
                           <span className={`text-xs font-semibold truncate ${activeLayerId === layer.id ? 'text-gray-100' : 'text-gray-500'}`}>
                               {layer.name || `Layer ${realIndex + 1}`}
                           </span>
                           <span className="text-[9px] text-gray-600 uppercase">
                               {["Centro", "Anel", "Nebula", "Estrela", "Polígono"][layer.shapeMode]}
                           </span>
                       </div>
                   </div>

                   <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleVisible(layer.id); }}
                            className={`p-1.5 rounded hover:bg-gray-800 transition-colors ${layer.visible ? 'text-gray-500 hover:text-white' : 'text-gray-700'}`}
                        >
                            <i className={layer.visible ? "ri-eye-line" : "ri-eye-off-line"}></i>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDuplicate(layer.id); }}
                            className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-900/10 rounded transition-colors"
                            title="Duplicar"
                        >
                            <i className="ri-file-copy-line"></i>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/10 rounded transition-colors"
                            title="Excluir"
                        >
                            <i className="ri-delete-bin-7-line"></i>
                        </button>
                   </div>
               </div>
           )})}
       </div>

       <div className="p-3 border-t border-gray-800 bg-[#141414]">
           <button 
              onClick={onAddLayer}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded text-xs uppercase font-bold transition-all flex items-center justify-center gap-2"
           >
              <i className="ri-add-line"></i> Nova Camada
           </button>
       </div>

       {/* RESIZE HANDLE */}
       <div 
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-30"
          onMouseDown={() => { isResizing.current = true; document.body.style.cursor = 'col-resize'; }}
       />
    </div>
  );
};

export default LayerPanel;