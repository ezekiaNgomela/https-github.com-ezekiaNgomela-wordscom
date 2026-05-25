import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Copy, MoveUp, MoveDown, 
  Presentation, Play, Monitor, Undo2, Layout, Square, 
  Circle, HelpCircle, Palette, Download, Upload, Bold, 
  Italic, AlignLeft, AlignCenter, AlignRight, Type, 
  FileImage, Settings, Type as TypeIcon 
} from 'lucide-react';

interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  text?: string;
  shapeType?: 'rect' | 'circle' | 'triangle';
  url?: string;
  x: number; // % x coordinate (0 to 100)
  y: number; // % y coordinate (0 to 100)
  w: number; // % width (0 to 100)
  h: number; // % height (0 to 100)
  color?: string;
  bgColor?: string;
  borderColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface Slide {
  id: string;
  bgColor: string;
  bgGradient?: string;
  textColor: string;
  elements: SlideElement[];
}

interface PresentationEditorProps {
  onBack: () => void;
}

const THEMES = [
  { name: 'Prism Slate', bg: '#0f172a', gradient: 'linear-gradient(135deg, #0f172a, #1e293b)', text: '#ffffff', color: 'Slate' },
  { name: 'Emerald Peak', bg: '#064e3b', gradient: 'linear-gradient(135deg, #064e3b, #022c22)', text: '#f0fdf4', color: 'Emerald' },
  { name: 'Sunset Glow', bg: '#7c2d12', gradient: 'linear-gradient(135deg, #7c2d12, #4c1d95)', text: '#fdf6f0', color: 'Sunset' },
  { name: 'Corporate Blue', bg: '#1e3a8a', gradient: 'linear-gradient(135deg, #1e3a8a, #0f172a)', text: '#f0f9ff', color: 'Navy' },
  { name: 'Warm Minimalist', bg: '#fafaf9', gradient: 'linear-gradient(135deg, #fafaf9, #f5f5f4)', text: '#1c1917', color: 'Stone' },
  { name: 'Charcoal Modern', bg: '#171717', gradient: 'linear-gradient(135deg, #171717, #262626)', text: '#fafafa', color: 'Dark Gray' }
];

const INITIAL_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    bgColor: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    textColor: '#ffffff',
    elements: [
      {
        id: 'el-title',
        type: 'text',
        text: 'Dynamic Slides Platform',
        fontSize: 48,
        bold: true,
        align: 'center',
        color: '#38bdf8',
        x: 10, y: 25, w: 80, h: 20
      },
      {
        id: 'el-sub',
        type: 'text',
        text: 'A Powerful, Ribbon-based Presentation Suite',
        fontSize: 22,
        bold: false,
        align: 'center',
        color: '#e2e8f0',
        x: 15, y: 48, w: 70, h: 12
      },
      {
        id: 'el-decor-1',
        type: 'shape',
        shapeType: 'rect',
        bgColor: '#0ea5e9',
        x: 45, y: 65, w: 10, h: 1
      },
      {
        id: 'el-author',
        type: 'text',
        text: 'Double click any element to edit text & properties',
        fontSize: 14,
        align: 'center',
        color: '#94a3b8',
        x: 20, y: 80, w: 60, h: 8
      }
    ]
  },
  {
    id: 'slide-2',
    bgColor: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    textColor: '#ffffff',
    elements: [
      {
        id: 'el-s2-title',
        type: 'text',
        text: 'Core Platform Features',
        fontSize: 36,
        bold: true,
        align: 'left',
        color: '#38bdf8',
        x: 10, y: 12, w: 80, h: 12
      },
      {
        id: 'el-box-1',
        type: 'shape',
        shapeType: 'rect',
        bgColor: '#1e293b',
        borderColor: '#0284c7',
        x: 10, y: 30, w: 36, h: 48
      },
      {
        id: 'el-b1-title',
        type: 'text',
        text: '⚡ Interactive Ribbon',
        fontSize: 18,
        bold: true,
        color: '#38bdf8',
        x: 12, y: 34, w: 32, h: 8
      },
      {
        id: 'el-b1-body',
        type: 'text',
        text: 'Fast alignment toolbars, shape customizers, color Pickers & file managers integrated in one single high-efficiency row.',
        fontSize: 14,
        align: 'left',
        color: '#cbd5e1',
        x: 12, y: 44, w: 32, h: 30
      },
      {
        id: 'el-box-2',
        type: 'shape',
        shapeType: 'rect',
        bgColor: '#1e293b',
        borderColor: '#10b981',
        x: 54, y: 30, w: 36, h: 48
      },
      {
        id: 'el-b2-title',
        type: 'text',
        text: '📽️ High-Fidelity Show',
        fontSize: 18,
        bold: true,
        color: '#34d399',
        x: 56, y: 34, w: 32, h: 8
      },
      {
        id: 'el-b2-body',
        type: 'text',
        text: 'Launch an immersive landscape mode slideshow. Drive transitions via spacebar, arrow keys, or custom floating panels.',
        fontSize: 14,
        align: 'left',
        color: '#cbd5e1',
        x: 56, y: 44, w: 32, h: 30
      }
    ]
  }
];

