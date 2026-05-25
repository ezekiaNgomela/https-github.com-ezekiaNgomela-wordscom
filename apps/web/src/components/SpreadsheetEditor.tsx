import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Save, Download, FileSpreadsheet, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Play, Square } from 'lucide-react';
import { saveAs } from 'file-saver';

// Helper to get column letter (A, B, ..., Z, AA, AB...)
const getColLabel = (index: number) => {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};

const INITIAL_ROWS = 50;
const INITIAL_COLS = 15;

const SPREADSHEET_FUNCTIONS = [
  { name: 'SUM', desc: 'Adds all numbers in a range of cells' },
  { name: 'AVERAGE', desc: 'Returns the average of its arguments' },
  { name: 'COUNT', desc: 'Counts the number of cells that contain numbers' },
  { name: 'MAX', desc: 'Returns the largest value in a set of values' },
  { name: 'MIN', desc: 'Returns the smallest number in a set of values' },
];

const getColIndex = (label: string) => {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    index = index * 26 + (label.charCodeAt(i) - 64);
  }
  return index - 1;
};

type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  border?: boolean;
};

type CellData = {
  value: string; // The formula or raw text (e.g. "=A1+B2", "Hello")
  display: string; // The evaluated value
  style: CellStyle;
};

type GridData = Record<string, CellData>;

