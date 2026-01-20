import React, { useRef } from 'react';

const SpritesheetModal = ({ isOpen, onClose, spriteList, setSpriteList, onAddCurrent, onExport, onClear }) => {
  if (!isOpen) return null;

  const shapeNames = ["Centro", "Anel", "Nebulosa", "Estrela", "GeoCircle"];
  
  // Referência para o item sendo arrastado
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // --- LÓGICA DE DRAG AND DROP ---
  const handleDragStart = (e, position) => {
    dragItem.current = position;
    // Efeito visual (opcional)
    e.target.style.opacity = '0.5';
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSort = () => {
    // Copia a lista atual
    let _spriteList = [...spriteList];
    
    // Remove o item da posição original
    const draggedItemContent = _spriteList.splice(dragItem.current, 1)[0];
    
    // Insere na nova posição
    _spriteList.splice(dragOverItem.current, 0, draggedItemContent);
    
    // Atualiza o estado
    setSpriteList(_spriteList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md flex flex-col h-[80vh]">
        
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800 rounded-t-lg">
          <h2 className="text-lg font-bold text-cyan-400">🎞️ Editor (Coluna)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <button 
            onClick={onAddCurrent}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md mb-4 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span> Adicionar Atual
          </button>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
             <h3 className="text-xs uppercase text-gray-500 font-bold mb-2">
                 Arraste para reordenar ({spriteList.length})
             </h3>
             
             {spriteList.length === 0 ? (
                 <div className="p-8 border-2 border-dashed border-gray-700 rounded text-center text-gray-600">
                     Lista vazia.
                 </div>
             ) : (
                <ul className="space-y-2">
                    {spriteList.map((item, index) => (
                        <li 
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Necessário para permitir o drop
                            onDrop={handleSort}
                            className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between items-center cursor-move hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-mono text-xs">#{index + 1}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-200 font-bold">{shapeNames[item.shapeMode]}</span>
                                    <span className="text-[10px] text-gray-400">Seed: {item.seed.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="w-6 h-6 rounded-full border border-gray-500 shadow-inner" style={{backgroundColor: item.color}}></div>
                        </li>
                    ))}
                </ul>
             )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-800 rounded-b-lg flex gap-3">
           <button onClick={onClear} className="px-3 py-2 border border-red-800 text-red-500 hover:bg-red-900/30 rounded text-sm">Limpar</button>
           <button 
             onClick={onExport}
             disabled={spriteList.length === 0}
             className={`flex-1 py-2 font-bold rounded text-sm uppercase tracking-wider transition-colors
                 ${spriteList.length === 0 ? 'bg-gray-700 text-gray-500' : 'bg-green-600 hover:bg-green-500 text-white'}`}
           >
             Exportar Coluna
           </button>
        </div>

      </div>
    </div>
  );
};

export default SpritesheetModal;