export function PresentationEditor({ onBack }: PresentationEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const saved = localStorage.getItem('wordscom_presentation_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SLIDES;
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Design' | 'View'>('Home');
  const [title, setTitle] = useState(() => {
    return localStorage.getItem('wordscom_presentation_title') || 'Quarterly Strategy';
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  
  // Slide Show Mode states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);

  // Mouse drag & resize states for elements
  const [dragState, setDragState] = useState<{
    elementId: string;
    isDragging: boolean;
    isResizing: boolean;
    handle?: 'nw' | 'ne' | 'se' | 'sw';
    startX: number;
    startY: number;
    startElementX: number;
    startElementY: number;
    startElementW: number;
    startElementH: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Save current state to LocalStorage
  const handleSave = () => {
    localStorage.setItem('wordscom_presentation_data', JSON.stringify(slides));
    localStorage.setItem('wordscom_presentation_title', title);
    setIsSaved(true);
  };

  // Auto-save debounce effect
  useEffect(() => {
    if (isSaved) return;
    const t = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(t);
  }, [slides, title, isSaved]);

  const activeSlide = slides[activeSlideIndex] || slides[0] || INITIAL_SLIDES[0];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  // Add Slide
  const addSlide = (layout: 'title' | 'title-body' | 'blank') => {
    const defaultColor = activeSlide ? activeSlide.bgColor : '#0f172a';
    const defaultGradient = activeSlide ? activeSlide.bgGradient : 'linear-gradient(135deg, #0f172a, #1e293b)';
    const defaultText = activeSlide ? activeSlide.textColor : '#ffffff';
    
    let elements: SlideElement[] = [];
    if (layout === 'title') {
      elements = [
        {
          id: `el-${Date.now()}-t1`,
          type: 'text',
          text: 'New Slide Title',
          fontSize: 40,
          bold: true,
          align: 'center',
          color: '#38bdf8',
          x: 10, y: 30, w: 80, h: 15
        },
        {
          id: `el-${Date.now()}-t2`,
          type: 'text',
          text: 'Add custom supportive subtitle details here',
          fontSize: 18,
          align: 'center',
          color: '#e2e8f0',
          x: 15, y: 50, w: 70, h: 10
        }
      ];
    } else if (layout === 'title-body') {
      elements = [
        {
          id: `el-${Date.now()}-tb1`,
          type: 'text',
          text: 'Focus Topics Heading',
          fontSize: 32,
          bold: true,
          align: 'left',
          color: '#38bdf8',
          x: 10, y: 15, w: 80, h: 12
        },
        {
          id: `el-${Date.now()}-tb2`,
          type: 'text',
          text: '• Point 1: Create interactive slide decks inside the browser.\n• Point 2: Click to select elements, drag to position, or grab corners to scale.\n• Point 3: Double click any item to custom label it fully.',
          fontSize: 18,
          align: 'left',
          color: '#94a3b8',
          x: 10, y: 35, w: 80, h: 45
        }
      ];
    }

    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      bgColor: defaultColor,
      bgGradient: defaultGradient,
      textColor: defaultText,
      elements
    };

    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
    setSelectedElementId(null);
    setIsSaved(false);
  };

  // Duplicate Slide
  const duplicateSlide = () => {
    const duplicated: Slide = JSON.parse(JSON.stringify(activeSlide));
    duplicated.id = `slide-dup-${Date.now()}`;
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, duplicated);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
    setSelectedElementId(null);
    setIsSaved(false);
  };

  // Delete Slide
  const deleteSlide = () => {
    if (slides.length <= 1) {
      alert("At least one slide must remain in presentation.");
      return;
    }
    const newSlides = slides.filter((_, idx) => idx !== activeSlideIndex);
    setSlides(newSlides);
    const nextIndex = Math.max(0, activeSlideIndex - 1);
    setActiveSlideIndex(nextIndex);
    setSelectedElementId(null);
    setIsSaved(false);
  };

  // Move slide up/down
  const moveSlide = (direction: 'up' | 'down') => {
    if (direction === 'up' && activeSlideIndex === 0) return;
    if (direction === 'down' && activeSlideIndex === slides.length - 1) return;

    const swapIndex = direction === 'up' ? activeSlideIndex - 1 : activeSlideIndex + 1;
    const newSlides = [...slides];
    const temp = newSlides[activeSlideIndex];
    newSlides[activeSlideIndex] = newSlides[swapIndex];
    newSlides[swapIndex] = temp;
    setSlides(newSlides);
    setActiveSlideIndex(swapIndex);
    setIsSaved(false);
  };

  // Update specific element within active slide
  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    setSlides(prev => prev.map((sl, sIdx) => {
      if (sIdx !== activeSlideIndex) return sl;
      return {
        ...sl,
        elements: sl.elements.map(el => {
          if (el.id !== elementId) return el;
          return { ...el, ...updates };
        })
      };
    }));
    setIsSaved(false);
  };

  // Add Element to Active Slide
  const addElement = (type: 'text' | 'shape' | 'image', detail?: string) => {
    let newElement: SlideElement = {
      id: `el-${Date.now()}`,
      type,
      x: 35,
      y: 40,
      w: 30,
      h: 15,
      color: activeSlide.textColor,
      align: 'center'
    };

    if (type === 'text') {
      newElement.text = 'Double-click to type text';
      newElement.fontSize = 20;
    } else if (type === 'shape') {
      newElement.shapeType = (detail as any) || 'rect';
      newElement.bgColor = '#38bdf8';
      newElement.borderColor = '#0284c7';
      newElement.w = 20;
      newElement.h = 20;
    } else if (type === 'image') {
      const url = window.prompt("Enter image URL:", "https://picsum.photos/400/300");
      if (!url) return;
      newElement.type = 'image';
      newElement.url = url;
      newElement.w = 40;
      newElement.h = 30;
    }

    const updatedSlides = slides.map((sl, idx) => {
      if (idx !== activeSlideIndex) return sl;
      return {
        ...sl,
        elements: [...sl.elements, newElement]
      };
    });
    setSlides(updatedSlides);
    setSelectedElementId(newElement.id);
    setIsSaved(false);
  };

  // Delete active selected element
  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setSlides(prev => prev.map((sl, idx) => {
      if (idx !== activeSlideIndex) return sl;
      return {
        ...sl,
        elements: sl.elements.filter(el => el.id !== selectedElementId)
      };
    }));
    setSelectedElementId(null);
    setEditingTextElementId(null);
    setIsSaved(false);
  };

  // Quick Apply Theme style to Presentation
  const applyTheme = (theme: typeof THEMES[0]) => {
    setSlides(prev => prev.map(sl => ({
      ...sl,
      bgColor: theme.bg,
      bgGradient: theme.gradient,
      textColor: theme.text,
      elements: sl.elements.map(el => {
        // Adapt text colors to theme if they are basic
        if (el.type === 'text' && (el.color === '#ffffff' || el.color === '#1c1917')) {
          return { ...el, color: theme.text };
        }
        return el;
      })
    })));
    setIsSaved(false);
  };

  // Handle Drag / Resize events via Canvas bounding rectangle
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (editingTextElementId) return; // Ignore dragging while text-editing
    
    // Clear selection if clicking directly on empty canvas
    if (e.target === canvasRef.current) {
      setSelectedElementId(null);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: SlideElement, handle?: 'nw' | 'ne' | 'se' | 'sw') => {
    e.stopPropagation();
    if (editingTextElementId === el.id) return;

    setSelectedElementId(el.id);

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    setDragState({
      elementId: el.id,
      isDragging: !handle,
      isResizing: !!handle,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: el.x,
      startElementY: el.y,
      startElementW: el.w,
      startElementH: el.h
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !canvasRef.current) return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragState.startX) / canvasBounds.width) * 100;
    const deltaY = ((e.clientY - dragState.startY) / canvasBounds.height) * 100;

    let nextX = dragState.startElementX;
    let nextY = dragState.startElementY;
    let nextW = dragState.startElementW;
    let nextH = dragState.startElementH;

    if (dragState.isDragging) {
      nextX = Math.max(0, Math.min(100 - dragState.startElementW, dragState.startElementX + deltaX));
      nextY = Math.max(0, Math.min(100 - dragState.startElementH, dragState.startElementY + deltaY));
      updateElement(dragState.elementId, { x: parseFloat(nextX.toFixed(2)), y: parseFloat(nextY.toFixed(2)) });
    } else if (dragState.isResizing && dragState.handle) {
      const handle = dragState.handle;
      if (handle === 'se') {
        nextW = Math.max(5, Math.min(100 - dragState.startElementX, dragState.startElementW + deltaX));
        nextH = Math.max(3, Math.min(100 - dragState.startElementY, dragState.startElementH + deltaY));
      } else if (handle === 'sw') {
        nextX = Math.max(0, Math.min(dragState.startElementX + dragState.startElementW - 5, dragState.startElementX + deltaX));
        nextW = Math.max(5, dragState.startElementW - (nextX - dragState.startElementX));
        nextH = Math.max(3, Math.min(100 - dragState.startElementY, dragState.startElementH + deltaY));
      } else if (handle === 'nw') {
        nextX = Math.max(0, Math.min(dragState.startElementX + dragState.startElementW - 5, dragState.startElementX + deltaX));
        nextW = Math.max(5, dragState.startElementW - (nextX - dragState.startElementX));
        nextY = Math.max(0, Math.min(dragState.startElementY + dragState.startElementH - 3, dragState.startElementY + deltaY));
        nextH = Math.max(3, dragState.startElementH - (nextY - dragState.startElementY));
      } else if (handle === 'ne') {
        nextW = Math.max(5, Math.min(100 - dragState.startElementX, dragState.startElementW + deltaX));
        nextY = Math.max(0, Math.min(dragState.startElementY + dragState.startElementH - 3, dragState.startElementY + deltaY));
        nextH = Math.max(3, dragState.startElementH - (nextY - dragState.startElementY));
      }

      updateElement(dragState.elementId, { 
        x: parseFloat(nextX.toFixed(2)), 
        y: parseFloat(nextY.toFixed(2)), 
        w: parseFloat(nextW.toFixed(2)), 
        h: parseFloat(nextH.toFixed(2)) 
      });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  // Keyboard Slide Show Controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (playIndex < slides.length - 1) {
            setPlayIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          e.preventDefault();
          if (playIndex > 0) {
            setPlayIndex(prev => prev - 1);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, playIndex, slides.length]);

  const selectedElement = activeSlide.elements.find(el => el.id === selectedElementId);

  const startPresentation = (fromStart = true) => {
    setPlayIndex(fromStart ? 0 : activeSlideIndex);
    setIsPlaying(true);
  };

  const RibbonButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label?: string, onClick: () => void, active?: boolean }) => (
    <button
      onClick={onClick}
      className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 p-1 px-1.5 sm:px-2 sm:py-1 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'text-gray-700'}`}
      title={label}
    >
      {icon}
      {label && <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap hidden sm:inline-block">{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 text-gray-800 font-sans select-none overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* 2-Row Consolidated Header & Ribbon Panel */}
      <div className="sticky top-0 z-30 bg-white shadow-sm flex flex-col shrink-0 border-b border-gray-200">
        
        {/* Unified Title Bar / Row 1 */}
        <div className="px-3 py-1.5 flex items-center justify-between bg-zinc-900 text-white shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <button 
              onClick={onBack} 
              className="p-1 px-1.5 hover:bg-white/10 rounded-md text-gray-200 transition-colors flex items-center gap-1 shrink-0 active:scale-95"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-medium hidden md:inline">Dashboard</span>
            </button>
            <div className="w-px h-4 bg-zinc-700 mx-1 block hidden md:block" />
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Presentation size={15} className="text-orange-500 fill-orange-500 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 hidden lg:inline shrink-0">PowerPoint</span>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="text-xs sm:text-sm font-semibold bg-transparent border-0 ring-0 focus:outline-none focus:ring-1 focus:ring-orange-500 px-1 py-0.5 rounded cursor-pointer w-[120px] sm:w-[180px] lg:w-[240px] truncate text-white placeholder-zinc-500 hover:bg-zinc-800"
                placeholder="Presentation Title"
              />
            </div>
          </div>

          {/* Quick Tabs in Title Row */}
          <div className="flex items-center gap-0.5 border-l border-zinc-700 ml-2 px-1">
            {(['Home', 'Insert', 'Design', 'View'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 sm:px-3 py-0.5 text-xs font-bold rounded transition-all ${
                  activeTab === tab 
                    ? 'bg-orange-500 text-white shadow-sm font-bold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status indicators */}
            <span className="hidden md:inline-block text-[10px] text-zinc-400">
              {isSaved ? '● Saved to cloud' : '○ Changes unsaved'}
            </span>
            <button
              onClick={handleSave}
              className={`p-1 px-2.5 sm:py-1 text-xs rounded font-medium flex items-center gap-1 ${
                isSaved 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow'
              }`}
              disabled={isSaved}
            >
              <Save size={13} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => startPresentation(true)}
              className="p-1 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow transition-colors"
            >
              <Play size={13} fill="white" />
              <span>Present</span>
            </button>
          </div>
        </div>

        {/* Ribbon Active Content / Row 2 */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar min-h-[40px] max-h-[44px] px-3 py-1 bg-zinc-100 border-b border-zinc-200">
          
          {activeTab === 'Home' && (
            <>
              <span className="text-[9px] uppercase font-bold text-zinc-500 px-1 select-none hidden lg:block">Slides</span>
              <RibbonButton icon={<Plus size={15} />} label="Add Content Slide" onClick={() => addSlide('title-body')} />
              <RibbonButton icon={<Plus size={15} />} label="Add Title Slide" onClick={() => addSlide('title')} />
              <RibbonButton icon={<Copy size={15} />} label="Duplicate Slide" onClick={duplicateSlide} />
              <RibbonButton icon={<Trash2 size={15} className="text-red-500" />} label="Delete Slide" onClick={deleteSlide} />
              
              <div className="w-px h-5 bg-zinc-300 mx-1 block flex-shrink-0" />
              <span className="text-[9px] uppercase font-bold text-zinc-500 px-1 select-none hidden lg:block">Order</span>
              <RibbonButton icon={<MoveUp size={15} />} label="Slide Up" onClick={() => moveSlide('up')} />
              <RibbonButton icon={<MoveDown size={15} />} label="Slide Down" onClick={() => moveSlide('down')} />
              
              {selectedElement && (
                <>
                  <div className="w-px h-5 bg-zinc-300 mx-1 block flex-shrink-0" />
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 flex-shrink-0">
                    Object {selectedElement.type} Active
                  </span>
                  {selectedElement.type === 'text' && (
                    <>
                      <RibbonButton 
                        icon={<Bold size={15} />} 
                        active={selectedElement.bold}
                        onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })} 
                      />
                      <RibbonButton 
                        icon={<Italic size={15} />} 
                        active={selectedElement.italic}
                        onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })} 
                      />
                      <div className="flex items-center gap-1">
                        <select
                          value={selectedElement.fontSize || 14}
                          onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                          className="bg-white text-xs border border-zinc-300 rounded px-1.5 py-0.5 outline-none font-semibold cursor-pointer text-zinc-700"
                        >
                          {[12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64].map(sz => (
                            <option key={sz} value={sz}>{sz}px</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-zinc-200 p-1 py-0.5 rounded transition-colors text-zinc-700">
                        <Palette size={14} />
                        <input
                          type="color"
                          value={selectedElement.color || '#000000'}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                          className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                  {selectedElement.type === 'shape' && (
                    <>
                      <div className="flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200 px-1 py-0.5 rounded text-zinc-700">
                        <span className="text-[10px] font-semibold">Fill</span>
                        <input
                          type="color"
                          value={selectedElement.bgColor || '#38bdf8'}
                          onChange={(e) => updateElement(selectedElement.id, { bgColor: e.target.value })}
                          className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200 px-1 py-0.5 rounded text-zinc-700">
                        <span className="text-[10px] font-semibold">Border</span>
                        <input
                          type="color"
                          value={selectedElement.borderColor || '#38bdf8'}
                          onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                          className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                  <RibbonButton icon={<Trash2 size={14} className="text-red-500" />} label="Delete Element" onClick={deleteSelectedElement} />
                </>
              )}
            </>
          )}

          {activeTab === 'Insert' && (
            <>
              <span className="text-[9px] uppercase font-bold text-zinc-500 px-1 select-none hidden lg:block">Insert Content</span>
              <RibbonButton icon={<Type size={16} />} label="Add Text Box" onClick={() => addElement('text')} />
              <RibbonButton icon={<Square size={15} />} label="Rectangle" onClick={() => addElement('shape', 'rect')} />
              <RibbonButton icon={<Circle size={15} />} label="Circle" onClick={() => addElement('shape', 'circle')} />
              <RibbonButton icon={<FileImage size={15} />} label="Image URL" onClick={() => addElement('image')} />
            </>
          )}

          {activeTab === 'Design' && (
            <div className="flex items-center gap-2 overflow-x-auto w-full">
              <span className="text-[9px] uppercase font-bold text-zinc-500 px-1 select-none shrink-0 hidden lg:block">Slide Themes</span>
              {THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border hover:brightness-105 active:scale-95 transition-all text-white shadow-sm outline-none shrink-0"
                  style={{ background: theme.gradient || theme.bg, color: theme.text, borderColor: theme.text + '33' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.text }} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'View' && (
            <>
              <span className="text-[9px] uppercase font-bold text-zinc-500 px-1 select-none hidden lg:block">Transitions Menu</span>
              <RibbonButton icon={<Play size={15} />} label="Slideshow From Start" onClick={() => startPresentation(true)} />
              <RibbonButton icon={<Monitor size={15} />} label="From Selected Slide" onClick={() => startPresentation(false)} />
              <div className="w-px h-5 bg-zinc-300 mx-1 block" />
              <div className="text-[11px] text-zinc-500 italic max-w-sm shrink-0">
                Tip: Press <kbd className="px-1 py-0.5 bg-zinc-200 border rounded font-mono text-[9px]">Space</kbd> or <kbd className="px-1 py-0.5 bg-zinc-200 border rounded font-mono text-[9px]">Enter</kbd> to transition slides during playback.
              </div>
            </>
          )}

        </div>
      </div>

      {/* Editor Inner Layout: Sidebar List left + Slide Sandbox Center */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left Thumbs List */}
        <div className="w-[110px] sm:w-[150px] border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto p-2 gap-3 pb-8 select-none">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider sticky top-0 bg-white py-1">
            Slides {slides.length}
          </div>
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              onClick={() => {
                setActiveSlideIndex(idx);
                setSelectedElementId(null);
                setEditingTextElementId(null);
              }}
              className={`group flex flex-col rounded p-1 border cursor-pointer hover:border-orange-300 transition-all ${
                activeSlideIndex === idx 
                  ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-100' 
                  : 'border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="flex justify-between items-center px-1 mb-1 text-[10px] text-zinc-400 font-medium">
                <span>{idx + 1}</span>
                <span className="opacity-0 group-hover:opacity-100 text-orange-600 font-bold text-[9px]">View</span>
              </div>
              <div 
                className="aspect-[16/9] w-full rounded border border-zinc-300 relative overflow-hidden flex flex-col items-center justify-center pointer-events-none"
                style={{ background: slide.bgGradient || slide.bgColor }}
              >
                {/* Micro preview of slide text */}
                {slide.elements.length > 0 ? (
                  <div className="scale-[0.15] w-[500%] h-[500%] absolute flex flex-col text-center pointer-events-none p-4">
                    {slide.elements.filter(e => e.type === 'text' && e.text).slice(0, 2).map((e) => (
                      <div 
                        key={e.id}
                        className="truncate leading-none"
                        style={{ color: e.color || slide.textColor, fontSize: '24px', fontWeight: e.bold ? 'bold' : 'normal' }}
                      >
                        {e.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[8px] text-zinc-400">Blank Slide</span>
                )}
              </div>
            </div>
          ))}
          <button 
            onClick={() => addSlide('title-body')}
            className="flex items-center gap-1.5 justify-center py-2 px-1 text-center rounded border border-dashed border-zinc-300 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/20 text-xs font-semibold text-zinc-500 transition-all"
          >
            <Plus size={14} />
            <span>Add Slide</span>
          </button>
        </div>

        {/* Center Canvas Work Frame */}
        <div className="flex-1 flex flex-col p-4 sm:p-8 bg-zinc-200/60 overflow-y-auto items-center justify-center">
          
          {/* Real Aspect Scale Box */}
          <div className="w-full max-w-[860px]">
            <div 
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              className="w-full aspect-[16/9] relative shadow-xl border border-zinc-300 rounded overflow-hidden select-none"
              style={{ background: activeSlide.bgGradient || activeSlide.bgColor }}
            >
              {/* Elements Renderer */}
              {activeSlide.elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                const isEditing = el.id === editingTextElementId;

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (el.type === 'text') {
                        setEditingTextElementId(el.id);
                      }
                    }}
                    className={`absolute select-none transition-shadow ${
                      isSelected 
                        ? 'ring-2 ring-orange-500 cursor-move shadow-md z-20' 
                        : 'hover:ring-1 hover:ring-zinc-400 cursor-pointer z-10'
                    }`}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.w}%`,
                      height: `${el.h}%`,
                      fontStyle: el.italic ? 'italic' : 'normal',
                      fontWeight: el.bold ? 'bold' : 'normal',
                    }}
                  >
                    {/* Elements Types */}
                    {el.type === 'text' && (
                      <div className="w-full h-full flex flex-col justify-center overflow-hidden">
                        {isEditing ? (
                          <textarea
                            value={el.text || ''}
                            onChange={(e) => updateElement(el.id, { text: e.target.value })}
                            onBlur={() => setEditingTextElementId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') setEditingTextElementId(null);
                            }}
                            className="w-full h-full bg-white text-zinc-900 border-0 ring-1 ring-orange-500 outline-none p-1 text-xs resize-none"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="bg-transparent break-words leading-snug outline-none"
                            style={{ 
                              color: el.color || activeSlide.textColor, 
                              fontSize: el.fontSize ? `${(el.fontSize / 480) * 100}cqw` : '14px', 
                              textAlign: el.align || 'center' 
                            }}
                          >
                            {el.text || 'Text Box'}
                          </div>
                        )}
                      </div>
                    )}

                    {el.type === 'shape' && (
                      <div 
                        className={`w-full h-full flex items-center justify-center transition-all ${
                          el.shapeType === 'circle' ? 'rounded-full' : 'rounded-sm'
                        }`}
                        style={{
                          backgroundColor: el.bgColor || '#38bdf8',
                          borderColor: el.borderColor || '#0284c7',
                          borderWidth: el.borderColor ? '2px' : '0px',
                        }}
                      >
                        {el.text && (
                          <span style={{ color: el.color || '#fff', fontSize: el.fontSize || 14 }}>
                            {el.text}
                          </span>
                        )}
                      </div>
                    )}

                    {el.type === 'image' && el.url && (
                      <img 
                        src={el.url} 
                        alt="Slide user attachment" 
                        className="w-full h-full object-cover rounded-sm pointer-events-none"
                      />
                    )}

                    {/* Drag Corners handles overlay */}
                    {isSelected && !isEditing && (
                      <>
                        <div 
                          className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nwse-resize z-30" 
                          onMouseDown={(e) => handleElementMouseDown(e, el, 'nw')}
                        />
                        <div 
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nesw-resize z-30" 
                          onMouseDown={(e) => handleElementMouseDown(e, el, 'ne')}
                        />
                        <div 
                          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nwse-resize z-30" 
                          onMouseDown={(e) => handleElementMouseDown(e, el, 'se')}
                        />
                        <div 
                          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nesw-resize z-30" 
                          onMouseDown={(e) => handleElementMouseDown(e, el, 'sw')}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-zinc-400 text-xs mt-3 select-none flex items-center gap-2">
            <span>ℹ️ Double-click elements to edit texts in-place.</span>
            <span>|</span>
            <span>Use Home tab to change element styles & sizing.</span>
          </div>
        </div>
      </div>

      {/* Footer bar showing totals */}
      <div className="flex justify-between items-center py-1.5 px-4 border-t border-zinc-200 text-xs text-zinc-500 bg-white shrink-0 select-none font-medium">
        <div className="flex items-center gap-4">
          <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
          <span className="text-zinc-300">|</span>
          <span className="hidden sm:inline">Active elements: {activeSlide.elements?.length || 0}</span>
          <span className="text-zinc-300">|</span>
          <span className="hidden md:inline">Theme: {slides[activeSlideIndex]?.bgGradient ? 'Custom Gradient' : 'Solid'}</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 text-[10px] rounded font-mono">Present (F5)</kbd>
          <span>PowerPoint Pro mode</span>
        </div>
      </div>

      {/* Presentation Full-Screen Player portal */}
      {isPlaying && (
        <div className="fixed inset-0 bg-zinc-950 text-white z-50 flex flex-col justify-between p-4 sm:p-8 select-none animate-in fade-in duration-300">
          
          {/* Host header controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold bg-orange-600 text-white px-2 py-0.5 rounded shadow">
                SLIDESHOW ACTIVE
              </span>
              <span className="text-sm font-semibold truncate text-zinc-200 max-w-sm hidden sm:inline">
                {title}
              </span>
            </div>
            
            <button 
              onClick={() => setIsPlaying(false)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              End Show (Esc)
            </button>
          </div>

          {/* Core presentation slide preview aspect frame */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-5xl aspect-[16/9] bg-white text-zinc-950 relative shadow-2xl border border-zinc-800 rounded-sm overflow-hidden select-none"
              style={{ background: slides[playIndex]?.bgGradient || slides[playIndex]?.bgColor || '#0f172a' }}
            >
              {slides[playIndex]?.elements.map((el) => {
                return (
                  <div
                    key={el.id}
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.w}%`,
                      height: `${el.h}%`,
                      fontStyle: el.italic ? 'italic' : 'normal',
                      fontWeight: el.bold ? 'bold' : 'normal',
                    }}
                  >
                    {el.type === 'text' && (
                      <div className="w-full h-full flex flex-col justify-center overflow-hidden">
                        <div 
                          className="bg-transparent break-words leading-snug"
                          style={{ 
                            color: el.color || slides[playIndex]?.textColor, 
                            fontSize: el.fontSize ? `${(el.fontSize / 540) * 100}cqw` : '18px', 
                            textAlign: el.align || 'center' 
                          }}
                        >
                          {el.text}
                        </div>
                      </div>
                    )}

                    {el.type === 'shape' && (
                      <div 
                        className={`w-full h-full flex items-center justify-center ${
                          el.shapeType === 'circle' ? 'rounded-full' : 'rounded-sm'
                        }`}
                        style={{
                          backgroundColor: el.bgColor || '#38bdf8',
                          borderColor: el.borderColor || '#0284c7',
                          borderWidth: el.borderColor ? '2px' : '0px',
                        }}
                      />
                    )}

                    {el.type === 'image' && el.url && (
                      <img 
                        src={el.url} 
                        alt="Slide user attachment" 
                        className="w-full h-full object-cover rounded-sm pointer-events-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Presenter Footer Helper & Triggers */}
          <div className="flex justify-between items-center text-zinc-400 text-xs mt-2 border-t border-zinc-800 pt-3">
            <div className="flex gap-1.5 items-center">
              <span>Slide {playIndex + 1} of {slides.length}</span>
              <span className="text-zinc-700">|</span>
              <button 
                onClick={() => { if (playIndex > 0) setPlayIndex(prev => prev - 1); }}
                disabled={playIndex === 0}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white text-[10px] rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ◀ Previous
              </button>
              <button 
                onClick={() => { if (playIndex < slides.length - 1) setPlayIndex(prev => prev + 1); else setIsPlaying(false); }}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-[10px] rounded"
              >
                Next ▶
              </button>
            </div>

            <div className="text-center text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">
              Hit Space, Enter, or Click Next to advance the slides
            </div>

            <div className="text-zinc-400 text-right">
              Slide Deck presentation
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