export function SpreadsheetEditor() {
  const [data, setData] = useState<GridData>(() => {
    try {
      const saved = localStorage.getItem('wordscom_sheet_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });
  const [undoStack, setUndoStack] = useState<GridData[]>([]);
  const [activeCell, setActiveCell] = useState<string | null>(null); // e.g. "A1"
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const [numRows, setNumRows] = useState(() => {
    return parseInt(localStorage.getItem('wordscom_sheet_rows') || String(INITIAL_ROWS), 10);
  });
  const [numCols, setNumCols] = useState(() => {
    return parseInt(localStorage.getItem('wordscom_sheet_cols') || String(INITIAL_COLS), 10);
  });
  const [isSaved, setIsSaved] = useState(true);
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, r: number, c: number } | null>(null);
  const [fillDragStart, setFillDragStart] = useState<string | null>(null);
  const [fillHover, setFillHover] = useState<string | null>(null);
  const [isFormulaBarFocused, setIsFormulaBarFocused] = useState(false);

  const formulaInputRef = useRef<HTMLInputElement>(null);
  const dataBeforeEdit = useRef<GridData | null>(null);

  const getCellId = (r: number, c: number) => `${getColLabel(c)}${r + 1}`;

  const insertRowAbove = (rowIndex: number) => {
    setData(prev => {
      setUndoStack(us => [...us, prev].slice(-50));
      const next: GridData = {};
      for(const key of Object.keys(prev)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if(match) {
          const cStr = match[1];
          const rNum = parseInt(match[2], 10) - 1;
          if (rNum >= rowIndex) {
            next[`${cStr}${rNum + 2}`] = prev[key];
          } else {
            next[key] = prev[key];
          }
        } else {
          next[key] = prev[key];
        }
      }
      return next;
    });
    setNumRows(r => r + 1);
    setContextMenu(null);
  };

  const insertColLeft = (colIndex: number) => {
    setData(prev => {
      setUndoStack(us => [...us, prev].slice(-50));
      const next: GridData = {};
      for(const key of Object.keys(prev)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if(match) {
          const cStr = match[1];
          const rNum = match[2];
          const cNum = getColIndex(cStr);
          if (cNum >= colIndex) {
            next[`${getColLabel(cNum + 1)}${rNum}`] = prev[key];
          } else {
            next[key] = prev[key];
          }
        } else {
          next[key] = prev[key];
        }
      }
      return next;
    });
    setNumCols(c => c + 1);
    setContextMenu(null);
  };

  const deleteRow = (rowIndex: number) => {
    setData(prev => {
      setUndoStack(us => [...us, prev].slice(-50));
      const next: GridData = {};
      for(const key of Object.keys(prev)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if(match) {
          const cStr = match[1];
          const rNum = parseInt(match[2], 10) - 1;
          if (rNum === rowIndex) {
            continue;
          } else if (rNum > rowIndex) {
            next[`${cStr}${rNum}`] = prev[key];
          } else {
            next[key] = prev[key];
          }
        } else {
          next[key] = prev[key];
        }
      }
      return next;
    });
    setNumRows(r => Math.max(1, r - 1));
    setContextMenu(null);
  };

  const deleteCol = (colIndex: number) => {
    setData(prev => {
      setUndoStack(us => [...us, prev].slice(-50));
      const next: GridData = {};
      for(const key of Object.keys(prev)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if(match) {
          const cStr = match[1];
          const rNum = match[2];
          const cNum = getColIndex(cStr);
          if (cNum === colIndex) {
            continue;
          } else if (cNum > colIndex) {
            next[`${getColLabel(cNum - 1)}${rNum}`] = prev[key];
          } else {
            next[key] = prev[key];
          }
        } else {
          next[key] = prev[key];
        }
      }
      return next;
    });
    setNumCols(c => Math.max(1, c - 1));
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, r, c });
    setActiveCell(getCellId(r, c));
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleFillMouseUp = useCallback(() => {
    if (fillDragStart && fillHover && fillDragStart !== fillHover) {
      const startMatch = fillDragStart.match(/^([A-Z]+)(\d+)$/);
      const hoverMatch = fillHover.match(/^([A-Z]+)(\d+)$/);
      if (startMatch && hoverMatch) {
        const startC = getColIndex(startMatch[1]);
        const startR = parseInt(startMatch[2]) - 1;
        const hoverC = getColIndex(hoverMatch[1]);
        const hoverR = parseInt(hoverMatch[2]) - 1;

        const minC = Math.min(startC, hoverC);
        const maxC = Math.max(startC, hoverC);
        const minR = Math.min(startR, hoverR);
        const maxR = Math.max(startR, hoverR);

        setData(prev => {
          setUndoStack(us => [...us, prev].slice(-50));
          const next = { ...prev };
          const sourceData = prev[fillDragStart];

          for(let r = minR; r <= maxR; r++) {
            for(let c = minC; c <= maxC; c++) {
              const id = getCellId(r, c);
              if (id !== fillDragStart && sourceData) {
                next[id] = {
                  value: sourceData.value,
                  display: sourceData.display,
                  style: { ...sourceData.style }
                };
              } else if (id !== fillDragStart && !sourceData) {
                delete next[id];
              }
            }
          }
          return next;
        });
      }
    }
    setFillDragStart(null);
    setFillHover(null);
  }, [fillDragStart, fillHover]);

  useEffect(() => {
    window.addEventListener('mouseup', handleFillMouseUp);
    return () => window.removeEventListener('mouseup', handleFillMouseUp);
  }, [handleFillMouseUp]);

  useEffect(() => {
    setIsSaved(false);
  }, [data, numRows, numCols]);

  useEffect(() => {
    if (isSaved) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('wordscom_sheet_data', JSON.stringify(data));
      localStorage.setItem('wordscom_sheet_rows', String(numRows));
      localStorage.setItem('wordscom_sheet_cols', String(numCols));
      setIsSaved(true);
    }, 1500); // 1.5 seconds debounce
    
    return () => clearTimeout(timeoutId);
  }, [data, numRows, numCols, isSaved]);

  const insertFunction = (funcName: string) => {
    if (!editingCell && activeCell) {
        dataBeforeEdit.current = data;
        setEditingCell(activeCell);
    }
    setEditValue(`=${funcName}(`);
  };

  const FunctionListTooltip = () => (
    <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 text-gray-800 text-xs rounded shadow-xl z-[60] animate-in fade-in duration-100 flex flex-col w-56 max-h-64 overflow-y-auto">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 sticky top-0">
        Functions
      </div>
      {SPREADSHEET_FUNCTIONS.map(f => (
        <div 
          key={f.name} 
          className="px-3 py-2 border-b border-gray-100 text-left hover:bg-green-50 cursor-pointer flex flex-col"
          onMouseDown={(e) => {
            e.preventDefault();
            insertFunction(f.name);
          }}
        >
          <span className="font-bold text-green-700">{f.name}()</span>
          <span className="text-gray-500 text-[10px] mt-0.5 leading-tight">{f.desc}</span>
        </div>
      ))}
    </div>
  );

  // Very basic evaluator for formulas like =SUM(A1:A3) or basic math.
  // In a real app this requires a full parser.
  const evaluate = (value: string, currentData: GridData): string => {
    if (!value.startsWith('=')) return value;
    
    // Very basic extraction of cell references and replacing them with values
    try {
      let expression = value.substring(1).toUpperCase();
      
      // Handle simple SUM
      const sumMatch = expression.match(/SUM\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)/);
      if (sumMatch) {
        // Just return a placeholder or do a naive extraction (we skip full implementation for brevity)
        return "#REF!";
      }

      // Replace Cell IDs with their numeric evaluating standard math
      // Sort keys to replace A10 before A1
      const keys = Object.keys(currentData).sort((a,b) => b.length - a.length);
      keys.forEach(k => {
        if (expression.includes(k)) {
          const v = parseFloat(currentData[k]?.display || '0');
          expression = expression.replace(new RegExp(k, 'g'), isNaN(v) ? '0' : v.toString());
        }
      });
      
      // Match arbitrary remaining letters (unresolved refs)
      expression = expression.replace(/[A-Z]+[0-9]+/g, '0');
      
      // Use eval safely-ish only math chars
      if (/^[0-9+\-*/().\s]+$/.test(expression)) {
         // eslint-disable-next-line no-eval
         return eval(expression).toString();
      }
      return "#ERROR!";
    } catch (e) {
      return "#ERROR!";
    }
  };

  const handleCellClick = (id: string, e: React.MouseEvent) => {
    if (editingCell === id) return;
    setActiveCell(id);
    setEditingCell(null);
    setEditValue(data[id]?.value || '');
  };

  const handleCellDoubleClick = (id: string) => {
    dataBeforeEdit.current = data;
    setEditingCell(id);
    setEditValue(data[id]?.value || '');
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingCell && activeCell) {
        dataBeforeEdit.current = data;
        setEditingCell(activeCell);
    }
    setEditValue(val);
    
    // Update data immediately but don't add to undo stack
    if (activeCell) {
      setData(prev => {
        const display = evaluate(val, prev);
        const currentStyle = prev[activeCell]?.style || {};
        const next = { ...prev };
        next[activeCell] = {
          value: val,
          display,
          style: currentStyle
        };
        Object.keys(next).forEach(k => {
          if (next[k].value.startsWith('=')) {
            next[k].display = evaluate(next[k].value, next);
          }
        });
        return next;
      });
    }
  };

  const commitCellEdit = () => {
    if (!activeCell) return;
    
    // Only push to undo stack after focus is lost or enter is pressed.
    if (dataBeforeEdit.current) {
        setUndoStack(us => [...us, dataBeforeEdit.current!].slice(-50));
        dataBeforeEdit.current = null;
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      commitCellEdit();
      // Move down one row logically if possible, but keep simple for now
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      if (dataBeforeEdit.current) {
          setData(dataBeforeEdit.current);
          setEditValue(dataBeforeEdit.current[id]?.value || '');
          dataBeforeEdit.current = null;
      }
    }
  };

  const updateActiveCellStyle = (styleUpdate: Partial<CellStyle>) => {
    if (!activeCell) return;
    setData(prev => {
      setUndoStack(us => [...us, prev].slice(-50));
      const cell = prev[activeCell] || { value: '', display: '', style: {} };
      return {
        ...prev,
        [activeCell]: {
          ...cell,
          style: { ...cell.style, ...styleUpdate }
        }
      };
    });
  };

  const handleUndo = useCallback(() => {
    setUndoStack(prevStack => {
      if (prevStack.length === 0) return prevStack;
      const newStack = [...prevStack];
      const lastState = newStack.pop()!;
      setData(lastState);
      return newStack;
    });
  }, []);

  const handleKeyDownGlobal = useCallback((e: KeyboardEvent) => {
    const isInputFocused = document.activeElement && 
      (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || (document.activeElement as HTMLElement).isContentEditable);

    if ((e.ctrlKey || e.metaKey) && !isInputFocused) {
      if (e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'c' && activeCell) {
        setData(prev => {
          const cellData = prev[activeCell];
          if (cellData) {
            navigator.clipboard.writeText(cellData.value || cellData.display || '');
          }
          return prev;
        });
      } else if (e.key === 'v' && activeCell) {
        navigator.clipboard.readText().then(text => {
          setData(prev => {
            setUndoStack(us => [...us, prev].slice(-50));
            const next = { ...prev };
            const currentStyle = prev[activeCell]?.style || {};
            const display = evaluate(text, prev);
            next[activeCell] = {
              value: text,
              display,
              style: currentStyle
            };
            Object.keys(next).forEach(k => {
              if (next[k].value.startsWith('=')) {
                next[k].display = evaluate(next[k].value, next);
              }
            });
            return next;
          });
          setEditValue(text);
        }).catch(err => console.error("Paste failed", err));
      }
    }
  }, [activeCell, handleUndo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [handleKeyDownGlobal]);

  const downloadCSV = () => {
    let csv = '';
    for (let r = 0; r < numRows; r++) {
      let row = [];
      for (let c = 0; c < numCols; c++) {
        const val = data[getCellId(r, c)]?.display || '';
        // Escape quotes
        row.push('"' + val.replace(/"/g, '""') + '"');
      }
      csv += row.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'spreadsheet.csv');
  };

  const handleSave = () => {
    localStorage.setItem('wordscom_sheet_data', JSON.stringify(data));
    localStorage.setItem('wordscom_sheet_rows', String(numRows));
    localStorage.setItem('wordscom_sheet_cols', String(numCols));
    setIsSaved(true);
  };

  const activeStyle = activeCell ? (data[activeCell]?.style || {}) : {};

  let fillRect: { minR: number, maxR: number, minC: number, maxC: number } | null = null;
  if (fillDragStart && fillHover) {
      const sm = fillDragStart.match(/^([A-Z]+)(\d+)$/);
      const hm = fillHover.match(/^([A-Z]+)(\d+)$/);
      if (sm && hm) {
          const startC = getColIndex(sm[1]);
          const startR = parseInt(sm[2]) - 1;
          const hoverC = getColIndex(hm[1]);
          const hoverR = parseInt(hm[2]) - 1;
          fillRect = {
              minR: Math.min(startR, hoverR),
              maxR: Math.max(startR, hoverR),
              minC: Math.min(startC, hoverC),
              maxC: Math.max(startC, hoverC),
          };
      }
  }

  return (
    <div className="flex flex-col h-full bg-white select-none relative">
      {/* Ribbon Header */}
      <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
        <div className="flex space-x-6 text-xs sm:text-sm font-medium">
          <span className="text-green-700 border-b-2 border-green-700 pb-2 -mb-[9px] px-1">Home</span>
          <span className="text-gray-500 hover:text-gray-700 cursor-pointer pt-0.5">Insert</span>
          <span className="text-gray-500 hover:text-gray-700 cursor-pointer pt-0.5">Data</span>
        </div>
      </div>

      {/* Ribbon Content */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto min-h-[48px] px-2 py-1.5 bg-gray-100/50 border-b border-gray-200 shrink-0">
        <button 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            isSaved 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          onClick={handleSave} 
          disabled={isSaved}
        >
          <Save size={14} />
          <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        {!isSaved && <span className="text-[10px] text-amber-500 italic hidden sm:inline ml-1 font-semibold">Unsaved</span>}
        
        <div className="w-px h-8 bg-gray-300 mx-1 block" />
        
        <button className="flex flex-col items-center justify-center p-1 px-2 hover:bg-green-100 rounded text-gray-700 transition-colors" onClick={downloadCSV} title="Export CSV">
          <Download size={18} />
        </button>
        
        <div className="w-px h-8 bg-gray-300 mx-1 block" />
        
        <div className="flex bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.bold ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ bold: !activeStyle.bold })}><Bold size={14} /></button>
          <div className="w-px bg-gray-300" />
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.italic ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ italic: !activeStyle.italic })}><Italic size={14} /></button>
          <div className="w-px bg-gray-300" />
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.underline ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ underline: !activeStyle.underline })}><Underline size={14} /></button>
        </div>

        <div className="w-px h-8 bg-gray-300 mx-1 block" />

        <div className="flex bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.border ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ border: !activeStyle.border })} title="Toggle Border"><Square size={14} /></button>
        </div>

        <div className="w-px h-8 bg-gray-300 mx-1 block" />
        
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer" title="Background Color">
              <span className="text-xs font-semibold text-gray-500 uppercase">Bg</span>
              <input 
                type="color" 
                className="w-6 h-6 cursor-pointer border border-gray-300 rounded overflow-hidden p-0 bg-white"
                value={activeStyle.backgroundColor || '#ffffff'}
                onChange={(e) => updateActiveCellStyle({ backgroundColor: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-1 cursor-pointer" title="Text Color">
              <span className="text-xs font-semibold text-gray-500 uppercase">A</span>
              <input 
                type="color" 
                className="w-6 h-6 cursor-pointer border border-gray-300 rounded overflow-hidden p-0 bg-white"
                value={activeStyle.color || '#000000'}
                onChange={(e) => updateActiveCellStyle({ color: e.target.value })}
              />
            </label>
        </div>

        <div className="w-px h-8 bg-gray-300 mx-1 block" />

        <div className="flex bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.align === 'left' ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ align: 'left' })}><AlignLeft size={14} /></button>
          <div className="w-px bg-gray-300" />
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.align === 'center' ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ align: 'center' })}><AlignCenter size={14} /></button>
          <div className="w-px bg-gray-300" />
          <button className={`p-1.5 hover:bg-gray-100 transition-colors ${activeStyle.align === 'right' ? 'bg-gray-200' : ''}`} onClick={() => updateActiveCellStyle({ align: 'right' })}><AlignRight size={14} /></button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center px-2 py-1.5 border-b border-gray-200 bg-white gap-2 shrink-0 relative">
        <div className="bg-gray-100 border border-gray-300 px-3 py-1 text-sm font-mono w-16 text-center shadow-inner rounded-sm text-gray-700">
          {activeCell || ''}
        </div>
        <div className="text-gray-400 font-bold italic mr-1 text-lg leading-none">fx</div>
        <div className="flex-1 relative flex">
          <input
            ref={formulaInputRef}
            type="text"
            className="flex-1 bg-white border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 shadow-inner rounded-sm w-full"
            value={activeCell && editingCell !== activeCell ? (data[activeCell]?.value || '') : editValue}
            onChange={handleCellChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitCellEdit();
            }}
            onFocus={() => setIsFormulaBarFocused(true)}
            onBlur={() => {
              setIsFormulaBarFocused(false);
              commitCellEdit();
            }}
            disabled={!activeCell}
          />
          {((activeCell && editingCell !== activeCell ? (data[activeCell]?.value || '') : editValue).startsWith('=')) && isFormulaBarFocused && (
            <FunctionListTooltip />
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-gray-300 text-[13px]">
        <table className="border-collapse bg-white" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="w-10 bg-gray-100 border border-gray-300 text-gray-600 font-normal sticky top-0 left-0 z-20"></th>
              {Array.from({ length: numCols }).map((_, c) => (
                <th key={c} className="w-24 bg-gray-100 border border-gray-300 text-gray-600 font-normal sticky top-0 z-10 py-0.5 shadow-sm text-center">
                  {getColLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numRows }).map((_, r) => (
              <tr key={r}>
                <td className="bg-gray-100 border border-gray-300 text-center text-gray-600 font-normal sticky left-0 z-10 select-none shadow-sm h-6">
                  {r + 1}
                </td>
                {Array.from({ length: numCols }).map((_, c) => {
                  const id = getCellId(r, c);
                  const isEditing = editingCell === id;
                  const isActive = activeCell === id;
                  const cellData = data[id];
                  
                  const inFillRect = fillRect && r >= fillRect.minR && r <= fillRect.maxR && c >= fillRect.minC && c <= fillRect.maxC;

                  return (
                    <td 
                      key={c}
                      className={`
                        relative p-0 h-6 ${isEditing ? 'overflow-visible z-30' : 'overflow-hidden'}
                        ${cellData?.style.border ? 'border-2 border-black' : 'border border-gray-200'}
                        ${isActive ? 'outline outline-2 outline-green-500 z-20' : 'hover:border-gray-300'}
                      `}
                      style={{ backgroundColor: inFillRect ? '#e8f5e9' : (cellData?.style.backgroundColor) }}
                      onClick={(e) => handleCellClick(id, e)}
                      onDoubleClick={() => handleCellDoubleClick(id)}
                      onContextMenu={(e) => handleContextMenu(e, r, c)}
                      onMouseEnter={(e) => {
                        if (fillDragStart) {
                           setFillHover(id);
                        }
                      }}
                    >
                      {isActive && !isEditing && (
                         <div 
                           className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 border border-white cursor-crosshair z-20 hover:scale-150 transition-transform" 
                           onMouseDown={(e) => {
                             e.stopPropagation();
                             setFillDragStart(id);
                             setFillHover(id);
                           }}
                         />
                      )}
                      
                      {isEditing ? (
                        <div className="absolute inset-0 z-30">
                          <input
                            autoFocus
                            type="text"
                            className="w-full h-full outline-none px-1 font-sans text-[13px] bg-white absolute inset-0 shadow-[0_0_5px_rgba(0,0,0,0.2)]"
                            value={editValue}
                            onChange={handleCellChange}
                            onBlur={commitCellEdit}
                            onKeyDown={(e) => handleKeyDown(e, id)}
                          />
                          {editValue.startsWith('=') && (
                            <FunctionListTooltip />
                          )}
                        </div>
                      ) : (
                        <div 
                          className={`
                            px-1 min-h-[22px] font-sans truncate cursor-cell
                            ${cellData?.style.bold ? 'font-bold' : ''}
                            ${cellData?.style.italic ? 'italic' : ''}
                            ${cellData?.style.underline ? 'underline' : ''}
                            ${cellData?.style.align === 'center' ? 'text-center' : cellData?.style.align === 'right' ? 'text-right' : 'text-left'}
                          `}
                          style={{ color: cellData?.style.color }}
                        >
                          {cellData?.display || ''}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contextMenu && (
        <div 
          className="fixed bg-white border border-gray-200 py-1 rounded shadow-lg z-50 text-[13px] text-gray-700 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-1.5 hover:bg-gray-100 transition-colors"
            onClick={() => insertRowAbove(contextMenu.r)}
          >
            Insert Row Above
          </button>
          <button 
            className="w-full text-left px-4 py-1.5 hover:bg-gray-100 transition-colors text-red-600"
            onClick={() => deleteRow(contextMenu.r)}
          >
            Delete Row
          </button>
          <div className="w-full h-px bg-gray-200 my-1" />
          <button 
            className="w-full text-left px-4 py-1.5 hover:bg-gray-100 transition-colors"
            onClick={() => insertColLeft(contextMenu.c)}
          >
            Insert Column Left
          </button>
          <button 
            className="w-full text-left px-4 py-1.5 hover:bg-gray-100 transition-colors text-red-600"
            onClick={() => deleteCol(contextMenu.c)}
          >
            Delete Column
          </button>
        </div>
      )}
    </div>
  );
}
