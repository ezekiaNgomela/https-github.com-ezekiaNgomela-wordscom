import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Copy, MoveUp, MoveDown, 
  Presentation, Play, Monitor, Undo2, Layout, Square, 
  Circle, HelpCircle, Palette, Download, Upload, Bold, 
  Italic, AlignLeft, AlignCenter, AlignRight, Type, 
  FileImage, Settings, Compass, Sparkles, Volume2, Grid, Wand2, Star, MessageSquare,
  Clipboard, Table, Link, Music, Video, Check, MessageCircle, Eye, Columns, Maximize,
  RefreshCw, FileText, CheckSquare, VolumeX, Flame, TrendingUp, User, Users, Lightbulb, Scissors
} from 'lucide-react';

interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'table' | 'chart' | 'icon' | 'video' | 'audio';
  text?: string;
  shapeType?: 'rect' | 'circle' | 'triangle' | 'star' | 'bubble';
  url?: string;
  x: number; // 0-100
  y: number; // 0-100
  w: number; // 0-100
  h: number; // 0-100
  color?: string;
  bgColor?: string;
  borderColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  animationStyle?: 'none' | 'fade' | 'fly-in' | 'zoom' | 'bounce' | 'spin' | 'slide-left' | 'pulse';
  animationDelay?: number;
  animationDuration?: number;
  // Custom elements state
  iconName?: string;
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: { label: string; value: number }[];
  tableRows?: string[][];
  videoPlaying?: boolean;
  audioPlaying?: boolean;
  hyperlink?: string;
}

interface Slide {
  id: string;
  bgColor: string;
  bgGradient?: string;
  textColor: string;
  elements: SlideElement[];
  transition?: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'push-up' | 'zoom' | 'flip' | 'reveal';
  transitionDuration?: number;
  transitionSound?: 'none' | 'click' | 'whoosh' | 'chime' | 'laser';
  fontTheme?: string;
}

interface PresentationEditorProps {
  onBack: () => void;
}

const THEMES = [
  {
    name: 'Teal Frost',
    category: 'Modern Glossy',
    bg: '#042f2e',
    gradient: 'linear-gradient(135deg, #022c22 0%, #042f2e 50%, #064e4b 100%)',
    text: '#ccfbf1',
    primaryColor: '#2dd4bf',
    secondaryColor: '#38bdf8',
    shapeBg: 'rgba(17, 94, 89, 0.65)',
    fontFamily: '"Space Grotesk", sans-serif'
  },
  {
    name: 'Cyberpunk Purple',
    category: 'Modern Glossy',
    bg: '#0a0512',
    gradient: 'linear-gradient(135deg, #090014 0%, #17002b 50%, #2e003a 100%)',
    text: '#fae8ff',
    primaryColor: '#ec4899', 
    secondaryColor: '#a855f7',
    shapeBg: 'rgba(59, 7, 100, 0.7)',
    fontFamily: 'system-ui, sans-serif'
  },
  {
    name: 'Neon Obsidian',
    category: 'Modern Glossy',
    bg: '#090d16',
    gradient: 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)',
    text: '#f1f5f9',
    primaryColor: '#06b6d4',
    secondaryColor: '#f43f5e',
    shapeBg: '#1e293b',
    fontFamily: '"Courier New", monospace'
  },
  {
    name: 'Vintage Parchment',
    category: 'Vintage',
    bg: '#fbf8f3',
    gradient: 'linear-gradient(180deg, #fdfbfa 0%, #f4eee1 100%)',
    text: '#433422',
    primaryColor: '#8c6239', 
    secondaryColor: '#bf926b', 
    shapeBg: '#ebdcb9',
    fontFamily: 'Georgia, serif'
  },
  {
    name: 'Midcentury Autumn',
    category: 'Vintage',
    bg: '#eddca5',
    gradient: 'linear-gradient(135deg, #f5e9c9 0%, #eddca5 100%)',
    text: '#1e2e28', 
    primaryColor: '#c85e43', 
    secondaryColor: '#2d4e3f', 
    shapeBg: '#decc90',
    fontFamily: 'Garamond, serif'
  }
];

const INITIAL_SLIDES: Slide[] = [
  {
    id: 's-1',
    bgColor: '#111827',
    bgGradient: 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)',
    textColor: '#f1f5f9',
    transition: 'fade',
    transitionDuration: 600,
    transitionSound: 'chime',
    fontTheme: 'system-ui, sans-serif',
    elements: [
      {
        id: 'el-1',
        type: 'text',
        text: 'Vintage & Modern Presentation Suite',
        fontSize: 44,
        bold: true,
        align: 'center',
        color: '#2dd4bf',
        fontFamily: 'system-ui, sans-serif',
        animationStyle: 'zoom',
        animationDelay: 100,
        x: 10, y: 25, w: 80, h: 20
      },
      {
        id: 'el-2',
        type: 'text',
        text: 'A highly responsive, design-driven corporate slider sandbox.',
        fontSize: 18,
        align: 'center',
        color: '#94a3b8',
        fontFamily: 'system-ui, sans-serif',
        animationStyle: 'fly-in',
        animationDelay: 350,
        x: 15, y: 52, w: 70, h: 15
      }
    ]
  },
  {
    id: 's-2',
    bgColor: '#111827',
    bgGradient: 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)',
    textColor: '#f1f5f9',
    transition: 'slide-left',
    transitionDuration: 700,
    transitionSound: 'whoosh',
    fontTheme: 'system-ui, sans-serif',
    elements: [
      {
        id: 'el-3',
        type: 'text',
        text: 'Interactive Element Playground',
        fontSize: 26,
        bold: true,
        align: 'center',
        color: '#38bdf8',
        animationStyle: 'fade',
        x: 10, y: 12, w: 80, h: 15
      },
      {
        id: 'el-4',
        type: 'shape',
        shapeType: 'rect',
        bgColor: '#1f2937',
        borderColor: '#38bdf8',
        animationStyle: 'spin',
        animationDelay: 200,
        x: 15, y: 35, w: 32, h: 48
      },
      {
        id: 'el-5',
        type: 'text',
        text: 'Ribbon & Sandbox Control\n\nConfigure custom layouts, shapes, media modules, synthesized sounds, themes, guides, and text synonyms dynamically.',
        fontSize: 14,
        align: 'left',
        color: '#e2e8f0',
        x: 17, y: 39, w: 28, h: 40
      },
      {
        id: 'el-6',
        type: 'shape',
        shapeType: 'circle',
        bgColor: '#1f2937',
        borderColor: '#f43f5e',
        animationStyle: 'bounce',
        animationDelay: 400,
        x: 53, y: 35, w: 32, h: 48
      },
      {
        id: 'el-7',
        type: 'text',
        text: 'Interactive Analytics\n\nAdd charts, grids, sound loops, comment tracking sidebar, and proofing spellcheckers under our Core Ribbon Tabs system.',
        fontSize: 14,
        align: 'left',
        color: '#e2e8f0',
        x: 55, y: 39, w: 28, h: 40
      }
    ]
  }
];

const playSound = (type: string) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'whoosh') {
      const bSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'chime') {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      [523.25, 659.25, 783.99].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      });
    } else if (type === 'laser') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch (e) {}
};

export function PresentationEditor({ onBack }: PresentationEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const saved = localStorage.getItem('wordscom_presentation_data_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SLIDES;
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Design' | 'Transitions' | 'Animations' | 'Slide Show' | 'Review' | 'View'>('Home');
  const [workspaceView, setWorkspaceView] = useState<'normal' | 'outline' | 'sorter'>('normal');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>('16:9');
  
  const [title, setTitle] = useState(() => {
    return localStorage.getItem('wordscom_presentation_title_v2') || 'Corporate Strategy Deck';
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [showGridlines, setShowGridlines] = useState(false);
  const [themeFilter, setThemeFilter] = useState<'All' | 'Modern Glossy' | 'Vintage'>('All');
  
  // Element copy clipboard state
  const [copiedElement, setCopiedElement] = useState<SlideElement | null>(null);

  // Playback/Speaker view states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [showPresenterMode, setShowPresenterMode] = useState(false);

  // Speaker notes state
  const [speakerNotes, setSpeakerNotes] = useState<Record<string, string>>({
    's-1': 'Introduce the standard corporate roadmap. Emphasize native transitions and acoustic synth triggers built fully in browser.',
    's-2': 'Walk client through interactive shapes, quick guidelines, smart guides, and synonyms lookups under Review.'
  });

  // Rehearsal timer state
  const [rehearsalActive, setRehearsalActive] = useState(false);
  const [rehearsalTime, setRehearsalTime] = useState(0);

  // Recording deck speech state
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Comments state
  const [comments, setComments] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({
    's-1': [
      { id: 'c1', author: 'Mark (PM)', text: 'Color contrast looks extraordinary!', time: '09:12 AM' },
      { id: 'c2', author: 'Sarah (UX)', text: 'Let’s use Georgia for vintage vibe slides.', time: '10:30 AM' }
    ]
  });
  const [newCommentStr, setNewCommentStr] = useState('');

  // Proofing / spellcheck states
  const [proofingRan, setProofingRan] = useState(false);
  const [spellIssues, setSpellIssues] = useState<{ id: string; typo: string; correction: string; text: string }[]>([]);

  // Thesaurus states
  const [thesaurusActive, setThesaurusActive] = useState(false);
  const [thesSynonyms, setThesSynonyms] = useState<string[]>([]);
  const [thesTargetWord, setThesTargetWord] = useState('');

  // Drag & resize calculations
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
  const activeSlide = slides[activeSlideIndex] || slides[0] || INITIAL_SLIDES[0];

  useEffect(() => {
    let t: any;
    if (rehearsalActive) {
      t = setInterval(() => setRehearsalTime(p => p + 1), 1000);
    }
    return () => clearInterval(t);
  }, [rehearsalActive]);

  useEffect(() => {
    let t: any;
    if (recordingActive) {
      t = setInterval(() => setRecordingTime(p => p + 1), 1000);
    }
    return () => clearInterval(t);
  }, [recordingActive]);

  const handleSave = () => {
    localStorage.setItem('wordscom_presentation_data_v2', JSON.stringify(slides));
    localStorage.setItem('wordscom_presentation_title_v2', title);
    setIsSaved(true);
    playSound('click');
  };

  useEffect(() => {
    if (isSaved) return;
    const t = setTimeout(() => {
      localStorage.setItem('wordscom_presentation_data_v2', JSON.stringify(slides));
      localStorage.setItem('wordscom_presentation_title_v2', title);
      setIsSaved(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [slides, title, isSaved]);

  const addSlide = (layout: 'title' | 'title-body' | 'blank' | 'bento' | 'headline') => {
    playSound('click');
    const defaultColor = activeSlide ? activeSlide.bgColor : '#111827';
    const defaultGradient = activeSlide ? activeSlide.bgGradient : 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)';
    const defaultText = activeSlide ? activeSlide.textColor : '#f1f5f9';
    
    let elList: SlideElement[] = [];
    if (layout === 'title') {
      elList = [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          text: 'Corporate Presentation Statement',
          fontSize: 38,
          bold: true,
          align: 'center',
          color: '#38bdf8',
          animationStyle: 'zoom',
          x: 10, y: 35, w: 80, h: 20
        }
      ];
    } else if (layout === 'title-body') {
      elList = [
        {
          id: `el-${Date.now()}-t`,
          type: 'text',
          text: 'Core Roadmap Highlights',
          fontSize: 30,
          bold: true,
          align: 'left',
          color: '#2dd4bf',
          x: 10, y: 15, w: 80, h: 12
        },
        {
          id: `el-${Date.now()}-b`,
          type: 'text',
          text: '• Native visual morph slide transitions\n• On-fly corporate text thesaurus system\n• Drag-and-scale canvas grids configuration',
          fontSize: 18,
          align: 'left',
          color: defaultText,
          animationStyle: 'fly-in',
          animationDelay: 200,
          x: 10, y: 35, w: 80, h: 48
        }
      ];
    } else if (layout === 'headline') {
      elList = [
        {
          id: `el-${Date.now()}-h1`,
          type: 'text',
          text: 'STUNNING RESULTS TODAY',
          fontSize: 44,
          bold: true,
          align: 'center',
          color: '#ec4899',
          x: 10, y: 30, w: 80, h: 16
        },
        {
          id: `el-${Date.now()}-sub`,
          type: 'text',
          text: 'Strategic milestones exceeded by over 24%. Click presentation view to rehearse.',
          fontSize: 16,
          align: 'center',
          color: '#94a3b8',
          x: 15, y: 52, w: 70, h: 14
        }
      ];
    }

    const nSld: Slide = {
      id: `slide-${Date.now()}`,
      bgColor: defaultColor,
      bgGradient: defaultGradient,
      textColor: defaultText,
      transition: 'fade',
      transitionDuration: 600,
      transitionSound: 'click',
      elements: elList
    };

    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, nSld);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
    setSelectedElementId(null);
    setIsSaved(false);
  };

  const duplicateSlide = () => {
    playSound('click');
    const dup: Slide = JSON.parse(JSON.stringify(activeSlide));
    dup.id = `slide-dup-${Date.now()}`;
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, dup);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
    setSelectedElementId(null);
    setIsSaved(false);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      alert("At least one slide must remain.");
      return;
    }
    playSound('click');
    const newSlides = slides.filter((_, idx) => idx !== activeSlideIndex);
    setSlides(newSlides);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    setSelectedElementId(null);
    setIsSaved(false);
  };

  const moveSlide = (direction: 'up' | 'down') => {
    if (direction === 'up' && activeSlideIndex === 0) return;
    if (direction === 'down' && activeSlideIndex === slides.length - 1) return;
    playSound('click');
    const targetIdx = direction === 'up' ? activeSlideIndex - 1 : activeSlideIndex + 1;
    const newSlides = [...slides];
    const temp = newSlides[activeSlideIndex];
    newSlides[activeSlideIndex] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;
    setSlides(newSlides);
    setActiveSlideIndex(targetIdx);
    setIsSaved(false);
  };

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

  const addElement = (
    type: 'text' | 'shape' | 'image' | 'table' | 'chart' | 'icon' | 'video' | 'audio', 
    detail?: string,
    chartType?: 'bar' | 'line' | 'pie',
    iconName?: string
  ) => {
    playSound('click');
    let nEl: SlideElement = {
      id: `el-${Date.now()}`,
      type,
      x: 35,
      y: 40,
      w: 30,
      h: 20,
      color: activeSlide.textColor,
      bgColor: '#38bdf8',
      align: 'center',
      animationStyle: 'zoom',
      animationDelay: 0
    };

    if (type === 'text') {
      nEl.text = 'New Text Box';
      nEl.fontSize = 20;
    } else if (type === 'shape') {
      nEl.shapeType = (detail as any) || 'rect';
      nEl.borderColor = '#0284c7';
      nEl.w = 20;
      nEl.h = 20;
    } else if (type === 'image') {
      const url = window.prompt("Enter image URL:", "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600");
      if (!url) return;
      nEl.url = url;
      nEl.w = 40;
      nEl.h = 30;
    } else if (type === 'table') {
      nEl.w = 50;
      nEl.h = 35;
      nEl.tableRows = [
        ['Deliverable', 'Status', 'Risk'],
        ['Q3 Strategy', 'Completed', 'Low-Z'],
        ['Client Demo', 'Ongoing', 'Medium']
      ];
    } else if (type === 'chart') {
      nEl.w = 45;
      nEl.h = 35;
      nEl.chartType = chartType || 'bar';
      nEl.chartData = [
        { label: 'Q1 Sales', value: 45 },
        { label: 'Q2 Sales', value: 80 },
        { label: 'Q3 Sales', value: 65 },
        { label: 'Q4 Sales', value: 95 }
      ];
    } else if (type === 'icon') {
      nEl.w = 12;
      nEl.h = 12;
      nEl.iconName = iconName || 'Sparkles';
    } else if (type === 'video') {
      nEl.w = 40;
      nEl.h = 30;
      nEl.videoPlaying = false;
    } else if (type === 'audio') {
      nEl.w = 35;
      nEl.h = 15;
      nEl.audioPlaying = false;
    }

    const updatedSlides = slides.map((sl, idx) => {
      if (idx !== activeSlideIndex) return sl;
      return { ...sl, elements: [...sl.elements, nEl] };
    });
    setSlides(updatedSlides);
    setSelectedElementId(nEl.id);
    setIsSaved(false);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    playSound('click');
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

  // Clipboard operations (Cut, Copy, Paste, Duplicate)
  const handleCut = () => {
    if (!selectedElementId) return;
    const target = activeSlide.elements.find(e => e.id === selectedElementId);
    if (!target) return;
    playSound('click');
    setCopiedElement(JSON.parse(JSON.stringify(target)));
    deleteSelectedElement();
  };

  const handleCopy = () => {
    if (!selectedElementId) return;
    const target = activeSlide.elements.find(e => e.id === selectedElementId);
    if (target) {
      playSound('click');
      setCopiedElement(JSON.parse(JSON.stringify(target)));
    }
  };

  const handlePaste = () => {
    if (!copiedElement) return;
    playSound('chime');
    const pasted: SlideElement = JSON.parse(JSON.stringify(copiedElement));
    pasted.id = `el-pasted-${Date.now()}`;
    pasted.x = Math.min(85, pasted.x + 4);
    pasted.y = Math.min(85, pasted.y + 4);
    setSlides(prev => prev.map((sl, i) => {
      if (i !== activeSlideIndex) return sl;
      return { ...sl, elements: [...sl.elements, pasted] };
    }));
    setSelectedElementId(pasted.id);
    setIsSaved(false);
  };

  const handleDuplicateItem = () => {
    if (!selectedElementId) return;
    const target = activeSlide.elements.find(e => e.id === selectedElementId);
    if (target) {
      playSound('click');
      const dup: SlideElement = JSON.parse(JSON.stringify(target));
      dup.id = `el-dup-${Date.now()}`;
      dup.x = Math.min(85, dup.x + 5);
      dup.y = Math.min(85, dup.y + 5);
      setSlides(prev => prev.map((sl, i) => {
        if (i !== activeSlideIndex) return sl;
        return { ...sl, elements: [...sl.elements, dup] };
      }));
      setSelectedElementId(dup.id);
      setIsSaved(false);
    }
  };

  // Run dynamic proofing spellchecker mock
  const runSpellCheck = () => {
    playSound('click');
    const issues: typeof spellIssues = [];
    const typos: Record<string, string> = {
      teh: 'the',
      recieve: 'receive',
      seperate: 'separate',
      definately: 'definitely',
      untill: 'until',
      sucessful: 'successful'
    };

    activeSlide.elements.forEach(el => {
      if (el.type === 'text' && el.text) {
        Object.keys(typos).forEach(typo => {
          const rx = new RegExp(`\\b${typo}\\b`, 'gi');
          if (rx.test(el.text!)) {
            issues.push({
              id: el.id,
              typo,
              correction: typos[typo],
              text: el.text!
            });
          }
        });
      }
    });

    setSpellIssues(issues);
    setProofingRan(true);
  };

  const correctSpellIssue = (issueId: string, typo: string, correction: string) => {
    playSound('chime');
    const elText = activeSlide.elements.find(e => e.id === issueId)?.text || '';
    const rx = new RegExp(`\\b${typo}\\b`, 'gi');
    const updated = elText.replace(rx, correction);
    updateElement(issueId, { text: updated });
    setSpellIssues(prev => prev.filter(iss => !(iss.id === issueId && iss.typo === typo)));
  };

  // Run synonyms corporate thesaurus
  const runThesaurus = () => {
    playSound('click');
    const selected = activeSlide.elements.find(e => e.id === selectedElementId);
    if (!selected || selected.type !== 'text' || !selected.text) {
      alert("Please select a text card on slide first.");
      return;
    }

    const thesaurusDb: Record<string, string[]> = {
      beautiful: ['extraordinary', 'stunning', 'glowing', 'polished', 'elegant'],
      professional: ['executive', 'meticulous', 'tailored', 'formidable', 'curated'],
      great: ['outstanding', 'masterful', 'stellar', 'superb', 'majestic'],
      simple: ['streamlined', 'straightforward', 'minimal', 'concise', 'refined'],
      build: ['synthesize', 'architect', 'cultivate', 'formulate', 'foster']
    };

    let wordFound = '';
    let suggestions: string[] = ['elevated', 'captivating', 'persuasive', 'formidable', 'pristine'];
    const textLower = selected.text.toLowerCase();

    Object.keys(thesaurusDb).forEach(word => {
      if (textLower.includes(word)) {
        wordFound = word;
        suggestions = thesaurusDb[word];
      }
    });

    setThesTargetWord(wordFound || 'selected word');
    setThesSynonyms(suggestions);
    setThesaurusActive(true);
  };

  const applySynonym = (synonym: string) => {
    const selected = activeSlide.elements.find(e => e.id === selectedElementId);
    if (!selected || !selected.text) return;
    playSound('chime');
    const targetWord = thesTargetWord === 'selected word' ? selected.text.split(' ')[0] : thesTargetWord;
    const rx = new RegExp(targetWord, 'gi');
    const updatedText = selected.text.replace(rx, synonym);
    updateElement(selected.id, { text: updatedText });
    setThesaurusActive(false);
  };

  // Slide Sorter and outline ordering controls
  const moveSlideInSorter = (idx: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= slides.length) return;
    playSound('click');
    const swap = [...slides];
    const temp = swap[idx];
    swap[idx] = swap[target];
    swap[target] = temp;
    setSlides(swap);
    setIsSaved(false);
  };

  // Apply visual theme across all slides
  const applyThemeToAll = (theme: typeof THEMES[0]) => {
    playSound('chime');
    setSlides(prev => prev.map(sl => ({
      ...sl,
      bgColor: theme.bg,
      bgGradient: theme.gradient,
      textColor: theme.text,
      fontTheme: theme.fontFamily,
      elements: sl.elements.map(el => {
        const up: Partial<SlideElement> = { fontFamily: theme.fontFamily };
        if (el.type === 'text') {
          if (el.fontSize && el.fontSize >= 32) {
            up.color = theme.primaryColor;
          } else {
            up.color = theme.text;
          }
        } else if (el.type === 'shape') {
          up.bgColor = theme.shapeBg || theme.primaryColor;
          up.borderColor = theme.primaryColor;
        }
        return { ...el, ...up };
      })
    })));
    setIsSaved(false);
  };

  // Mouse handlers for move & resize
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
    const dX = ((e.clientX - dragState.startX) / canvasBounds.width) * 100;
    const dY = ((e.clientY - dragState.startY) / canvasBounds.height) * 100;

    let nextX = dragState.startElementX;
    let nextY = dragState.startElementY;
    let nextW = dragState.startElementW;
    let nextH = dragState.startElementH;

    if (dragState.isDragging) {
      nextX = Math.max(0, Math.min(100 - dragState.startElementW, dragState.startElementX + dX));
      nextY = Math.max(0, Math.min(100 - dragState.startElementH, dragState.startElementY + dY));
      updateElement(dragState.elementId, { x: parseFloat(nextX.toFixed(1)), y: parseFloat(nextY.toFixed(1)) });
    } else if (dragState.isResizing && dragState.handle) {
      const hd = dragState.handle;
      if (hd === 'se') {
        nextW = Math.max(5, Math.min(100 - dragState.startElementX, dragState.startElementW + dX));
        nextH = Math.max(4, Math.min(100 - dragState.startElementY, dragState.startElementH + dY));
      } else if (hd === 'sw') {
        const potentialX = dragState.startElementX + dX;
        nextX = Math.max(0, Math.min(dragState.startElementX + dragState.startElementW - 5, potentialX));
        nextW = Math.max(5, dragState.startElementW - (nextX - dragState.startElementX));
        nextH = Math.max(4, Math.min(100 - dragState.startElementY, dragState.startElementH + dY));
      } else if (hd === 'nw') {
        const potentialX = dragState.startElementX + dX;
        const potentialY = dragState.startElementY + dY;
        nextX = Math.max(0, Math.min(dragState.startElementX + dragState.startElementW - 5, potentialX));
        nextW = Math.max(5, dragState.startElementW - (nextX - dragState.startElementX));
        nextY = Math.max(0, Math.min(dragState.startElementY + dragState.startElementH - 4, potentialY));
        nextH = Math.max(4, dragState.startElementH - (nextY - dragState.startElementY));
      } else if (hd === 'ne') {
        const potentialY = dragState.startElementY + dY;
        nextW = Math.max(5, Math.min(100 - dragState.startElementX, dragState.startElementW + dX));
        nextY = Math.max(0, Math.min(dragState.startElementY + dragState.startElementH - 4, potentialY));
        nextH = Math.max(4, dragState.startElementH - (nextY - dragState.startElementY));
      }
      updateElement(dragState.elementId, {
        x: parseFloat(nextX.toFixed(1)),
        y: parseFloat(nextY.toFixed(1)),
        w: parseFloat(nextW.toFixed(1)),
        h: parseFloat(nextH.toFixed(1))
      });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentStr.trim()) return;
    playSound('click');
    const slideComments = comments[activeSlide.id] || [];
    const nComm = {
      id: `comm-${Date.now()}`,
      author: 'You (Reviewer)',
      text: newCommentStr.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setComments({ ...comments, [activeSlide.id]: [...slideComments, nComm] });
    setNewCommentStr('');
  };

  const deleteComment = (cId: string) => {
    playSound('click');
    const filtered = (comments[activeSlide.id] || []).filter(c => c.id !== cId);
    setComments({ ...comments, [activeSlide.id]: filtered });
  };

  const startPresentation = (fromBeginning = true) => {
    setPlayIndex(fromBeginning ? 0 : activeSlideIndex);
    setIsPlaying(true);
    const firstSound = slides[fromBeginning ? 0 : activeSlideIndex]?.transitionSound || 'none';
    if (firstSound !== 'none') playSound(firstSound);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (playIndex < slides.length - 1) {
            const nextIdx = playIndex + 1;
            setPlayIndex(nextIdx);
            const snd = slides[nextIdx]?.transitionSound || 'none';
            if (snd !== 'none') playSound(snd);
          } else {
            setIsPlaying(false);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          e.preventDefault();
          if (playIndex > 0) {
            const prevIdx = playIndex - 1;
            setPlayIndex(prevIdx);
            const snd = slides[prevIdx]?.transitionSound || 'none';
            if (snd !== 'none') playSound(snd);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, playIndex, slides]);

  const selectedElement = activeSlide.elements.find(el => el.id === selectedElementId);
  const filteredThemes = themeFilter === 'All' ? THEMES : THEMES.filter(t => t.category === themeFilter);

  const RibbonGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col border-r border-zinc-200 dark:border-zinc-800 px-2 sm:px-3.5 h-full justify-between shrink-0">
      <div className="flex items-center gap-1.5 py-0.5">{children}</div>
      <div className="text-[9px] font-bold text-zinc-400 tracking-wider text-center select-none mt-1 uppercase">
        {label}
      </div>
    </div>
  );

  const formatRehearsalTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 text-zinc-100 font-sans select-none overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      
      {/* Immersive entry transitions engine styling */}
      <style>{`
        @keyframes page-fade { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes page-slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes page-slide-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes page-push-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes page-zoom { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes page-flip { from { transform: rotateY(-90deg) scale(0.95); opacity: 0; } to { transform: rotateY(0deg) scale(1); opacity: 1; } }
        @keyframes page-reveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }

        .transition-fade { animation: page-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .transition-slide-left { animation: page-slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .transition-slide-right { animation: page-slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .transition-push-up { animation: page-push-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .transition-zoom { animation: page-zoom 0.5s cubic-bezier(0.34, 1.5, 0.64, 1) both; }
        .transition-flip { animation: page-flip 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; transform-style: preserve-3d; perspective: 1000px; }
        .transition-reveal { animation: page-reveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes obj-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes obj-fly-in { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes obj-zoom { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes obj-bounce { 0% { transform: scale(0.4); opacity: 0; } 50% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes obj-spin { from { transform: rotate(-180deg) scale(0.5); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
        @keyframes obj-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        .anim-fade { animation: obj-fade 0.5s ease-out both; }
        .anim-fly-in { animation: obj-fly-in 0.62s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-zoom { animation: obj-zoom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.2) both; }
        .anim-bounce { animation: obj-bounce 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.25) both; }
        .anim-spin { animation: obj-spin 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-pulse { animation: obj-pulse 2s infinite ease-in-out; }
      `}</style>

      {/* Header bar section */}
      <div className="bg-zinc-950 border-b border-zinc-800 flex flex-col shrink-0">
        
        {/* Title and main top commands row */}
        <div className="px-3 py-2 flex items-center justify-between text-white shrink-0 bg-gradient-to-r from-orange-600/10 to-zinc-950 border-b border-zinc-900">
          <div className="flex items-center gap-2 overflow-hidden">
            <button 
              onClick={onBack} 
              className="p-1 px-2.5 bg-zinc-850 hover:bg-zinc-800 rounded text-gray-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeft size={13} />
              <span className="text-xs font-semibold">Dashboard</span>
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <Presentation size={14} className="text-orange-500 fill-orange-500" />
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsSaved(false); }}
                className="text-xs font-bold bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-orange-500 px-1 py-0.5 rounded cursor-pointer w-[140px] sm:w-[220px] text-white hover:bg-zinc-850"
                placeholder="Presentation Name"
                id="doc_title_element"
              />
            </div>
          </div>

          {/* Core Ribbon Tabs Picker */}
          <div className="flex items-center gap-0.5">
            {(['Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); playSound('click'); }}
                className={`px-2 py-1 text-[11px] font-bold rounded-t-md transition-all border-b-2 ${
                  activeTab === tab 
                    ? 'bg-zinc-850 text-orange-400 border-orange-500 font-extrabold' 
                    : 'text-zinc-400 hover:text-white border-transparent hover:bg-zinc-900'
                }`}
                id={`tab_button_${tab.toLowerCase().replace(' ', '_')}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <span className="hidden md:inline-block text-[10px] text-zinc-500 font-mono">
              {isSaved ? '● AUTO-PREVIEW' : '○ PROGRESS WAITING'}
            </span>
            <button
              onClick={handleSave}
              className={`px-2.5 py-1 text-xs rounded font-bold flex items-center gap-1 ${
                isSaved ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse'
              }`}
              disabled={isSaved}
              id="presentation_save_button"
            >
              <Save size={12} />
              <span>Save</span>
            </button>
            <button
              onClick={() => startPresentation(true)}
              className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded font-bold flex items-center gap-1 shadow-md transition-transform active:scale-95"
              id="present_top_button"
            >
              <Play size={12} fill="white" />
              <span className="hidden sm:inline">Present</span>
            </button>
          </div>
        </div>

        {/* Dynamic Ribbon Control Zone */}
        <div className="flex items-center gap-1 overflow-x-auto select-none min-h-[64px] max-h-[70px] px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-850 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* HOME TAB - Fonts, Paragraphs, Clipboard, Slides, Quick drawing */}
          {activeTab === 'Home' && (
            <>
              <RibbonGroup label="Clipboard">
                <button onClick={handleCut} disabled={!selectedElementId} className="flex flex-col items-center p-1 bg-zinc-800/70 hover:bg-zinc-750 disabled:opacity-40 text-zinc-200 hover:text-white rounded text-[10px] shrink-0 w-10">
                  <Scissors size={13} />
                  <span>Cut</span>
                </button>
                <button onClick={handleCopy} disabled={!selectedElementId} className="flex flex-col items-center p-1 bg-zinc-800/70 hover:bg-zinc-750 disabled:opacity-40 text-zinc-200 hover:text-white rounded text-[10px] shrink-0 w-10">
                  <Clipboard size={13} />
                  <span>Copy</span>
                </button>
                <button onClick={handlePaste} disabled={!copiedElement} className="flex flex-col items-center p-1 bg-zinc-800/75 hover:bg-zinc-750 disabled:opacity-30 text-emerald-400 hover:text-emerald-300 rounded text-[10px] shrink-0 w-10">
                  <Clipboard size={13} fill="currentColor" className="opacity-60" />
                  <span>Paste</span>
                </button>
                <button onClick={handleDuplicateItem} disabled={!selectedElementId} className="flex flex-col items-center p-1 bg-zinc-800/70 hover:bg-zinc-750 disabled:opacity-40 text-zinc-200 hover:text-white rounded text-[10px] shrink-0 w-12" title="Clones selected item">
                  <Copy size={13} />
                  <span>Clone</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Slides Control">
                <button 
                  onClick={() => addSlide('title-body')} 
                  className="p-1 px-1.5 bg-zinc-800 hover:bg-zinc-750 hover:text-orange-400 rounded text-xs flex flex-col items-center justify-center gap-0.5"
                  id="add_standard_slide_btn"
                >
                  <Plus size={13} className="text-orange-500" />
                  <span className="text-[10px] font-bold">Standard Slide</span>
                </button>
                <div className="flex bg-zinc-850 p-0.5 rounded gap-0.5">
                  <button onClick={() => addSlide('title')} className="p-1 hover:bg-zinc-800 rounded text-[9px] font-bold">New Title</button>
                  <button onClick={() => addSlide('headline')} className="p-1 hover:bg-zinc-800 rounded text-[9px] font-bold">New Headline</button>
                </div>
                <div className="flex flex-col gap-0.5 text-[8.5px]">
                  <button onClick={duplicateSlide} className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-750 p-0.5 px-2 rounded font-bold">
                    <span>Duplicate Slide</span>
                  </button>
                  <button onClick={deleteSlide} className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 p-0.5 px-2 rounded font-bold text-red-300">
                    <span>Delete Slide</span>
                  </button>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Arrange Sequence">
                <button onClick={() => moveSlide('up')} className="p-1 hover:bg-zinc-800 text-zinc-300 rounded" title="Move slide left/up">
                  <MoveUp size={15} />
                </button>
                <button onClick={() => moveSlide('down')} className="p-1 hover:bg-zinc-800 text-zinc-300 rounded" title="Move slide right/down">
                  <MoveDown size={15} />
                </button>
              </RibbonGroup>

              {selectedElement ? (
                <RibbonGroup label={`Format [${selectedElement.type.toUpperCase()}]`}>
                  {selectedElement.type === 'text' && (
                    <>
                      <button 
                        onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })}
                        className={`p-1 rounded ${selectedElement.bold ? 'bg-orange-500 text-white' : 'hover:bg-zinc-800'}`}
                      >
                        <Bold size={14} />
                      </button>
                      <button 
                        onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}
                        className={`p-1 rounded ${selectedElement.italic ? 'bg-orange-500 text-white' : 'hover:bg-zinc-800'}`}
                      >
                        <Italic size={14} />
                      </button>
                      <select
                        value={selectedElement.fontFamily || 'system-ui, sans-serif'}
                        onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                        className="bg-zinc-800 text-xs border border-zinc-700 rounded px-1 text-zinc-100"
                      >
                        <option value="system-ui, sans-serif">Sans Pro</option>
                        <option value="Georgia, serif">Georgia Print</option>
                        <option value="Garamond, serif">Garamond Old Style</option>
                        <option value='"Space Grotesk", sans-serif'>Space Grotesk</option>
                        <option value='"Courier New", monospace'>Courier Code</option>
                      </select>
                      <select
                        value={selectedElement.fontSize || 18}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="bg-zinc-800 text-xs border border-zinc-700 rounded px-1 text-zinc-100"
                      >
                        {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 60].map(sz => (
                          <option key={sz} value={sz}>{sz}px</option>
                        ))}
                      </select>
                      <div className="flex bg-zinc-800 rounded overflow-hidden">
                        {(['left', 'center', 'right'] as const).map(dir => (
                          <button 
                            key={dir}
                            onClick={() => updateElement(selectedElement.id, { align: dir })}
                            className={`p-1 hover:bg-zinc-700 text-zinc-200 ${selectedElement.align === dir ? 'bg-orange-600' : ''}`}
                          >
                            {dir === 'left' && <AlignLeft size={12} />}
                            {dir === 'center' && <AlignCenter size={12} />}
                            {dir === 'right' && <AlignRight size={12} />}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-800 rounded p-1">
                        <Palette size={12} className="text-zinc-400" />
                        <input
                          type="color"
                          value={selectedElement.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                          className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {selectedElement.type === 'shape' && (
                    <>
                      <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded">
                        <span className="text-[10px] text-zinc-400">Fill</span>
                        <input type="color" value={selectedElement.bgColor || '#38bdf8'} onChange={(e) => updateElement(selectedElement.id, { bgColor: e.target.value })} className="w-3.5 h-3.5 bg-transparent border-0 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded">
                        <span className="text-[10px] text-zinc-400">Bord</span>
                        <input type="color" value={selectedElement.borderColor || '#0284c7'} onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })} className="w-3.5 h-3.5 bg-transparent border-0 cursor-pointer" />
                      </div>
                    </>
                  )}

                  {selectedElement.hyperlink && (
                    <div className="text-[10px] bg-blue-950/40 p-1 rounded text-blue-300 flex items-center gap-1 border border-blue-900">
                      <Link size={10} />
                      <span className="max-w-[70px] truncate">{selectedElement.hyperlink}</span>
                    </div>
                  )}

                  <button onClick={deleteSelectedElement} className="p-1 px-2.5 bg-red-950/60 hover:bg-red-900 border border-red-900 rounded text-xs font-bold text-white flex items-center gap-1">
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </RibbonGroup>
              ) : (
                <span className="text-xs text-zinc-400 italic px-4 select-none self-center">Select slide elements to toggle text/shape formatting configurations.</span>
              )}
            </>
          )}

          {/* INSERT TAB - Tables, Icons, Charts, Video, Audio, Links */}
          {activeTab === 'Insert' && (
            <>
              <RibbonGroup label="Text & Drawing">
                <button onClick={() => addElement('text')} className="p-1 bg-zinc-800 hover:bg-zinc-750 text-xs rounded font-bold flex items-center gap-1">
                  <Type size={13} className="text-blue-400" />
                  <span>Text Box</span>
                </button>
                <div className="flex items-center bg-zinc-850 p-0.5 rounded gap-1">
                  <button onClick={() => addElement('shape', 'rect')} className="p-1 bg-zinc-800 hover:bg-zinc-750 rounded text-[9px] font-bold flex items-center gap-1">
                    <Square size={10} className="fill-blue-400 text-blue-500" />
                    <span>Rect</span>
                  </button>
                  <button onClick={() => addElement('shape', 'circle')} className="p-1 bg-zinc-800 hover:bg-zinc-750 rounded text-[9px] font-bold flex items-center gap-1">
                    <Circle size={10} className="fill-emerald-400 text-emerald-500" />
                    <span>Circle</span>
                  </button>
                  <button onClick={() => addElement('shape', 'star')} className="p-1 bg-zinc-800 hover:bg-zinc-750 rounded text-[9px] font-bold flex items-center gap-1">
                    <Star size={10} className="fill-pink-500 text-pink-400" />
                    <span>Star</span>
                  </button>
                  <button onClick={() => addElement('shape', 'bubble')} className="p-1 bg-zinc-800 hover:bg-zinc-750 rounded text-[9px] font-bold flex items-center gap-1">
                    <MessageSquare size={10} className="fill-yellow-500 text-yellow-400" />
                    <span>Bubble</span>
                  </button>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Visuals">
                <button onClick={() => addElement('table')} className="p-1 bg-zinc-850 hover:bg-zinc-800 rounded text-[11px] font-bold flex items-center gap-1.5 border border-zinc-700">
                  <Table size={13} className="text-orange-500" />
                  <span>Insert Table</span>
                </button>
                <button onClick={() => addElement('image')} className="p-1 bg-zinc-850 hover:bg-zinc-800 rounded text-[11px] font-bold flex items-center gap-1.5 border border-zinc-700">
                  <FileImage size={13} className="text-indigo-400" />
                  <span>Picture Link</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Lucide Icons">
                {['Sparkles', 'Lightbulb', 'Compass', 'TrendingUp', 'Users', 'Heart'].map(ic => (
                  <button key={ic} onClick={() => addElement('icon', undefined, undefined, ic)} className="p-1 hover:bg-zinc-800 rounded" title={`Insert icon ${ic}`}>
                    {ic === 'Sparkles' && <Sparkles size={14} className="text-yellow-400" />}
                    {ic === 'Lightbulb' && <Lightbulb size={14} className="text-amber-300" />}
                    {ic === 'Compass' && <Compass size={14} className="text-teal-400" />}
                    {ic === 'TrendingUp' && <TrendingUp size={14} className="text-emerald-400" />}
                    {ic === 'Users' && <Users size={14} className="text-violet-400" />}
                    {ic === 'Heart' && <Users size={14} className="text-red-400 fill-red-800" />}
                  </button>
                ))}
              </RibbonGroup>

              <RibbonGroup label="Business Charts">
                <button onClick={() => addElement('chart', undefined, 'bar')} className="p-1 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-750 rounded text-sky-400">
                  📈 Bar Chart
                </button>
                <button onClick={() => addElement('chart', undefined, 'line')} className="p-1 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-750 rounded text-pink-400">
                  📈 Line Chart
                </button>
                <button onClick={() => addElement('chart', undefined, 'pie')} className="p-1 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-750 rounded text-purple-400">
                  📈 Donut Pie
                </button>
              </RibbonGroup>

              <RibbonGroup label="Interactions">
                <button onClick={() => addElement('video')} className="p-1 bg-zinc-800 hover:bg-zinc-750 text-[10px] font-bold rounded flex items-center gap-1">
                  <Video size={13} className="text-red-400" />
                  <span>Video Box</span>
                </button>
                <button onClick={() => addElement('audio')} className="p-1 bg-zinc-800 hover:bg-zinc-750 text-[10px] font-bold rounded flex items-center gap-1">
                  <Music size={13} className="text-green-400" />
                  <span>Synth Loop</span>
                </button>
                <button 
                  onClick={() => {
                    const l = window.prompt("Enter target url (e.g., https://google.com):", "https://ai.studio");
                    if (l && selectedElementId) {
                      updateElement(selectedElementId, { hyperlink: l });
                    }
                  }}
                  disabled={!selectedElementId}
                  className="p-1 p-0.5 px-1.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 text-[10px] font-bold rounded flex items-center gap-1"
                >
                  <Link size={11} className="text-yellow-400" />
                  <span>Attach Link</span>
                </button>
              </RibbonGroup>
            </>
          )}

          {/* DESIGN TAB - Theme Swaps, Canvas bg customize, Standard 4:3 sizes */}
          {activeTab === 'Design' && (
            <div className="flex items-center gap-3 w-full h-full overflow-hidden">
              <div className="flex flex-col shrink-0 border-r border-zinc-800 pr-2 pb-1 justify-between h-full">
                <div className="flex bg-zinc-800 rounded p-0.5">
                  {(['All', 'Modern Glossy', 'Vintage'] as const).map(f => (
                    <button key={f} onClick={() => setThemeFilter(f)} className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${themeFilter === f ? 'bg-orange-600' : 'text-zinc-400'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider text-center">Filter</div>
              </div>

              {/* Theme Horizontal List */}
              <div className="flex-1 flex gap-2 overflow-x-auto h-full max-h-[50px] py-0.5">
                {filteredThemes.map(t => (
                  <button key={t.name} onClick={() => applyThemeToAll(t)} style={{ background: t.gradient }} className="px-3 py-1 rounded border border-white/10 hover:border-orange-500 transition-all text-left flex flex-col justify-between shrink-0 shadow-md relative min-w-[124px] overflow-hidden group">
                    <span className="text-[8px] bg-black/40 px-1 rounded-full text-white font-mono tracking-widest">{t.category.split(' ')[0]}</span>
                    <span className="text-[10px] font-extrabold tracking-wide truncate text-shadow-sm" style={{ color: t.text }}>{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Customize Background elements */}
              <RibbonGroup label="Manual Background Canvas">
                <div className="flex items-center gap-1 bg-zinc-850 p-1 rounded">
                  <span className="text-[9px]">Solid</span>
                  <input
                    type="color"
                    value={activeSlide.bgColor}
                    onChange={(e) => {
                      setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, bgColor: e.target.value, bgGradient: undefined } : s));
                      setIsSaved(false);
                    }}
                    className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => {
                    const grad = `linear-gradient(135deg, ${activeSlide.bgColor} 0%, #0d0d0d 100%)`;
                    setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, bgGradient: grad } : s));
                    setIsSaved(false);
                  }}
                  className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-750 text-[10px] font-bold rounded"
                >
                  Apply Gradient
                </button>
              </RibbonGroup>

              {/* Slide Dimensions Ratio selector */}
              <RibbonGroup label="Slide Deck Dimensions">
                <div className="flex items-center gap-0.5 bg-zinc-850 p-0.5 rounded border border-zinc-700">
                  <button 
                    onClick={() => { setAspectRatio('16:9'); playSound('click'); }} 
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${aspectRatio === '16:9' ? 'bg-orange-600 text-white' : 'text-zinc-400'}`}
                  >
                    Widescreen (16:9)
                  </button>
                  <button 
                    onClick={() => { setAspectRatio('4:3'); playSound('click'); }} 
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${aspectRatio === '4:3' ? 'bg-orange-600 text-white' : 'text-zinc-400'}`}
                  >
                    Standard (4:3)
                  </button>
                </div>
              </RibbonGroup>
            </div>
          )}

          {/* TRANSITIONS - Morph fade push transitions times and live sounds */}
          {activeTab === 'Transitions' && (
            <>
              <RibbonGroup label="Transition effect">
                <select
                  value={activeSlide.transition || 'fade'}
                  onChange={(e) => {
                    const v = e.target.value as any;
                    setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, transition: v } : s));
                    setIsSaved(false);
                    const snd = activeSlide.transitionSound || 'none';
                    if (snd !== 'none') playSound(snd);
                  }}
                  className="bg-zinc-800 text-xs border border-zinc-700 rounded p-1 font-bold text-white cursor-pointer"
                >
                  <option value="none">Instant Switch</option>
                  <option value="fade">Fade Flow</option>
                  <option value="slide-left">Slide Leftward</option>
                  <option value="slide-right">Slide Rightward</option>
                  <option value="push-up">Push Upward</option>
                  <option value="zoom">Reveal Zoom</option>
                  <option value="flip">3D Flip Card</option>
                </select>
              </RibbonGroup>

              <RibbonGroup label="Timing Duration (Speed)">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-350 font-mono">
                  <span>{activeSlide.transitionDuration || 600}ms</span>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={100}
                    value={activeSlide.transitionDuration || 600}
                    onChange={(e) => {
                      const dur = parseInt(e.target.value);
                      setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, transitionDuration: dur } : s));
                      setIsSaved(false);
                    }}
                    className="w-24 cursor-pointer accent-orange-500"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Transition Audio Synth Trigger">
                <select
                  value={activeSlide.transitionSound || 'none'}
                  onChange={(e) => {
                    const snd = e.target.value as any;
                    setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, transitionSound: snd } : s));
                    setIsSaved(false);
                    playSound(snd);
                  }}
                  className="bg-zinc-800 text-xs border border-zinc-700 rounded p-1 text-orange-400 font-bold cursor-pointer"
                >
                  <option value="none">🔇 Silent Switch</option>
                  <option value="chime">🔔 Cosmic Chime</option>
                  <option value="whoosh">💨 Low Sweep Whoosh</option>
                  <option value="laser">⚡ Retro Laser Beam</option>
                  <option value="click">🖱️ Snappy Mouse Click</option>
                </select>
              </RibbonGroup>
            </>
          )}

          {/* ANIMATIONS TAB - Entrance Motion properties, delay slide control */}
          {activeTab === 'Animations' && (
            <>
              {selectedElement ? (
                <>
                  <RibbonGroup label="Selected Element Entrance Style">
                    <div className="flex bg-zinc-800 rounded p-0.5">
                      {(['none', 'fade', 'fly-in', 'zoom', 'bounce', 'spin', 'pulse'] as const).map(anim => (
                        <button
                          key={anim}
                          onClick={() => {
                            updateElement(selectedElement.id, { animationStyle: anim });
                            playSound('click');
                          }}
                          className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${selectedElement.animationStyle === anim ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>
                  </RibbonGroup>

                  <RibbonGroup label="Stagger / Entrance Delay">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 font-mono">
                      <span>{selectedElement.animationDelay || 0}ms</span>
                      <input
                        type="range"
                        min={0}
                        max={1500}
                        step={100}
                        value={selectedElement.animationDelay || 0}
                        onChange={(e) => updateElement(selectedElement.id, { animationDelay: parseInt(e.target.value) })}
                        className="w-24 cursor-pointer accent-orange-500"
                      />
                    </div>
                  </RibbonGroup>

                  <div className="text-[10px] text-green-400 font-bold self-center animate-pulse">
                    ⚡ applied motion to selected element
                  </div>
                </>
              ) : (
                <span className="text-xs text-zinc-400 italic self-center px-6">Click on any slide text box, shape, or picture first to configure element motions.</span>
              )}
            </>
          )}

          {/* SLIDE SHOW - presenter View setup, record presentation, rehearse timings duration */}
          {activeTab === 'Slide Show' && (
            <>
              <RibbonGroup label="Interactive Show Mode">
                <button onClick={() => startPresentation(true)} className="p-1 px-2 text-xs font-bold bg-green-700 hover:bg-green-600 text-white rounded flex items-center gap-1 shadow">
                  <Play size={13} fill="currentColor" />
                  <span>From Start [F5]</span>
                </button>
                <button onClick={() => startPresentation(false)} className="p-1 px-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-750 text-white rounded flex items-center gap-1">
                  <Monitor size={13} />
                  <span>From Selected</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Interactive Presenter Panel">
                <button 
                  onClick={() => { setShowPresenterMode(true); startPresentation(false); }}
                  className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded flex items-center gap-1 border border-zinc-700"
                  id="open_presenter_view_btn"
                >
                  <Columns size={13} className="text-orange-400" />
                  <span>Show Presenter View</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Stopwatch Rehearsal Stats">
                <div className="flex items-center gap-2 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-850">
                  <span className="font-mono text-orange-400 font-bold text-xs">{formatRehearsalTime(rehearsalTime)}</span>
                  <button 
                    onClick={() => { setRehearsalActive(!rehearsalActive); playSound('click'); }} 
                    className={`p-0.5 text-[9px] font-bold rounded px-1.5 ${rehearsalActive ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}
                  >
                    {rehearsalActive ? 'Stop' : 'Rehearse'}
                  </button>
                  <button onClick={() => setRehearsalTime(0)} className="text-[8px] bg-zinc-800 rounded p-0.5 hover:bg-zinc-750 text-zinc-400 uppercase">Clear</button>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Voice Deck Recorder (Simulated)">
                <div className="flex items-center gap-2 bg-zinc-850 p-1 rounded">
                  <button 
                    onClick={() => { setRecordingActive(!recordingActive); playSound('click'); }}
                    className={`font-semibold p-1 px-2.5 rounded text-[10px] text-white flex items-center gap-1 ${recordingActive ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 block animate-ping" />
                    <span>{recordingActive ? `REC ${recordingTime}s` : 'Record Show'}</span>
                  </button>
                </div>
              </RibbonGroup>
            </>
          )}

          {/* REVIEW TAB - spelling check, thesaurus helper, comments feed list */}
          {activeTab === 'Review' && (
            <>
              <RibbonGroup label="Spelling & Proofing">
                <button onClick={runSpellCheck} className="p-1 px-2 text-xs font-bold bg-zinc-80s bg-zinc-800 hover:bg-zinc-755 rounded border border-zinc-700 flex items-center gap-1 cursor-pointer">
                  <CheckSquare size={13} className="text-emerald-400" />
                  <span>Run Auto Spellcheck</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Corporate Thesaurus">
                <button onClick={runThesaurus} disabled={!selectedElementId} className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 text-xs font-bold rounded flex items-center gap-1 border border-zinc-700">
                  <Sparkles size={13} className="text-yellow-400" />
                  <span>Synonyms Thesaurus</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Collaborator Viewers">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>Sarah (Online)</span>
                  <span className="text-zinc-800">|</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>Mark (Offline)</span>
                </div>
              </RibbonGroup>
            </>
          )}

          {/* VIEW TAB - Normal, Outline view, Slide Sorter view and dynamic Helpers */}
          {activeTab === 'View' && (
            <>
              <RibbonGroup label="Workspace Deck Screens">
                <button 
                  onClick={() => { setWorkspaceView('normal'); playSound('click'); }}
                  className={`p-1 px-2.5 text-xs font-bold rounded flex items-center gap-1 ${workspaceView === 'normal' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  <Eye size={13} />
                  <span>Normal View</span>
                </button>
                <button 
                  onClick={() => { setWorkspaceView('outline'); playSound('click'); }}
                  className={`p-1 px-2.5 text-xs font-bold rounded flex items-center gap-1 ${workspaceView === 'outline' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                  id="tab_outline_view_btn"
                >
                  <FileText size={13} />
                  <span>Outline Text</span>
                </button>
                <button 
                  onClick={() => { setWorkspaceView('sorter'); playSound('click'); }}
                  className={`p-1 px-2.5 text-xs font-bold rounded flex items-center gap-1 ${workspaceView === 'sorter' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                  id="tab_sorter_view_btn"
                >
                  <Grid size={13} />
                  <span>Slide Sorter</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Sizing Presets Preview">
                <button onClick={() => startPresentation(true)} className="p-1 px-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-200">
                  🗂️ Fullscreen Mode
                </button>
              </RibbonGroup>

              <RibbonGroup label="Design Helpers Overlay">
                <button 
                  onClick={() => setShowGuides(!showGuides)} 
                  className={`p-1 px-2 text-[10px] font-bold rounded flex items-center gap-1 ${showGuides ? 'bg-orange-600 text-white' : 'bg-zinc-800'}`}
                >
                  <Grid size={11} />
                  <span>Smart Guides</span>
                </button>
                <button 
                  onClick={() => setShowGridlines(!showGridlines)} 
                  className={`p-1 px-2 text-[10px] font-bold rounded flex items-center gap-1 ${showGridlines ? 'bg-orange-600 text-white' : 'bg-zinc-800'}`}
                >
                  <Columns size={11} />
                  <span>Gridlines</span>
                </button>
              </RibbonGroup>
            </>
          )}

        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left side panel views (Normal Slide list OR Outline Text outline hierarchy) */}
        {workspaceView === 'outline' ? (
          <div className="w-[140px] sm:w-[180px] border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto p-3 text-xs hide-scrollbar" id="outline_view_sidebar">
            <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-3 border-b border-zinc-800 pb-1">Text Outlines</h4>
            {slides.map((s, sIdx) => {
              const textEls = s.elements.filter(e => e.type === 'text');
              return (
                <div key={s.id} onClick={() => setActiveSlideIndex(sIdx)} className={`p-2 rounded mb-2 cursor-pointer border hover:bg-zinc-900 transition-all ${sIdx === activeSlideIndex ? 'border-orange-500 bg-orange-950/10' : 'border-zinc-850'}`}>
                  <div className="text-[9px] font-extrabold text-zinc-500 mb-1">SLIDE {sIdx + 1}</div>
                  {textEls.length > 0 ? (
                    <div className="flex flex-col gap-1 text-[10px] text-zinc-350 italic pl-1 border-l border-zinc-800">
                      {textEls.map(tx => (
                        <div key={tx.id} className="truncate select-text hover:text-white" title="Double click slide card to edit line content">
                          {tx.text || 'Untitled box'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[9px] italic text-zinc-600">Blank layout</div>
                  )}
                </div>
              );
            })}
            <button onClick={() => addSlide('title-body')} className="border border-dashed border-zinc-800 p-2 text-center rounded text-zinc-500 font-bold hover:border-orange-500 hover:text-orange-400 text-[10px] transition-all">
              + New Slide
            </button>
          </div>
        ) : workspaceView === 'normal' ? (
          <div className="w-[120px] sm:w-[150px] border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto p-2 gap-2 pb-12 select-none hide-scrollbar" id="normal_thumbnails_sidebar">
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest sticky top-0 bg-zinc-950 py-1 flex items-center justify-between border-b border-zinc-900 mb-1">
              <span>SLIDES ({slides.length})</span>
              <span className="text-orange-500 font-bold font-mono">{aspectRatio}</span>
            </div>

            {slides.map((slide, idx) => (
              <div 
                key={slide.id}
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setSelectedElementId(null);
                  setEditingTextElementId(null);
                  const snd = slide.transitionSound || 'none';
                  if (snd !== 'none') playSound(snd);
                }}
                className={`group flex flex-col rounded p-1.5 border cursor-pointer hover:border-orange-500/60 transition-all ${
                  activeSlideIndex === idx ? 'border-orange-500 bg-orange-950/25 ring-1 ring-orange-500/30' : 'border-zinc-850 hover:bg-zinc-900'
                }`}
                id={`thumbnail_slide_${idx}`}
              >
                <div className="flex justify-between items-center text-[8.5px] font-bold text-zinc-500 mb-1">
                  <span>SLIDE {idx + 1}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-orange-400 capitalize">{slide.transition || 'fade'}</span>
                </div>
                <div 
                  className={`w-full rounded border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center pointer-events-none ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
                  style={{ background: slide.bgGradient || slide.bgColor }}
                >
                  {slide.elements.length > 0 ? (
                    <div className="absolute inset-0 scale-[0.2] w-[500%] h-[500%] origin-top-left p-3 flex flex-col justify-center">
                      {slide.elements.filter(e => e.type === 'text' && e.text).slice(0, 2).map((e) => (
                        <div key={e.id} className="truncate tracking-wide leading-tight text-center font-bold" style={{ color: e.color || slide.textColor, fontSize: '20px' }}>
                          {e.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[8px] text-zinc-600 uppercase">Blank slide</span>
                  )}
                </div>
              </div>
            ))}

            <button 
              onClick={() => addSlide('title-body')}
              className="flex items-center gap-1 justify-center py-2 px-1 text-center rounded border border-dashed border-zinc-800 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-500/5 text-[11px] font-bold text-zinc-500 transition-all"
              id="add_slide_sidebar_btn"
            >
              <Plus size={12} />
              <span>Add Slide</span>
            </button>
          </div>
        ) : null}

        {/* Central Core Viewport Stage (Sorter OR Normal central canvas) */}
        {workspaceView === 'sorter' ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-zinc-950" id="sorter_view_viewport">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Full Slide Sorter Grid View</h2>
                  <p className="text-[11px] text-zinc-400">Bird’s-eye list. Relocates, clones, or archives entire deck frames easily.</p>
                </div>
                <button onClick={() => { setWorkspaceView('normal'); playSound('click'); }} className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded border border-zinc-700 text-white flex items-center gap-1">
                  Exit Grid View
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {slides.map((slide, idx) => (
                  <div 
                    key={slide.id}
                    onClick={() => {
                      setActiveSlideIndex(idx);
                      setWorkspaceView('normal');
                      playSound('click');
                    }}
                    className={`group rounded-lg border bg-zinc-900 overflow-hidden cursor-pointer transition-all hover:scale-102 hover:border-orange-500 ${
                      activeSlideIndex === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-zinc-800'
                    }`}
                  >
                    <div className="p-1 px-2.5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between text-[10px] font-bold">
                      <span className="text-zinc-500">Slide {idx + 1}</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); moveSlideInSorter(idx, 'up'); }} disabled={idx === 0} className="p-0.5 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"><MoveUp size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveSlideInSorter(idx, 'down'); }} disabled={idx === slides.length - 1} className="p-0.5 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"><MoveDown size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); duplicateSlide(); }} className="p-0.5 hover:bg-zinc-800 text-teal-400"><Copy size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteSlide(); }} className="p-0.5 hover:bg-zinc-800 text-red-400"><Trash2 size={10} /></button>
                      </div>
                    </div>
                    <div 
                      className={`w-full relative flex flex-col justify-center items-center overflow-hidden bg-zinc-950 ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
                      style={{ background: slide.bgGradient || slide.bgColor }}
                    >
                      <div className="absolute scale-[0.25] w-[400%] h-[400%] origin-top-left p-4 text-center select-none pointer-events-none flex flex-col justify-center">
                        {slide.elements.filter(e => e.type === 'text' && e.text).slice(0, 2).map((e) => (
                          <div key={e.id} className="truncate tracking-widest font-extrabold text-[24px]" style={{ color: e.color || slide.textColor }}>
                            {e.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addSlide('title-body')}
                  className="border-2 border-dashed border-zinc-800 hover:border-orange-500/80 rounded-lg p-5 flex flex-col items-center justify-center gap-1.5 hover:bg-orange-500/5 text-zinc-500 hover:text-orange-400 transition-all aspect-video justify-center"
                >
                  <Plus size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add New Frame</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Central design sandbox viewport */
          <div className="flex-1 flex flex-col p-4 sm:p-6 bg-zinc-900/60 overflow-y-auto items-center justify-center relative" id="design_sandbox_main_viewport">
            
            {/* Thesaurus dialog floating box */}
            {thesaurusActive && (
              <div className="absolute top-4 z-40 bg-zinc-950/95 border-2 border-yellow-600/60 p-3 rounded-lg shadow-xl max-w-sm text-xs select-none backdrop-blur animate-in slide-in-from-top-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-yellow-400 uppercase tracking-widest text-[9px]">Thesaurus Synonyms for "{thesTargetWord}"</span>
                  <button onClick={() => setThesaurusActive(false)} className="text-xs text-zinc-500 hover:text-white">✕</button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2 mb-1">
                  {thesSynonyms.map((syn) => (
                    <button key={syn} onClick={() => applySynonym(syn)} className="bg-zinc-850 hover:bg-orange-600/80 text-white font-bold p-1 px-2.5 rounded text-[11px] border border-zinc-700 whitespace-nowrap transition-all">
                      {syn}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-zinc-500 italic mt-2">💡 Synonyms elevate presentation aesthetic phrasing.</div>
              </div>
            )}

            {/* Proofing panel */}
            {proofingRan && spellIssues.length > 0 && (
              <div className="absolute top-4 right-4 z-40 bg-zinc-950 p-3 rounded border border-emerald-800 text-xs w-[240px] shadow-2xl backdrop-blur animate-in slide-in-from-right-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-2">
                  <span className="font-semibold text-emerald-400 text-[10px] tracking-widest uppercase flex items-center gap-1">✨ SPELLING DETECTION</span>
                  <button onClick={() => setProofingRan(false)} className="text-[10px] text-zinc-500 hover:text-white">✕</button>
                </div>
                <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1 text-[11px] select-text">
                  {spellIssues.map((iss, iIdx) => (
                    <div key={iIdx} className="p-1 px-1.5 bg-zinc-900 rounded border border-zinc-800 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 font-mono">"{iss.typo}"</span>
                        <button onClick={() => correctSpellIssue(iss.id, iss.typo, iss.correction)} className="p-0.5 px-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[9px] uppercase">
                          Fix as "{iss.correction}"
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {proofingRan && spellIssues.length === 0 && (
              <div className="absolute top-4 z-40 bg-emerald-950/90 border border-emerald-600 p-2.5 px-4 rounded text-xs animate-pulse text-emerald-300">
                ✔️ Spellchecker: No typical typographical errors detected on this slide.
              </div>
            )}

            <div className="w-full max-w-[850px]" id="slide_stage_container">
              
              {/* Dynamic canvas wrapper responsive sizing */}
              <div 
                ref={canvasRef}
                className={`w-full relative shadow-[0_12px_44px_rgba(0,0,0,0.55)] border border-zinc-800 rounded bg-zinc-950 overflow-hidden select-none transition-all ${
                  aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'
                }`}
                style={{ background: activeSlide.bgGradient || activeSlide.bgColor }}
                onClick={() => {
                  setSelectedElementId(null);
                  setEditingTextElementId(null);
                }}
              >
                {/* Visual Guides overlay */}
                {showGuides && (
                  <div className="absolute inset-0 pointer-events-none select-none z-10">
                    <div className="absolute top-1/2 inset-x-0 h-px border-t border-dashed border-orange-500/25" />
                    <div className="absolute left-1/2 inset-y-0 w-px border-l border-dashed border-orange-500/25" />
                  </div>
                )}

                {/* Construction grid lines */}
                {showGridlines && (
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-[0.05] pointer-events-none select-none z-10 border border-zinc-500/20">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-zinc-400" />
                    ))}
                  </div>
                )}

                {/* Elements generator Loop */}
                {activeSlide.elements.map((el) => {
                  const sSel = el.id === selectedElementId;
                  const sEdit = el.id === editingTextElementId;

                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleElementMouseDown(e, el)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (el.type === 'text') { setEditingTextElementId(el.id); }
                      }}
                      className={`absolute select-none transition-shadow ${
                        sSel ? 'ring-2 ring-orange-500 cursor-move z-20 shadow-xl' : 'hover:ring-1 hover:ring-zinc-600 cursor-pointer z-10'
                      }`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.w}%`,
                        height: `${el.h}%`,
                        fontStyle: el.italic ? 'italic' : 'normal',
                        fontWeight: el.bold ? 'bold' : 'normal',
                        fontFamily: el.fontFamily || activeSlide.fontTheme || 'inherit'
                      }}
                      id={`slide_item_${el.id}`}
                    >
                      {/* RENDERERS */}
                      {el.type === 'text' && (
                        <div className="w-full h-full flex flex-col justify-center overflow-hidden">
                          {sEdit ? (
                            <textarea
                              value={el.text || ''}
                              onChange={(e) => updateElement(el.id, { text: e.target.value })}
                              onBlur={() => setEditingTextElementId(null)}
                              onKeyDown={(e) => { if (e.key === 'Escape') setEditingTextElementId(null); }}
                              className="w-full h-full bg-zinc-850 text-white outline-none p-1 text-xs resize-none font-sans ring-1 ring-orange-500"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="break-words leading-tight select-none outline-none whitespace-pre-wrap"
                              style={{ 
                                color: el.color || activeSlide.textColor,
                                fontSize: el.fontSize ? `${(el.fontSize / 480) * 100}cqw` : '15px',
                                textAlign: el.align || 'center'
                              }}
                            >
                              {el.text || 'Double click to edit line'}
                            </div>
                          )}
                        </div>
                      )}

                      {el.type === 'shape' && (
                        <div 
                          className="w-full h-full transition-all"
                          style={{
                            backgroundColor: el.bgColor || '#38bdf8',
                            borderColor: el.borderColor || '#0284c7',
                            borderWidth: el.borderColor ? '2px' : '0px',
                            borderRadius: el.shapeType === 'circle' ? '50%' : '2px',
                            clipPath: el.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : el.shapeType === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : el.shapeType === 'bubble' ? 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)' : 'none'
                          }}
                        />
                      )}

                      {el.type === 'image' && el.url && (
                        <img src={el.url} alt="Media link" className="w-full h-full object-cover rounded pointer-events-none select-none border border-zinc-700" />
                      )}

                      {el.type === 'table' && (
                        <div className="w-full h-full bg-zinc-950/60 p-1 rounded border border-zinc-700 overflow-auto font-sans text-[10px]">
                          <table className="w-full h-full border-collapse">
                            <tbody>
                              {(el.tableRows || [['Item', 'Count']]).map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx === 0 ? "bg-zinc-800/80 font-bold border-b border-zinc-700 text-orange-400" : "border-b border-zinc-800/50"}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-1 text-center border-r border-zinc-800 truncate" style={{ color: el.color || activeSlide.textColor }}>
                                      {sEdit ? (
                                        <input 
                                          type="text" 
                                          value={cell} 
                                          onChange={(e) => {
                                            const original = [...(el.tableRows || [])];
                                            original[rIdx][cIdx] = e.target.value;
                                            updateElement(el.id, { tableRows: original });
                                          }}
                                          className="w-full h-full bg-zinc-850 p-0 text-center text-white text-[9px] rounded border border-zinc-600"
                                        />
                                      ) : cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {el.type === 'chart' && (
                        <div className="w-full h-full bg-zinc-950/70 p-2 rounded border border-zinc-800 flex flex-col justify-between">
                          <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase">{el.chartType || 'bar'} slide metrics</span>
                          <div className="flex-1 flex gap-2 items-end justify-center pt-2.5 pb-1">
                            {(el.chartData || [{ label: 'A', value: 50 }, { label: 'B', value: 90 }]).map((pt, pIdx) => (
                              <div key={pIdx} className="flex-1 flex flex-col h-full justify-end items-center">
                                {el.chartType === 'line' ? (
                                  <div className="w-1.5 h-1.5 bg-sky-400 rounded-full relative" style={{ bottom: `${pt.value / 1.5}%` }} />
                                ) : el.chartType === 'pie' ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ borderColor: el.color || '#38bdf8', transform: `rotate(${pIdx * 60}deg)` }} />
                                ) : (
                                  <div className="w-full bg-orange-500/80 hover:bg-orange-400 rounded-t shrink-0" style={{ height: `${pt.value}%` }} />
                                )}
                                <span className="text-[6.5px] text-zinc-500 font-mono mt-1">{pt.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {el.type === 'icon' && (
                        <div className="w-full h-full flex items-center justify-center">
                          {el.iconName === 'Lightbulb' && <Lightbulb size={28} className="text-amber-400 fill-amber-950" />}
                          {el.iconName === 'Compass' && <Compass size={28} className="text-teal-400" />}
                          {el.iconName === 'Users' && <Users size={28} className="text-violet-400" />}
                          {el.iconName === 'Heart' && <Users size={28} className="text-red-400" />}
                          {!el.iconName || el.iconName === 'Sparkles' ? <Sparkles size={28} className="text-yellow-400 fill-yellow-950" /> : null}
                        </div>
                      )}

                      {el.type === 'video' && (
                        <div className="w-full h-full bg-red-950/30 rounded border border-red-900/60 flex flex-col items-center justify-center relative overflow-hidden">
                          <span className="absolute top-1 text-[7px] font-bold bg-red-600 px-1 text-white">INTERACTIVE CAMERA FEED</span>
                          <Play size={16} className="text-white fill-current opacity-60 animate-pulse" />
                        </div>
                      )}

                      {el.type === 'audio' && (
                        <div className="w-full h-full bg-zinc-950/90 p-1.5 border border-zinc-700/80 rounded flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-bold text-zinc-400">AMB SYNTH LOOP</span>
                            <span className="text-[5.5px] font-mono text-emerald-400">STATUS READY</span>
                          </div>
                          <button onClick={() => playSound('chime')} className="p-0.5 bg-zinc-800 text-zinc-400 hover:text-white rounded"><Volume2 size={11} /></button>
                        </div>
                      )}

                      {/* Transform Sizing Nodes Overlay */}
                      {sSel && !sEdit && (
                        <>
                          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nwse-resize z-30" onMouseDown={(e) => handleElementMouseDown(e, el, 'nw')} />
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nesw-resize z-30" onMouseDown={(e) => handleElementMouseDown(e, el, 'ne')} />
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nwse-resize z-30" onMouseDown={(e) => handleElementMouseDown(e, el, 'se')} />
                          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full cursor-nesw-resize z-30" onMouseDown={(e) => handleElementMouseDown(e, el, 'sw')} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editable Slide Speaker Notes under standard viewport */}
            <div className="w-full max-w-[850px] mt-4 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex flex-col gap-1 select-none">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <span>Presenter Speaker Notes for Slide {activeSlideIndex + 1}</span>
                <span className="text-orange-500">Edit below</span>
              </div>
              <textarea
                value={speakerNotes[activeSlide.id] || ''}
                onChange={(e) => setSpeakerNotes({ ...speakerNotes, [activeSlide.id]: e.target.value })}
                className="w-full bg-zinc-900 border-0 outline-none text-zinc-300 font-sans p-1 text-xs h-[45px] resize-none focus:ring-1 focus:ring-orange-500 rounded tracking-wide leading-relaxed"
                placeholder="Click here to add notes of what you'll talk during this slide presentation..."
                id="speaker_notes_box"
              />
            </div>
          </div>
        )}

        {/* Right Comments panel always visible on Review and optionally on Home */}
        {(activeTab === 'Review' || activeTab === 'Home') && workspaceView === 'normal' && (
          <div className="w-[180px] sm:w-[220px] border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto p-3 text-xs justify-between" id="comments_reviewer_sidebar">
            <div className="flex-1 flex flex-col overflow-y-auto pr-1 hide-scrollbar">
              <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-3 border-b border-zinc-800 pb-1">Peer Reviews Comments</h4>
              
              <div className="flex flex-col gap-2.5">
                {(comments[activeSlide.id] || []).map(c => (
                  <div key={c.id} className="p-2 bg-zinc-900 rounded border border-zinc-850/80 relative group">
                    <div className="flex justify-between items-center text-[9px] font-bold text-orange-400 mb-0.5">
                      <span>{c.author}</span>
                      <button onClick={() => deleteComment(c.id)} className="text-[9px] text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-zinc-350 select-text">{c.text}</p>
                    <span className="text-[7.5px] text-zinc-600 font-mono block text-right mt-1">{c.time}</span>
                  </div>
                ))}

                {(comments[activeSlide.id] || []).length === 0 && (
                  <span className="text-[10px] text-zinc-650 italic block text-center py-4">No designer feedback recorded yet.</span>
                )}
              </div>
            </div>

            <form onSubmit={handleCommentSubmit} className="mt-3.5 border-t border-zinc-900 pt-3 flex flex-col gap-1.5 shrink-0">
              <input
                type="text"
                placeholder="Write comment..."
                value={newCommentStr}
                onChange={(e) => setNewCommentStr(e.target.value)}
                className="bg-zinc-900 p-1 px-2 border-0 outline-none hover:bg-zinc-850 text-[10px] text-white rounded w-full focus:ring-1 focus:ring-orange-500"
              />
              <button type="submit" className="w-full py-1 text-center bg-orange-600 hover:bg-orange-700 text-xs text-white rounded font-bold transition-all uppercase text-[9px]">
                Submit Feedback
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Footer bar */}
      <div className="flex justify-between items-center py-2 px-4 border-t border-zinc-800 text-[10.5px] text-zinc-500 bg-zinc-950 shrink-0 select-none">
        <div className="flex items-center gap-3 font-semibold">
          <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
          <span className="text-zinc-800">|</span>
          <span>Workspace: {workspaceView.toUpperCase()} MODE</span>
          <span className="text-zinc-800">|</span>
          <span>Ratio: {aspectRatio}</span>
          <span className="text-zinc-800">|</span>
          {rehearsalActive && <span className="text-red-500 animate-pulse font-mono font-bold">⏱️ REHEARSAL LIMITER LIVE: {formatRehearsalTime(rehearsalTime)}</span>}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-1 py-0.2 bg-zinc-900 border border-zinc-800 rounded font-mono text-[8px] uppercase text-zinc-400">Powerpoint Powerhouse Suite</span>
        </div>
      </div>

      {/* Immersive Slideshow Player Screen Overlay */}
      {isPlaying && (
        <div className="fixed inset-0 bg-zinc-950 text-white z-50 flex flex-col justify-between p-4 sm:p-5 select-none animate-in fade-in duration-200">
          
          <div className="flex justify-between items-center bg-zinc-900/60 p-2.5 px-4 rounded-lg border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow animate-pulse">
                {showPresenterMode ? 'PRESENTER VIEW ACTIVE' : 'LIVE PRESENTATION'}
              </span>
              <span className="text-xs font-semibold truncate text-zinc-200 max-w-sm">
                Deck: {title}
              </span>
            </div>
            
            <button 
              onClick={() => { setIsPlaying(false); setShowPresenterMode(false); }}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg active:scale-95 transition-all"
            >
              Close Playback (Esc)
            </button>
          </div>

          {/* SPREAD MULTI COLUMN IF PRESENTER VIEW */}
          {showPresenterMode ? (
            <div className="flex-1 flex gap-5 p-2 overflow-hidden items-stretch py-4">
              {/* Left Column Presenter Slide View */}
              <div className="flex-[2] flex flex-col items-center justify-center bg-zinc-900 p-3 rounded-xl border border-zinc-800 justify-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 self-start">Current Active Screen (Audience)</span>
                <div 
                  key={playIndex}
                  className={`w-full aspect-[16/9] text-zinc-950 relative shadow-2xl rounded border border-zinc-900 overflow-hidden select-none transition-${slides[playIndex]?.transition || 'fade'}`}
                  style={{ 
                    background: slides[playIndex]?.bgGradient || slides[playIndex]?.bgColor || '#111827',
                    animationDuration: `${slides[playIndex]?.transitionDuration || 650}ms`
                  }}
                >
                  {slides[playIndex]?.elements.map((el) => (
                    <div
                      key={el.id}
                      className="absolute pointer-events-none select-none"
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.w}%`,
                        height: `${el.h}%`,
                        fontStyle: el.italic ? 'italic' : 'normal',
                        fontWeight: el.bold ? 'bold' : 'normal',
                        fontFamily: el.fontFamily || slides[playIndex]?.fontTheme || 'inherit',
                      }}
                    >
                      {el.type === 'text' && (
                        <div className="w-full h-full flex flex-col justify-center overflow-hidden">
                          <div className="break-words leading-tight" style={{ color: el.color || slides[playIndex]?.textColor, fontSize: el.fontSize ? `${(el.fontSize / 512) * 100}cqw` : '18px', textAlign: el.align || 'center' }}>
                            {el.text}
                          </div>
                        </div>
                      )}
                      {el.type === 'shape' && (
                        <div className="w-full h-full transition-all" style={{ backgroundColor: el.bgColor || '#38bdf8', borderRadius: el.shapeType === 'circle' ? '50%' : '2px', clipPath: el.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none' }} />
                      )}
                      {el.type === 'image' && el.url && (
                        <img src={el.url} alt="slide img" className="w-full h-full object-cover rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Metadata and notes */}
              <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-zinc-900 p-4 rounded-xl border border-zinc-800 gap-4">
                {/* Rehearsal stop timer */}
                <div className="p-2 border border-zinc-800 rounded bg-zinc-950 flex justify-between items-center text-xs">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-zinc-400">⏱️ Stopwatch timer:</span>
                  <span className="font-mono text-orange-400 font-extrabold text-base">{formatRehearsalTime(rehearsalTime)}</span>
                </div>

                {/* Speaker notes section */}
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-1 mb-1 border-b border-zinc-800">Your speaker speech notes:</span>
                  <textarea
                    value={speakerNotes[slides[playIndex]?.id] || ''}
                    onChange={(e) => setSpeakerNotes({ ...speakerNotes, [slides[playIndex]?.id]: e.target.value })}
                    className="w-full flex-1 bg-zinc-950 p-2 border-0 rounded text-xs text-zinc-200 outline-none resize-none leading-relaxed"
                    placeholder="Enter thoughts line speaker notes for active slides..."
                  />
                </div>

                {/* Slide index preview queue */}
                <div className="p-2 border border-zinc-800 rounded bg-zinc-950 text-xs">
                  <span className="font-extrabold text-[9px] uppercase tracking-wider block text-zinc-500 mb-1">Up Next (Slide {playIndex + 2} of {slides.length}):</span>
                  <p className="font-semibold text-zinc-300 truncate">
                    {slides[playIndex + 1] ? (slides[playIndex + 1].elements[0]?.text || 'Untitled slide body') : 'None (End of presentation Deck!)'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Audience Slideshow Fullscreen View */
            <div className="flex-1 flex items-center justify-center p-2.5">
              <div 
                key={playIndex}
                className={`w-full max-w-5xl aspect-[16/9] text-zinc-950 relative shadow-2xl rounded border border-zinc-900 overflow-hidden select-none transition-${slides[playIndex]?.transition || 'fade'}`}
                style={{ 
                  background: slides[playIndex]?.bgGradient || slides[playIndex]?.bgColor || '#111827',
                  animationDuration: `${slides[playIndex]?.transitionDuration || 650}ms`
                }}
              >
                {slides[playIndex]?.elements.map((el) => {
                  const animStyle = el.animationStyle || 'none';
                  const delayStr = el.animationDelay ? `${el.animationDelay}ms` : '0ms';

                  return (
                    <div
                      key={el.id}
                      className={`absolute select-none pointer-events-none ${animStyle !== 'none' ? `anim-${animStyle}` : ''}`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.w}%`,
                        height: `${el.h}%`,
                        fontStyle: el.italic ? 'italic' : 'normal',
                        fontWeight: el.bold ? 'bold' : 'normal',
                        fontFamily: el.fontFamily || slides[playIndex]?.fontTheme || 'inherit',
                        animationDelay: delayStr
                      }}
                    >
                      {el.type === 'text' && (
                        <div className="w-full h-full flex flex-col justify-center overflow-hidden">
                          <div className="break-words leading-tight" style={{ color: el.color || slides[playIndex]?.textColor, fontSize: el.fontSize ? `${(el.fontSize / 512) * 100}cqw` : '18px', textAlign: el.align || 'center' }}>
                            {el.text}
                          </div>
                        </div>
                      )}

                      {el.type === 'shape' && (
                        <div className="w-full h-full transition-all" style={{ backgroundColor: el.bgColor || '#38bdf8', borderRadius: el.shapeType === 'circle' ? '50%' : '2px', clipPath: el.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none' }} />
                      )}

                      {el.type === 'image' && el.url && (
                        <img src={el.url} alt="slide img" className="w-full h-full object-cover rounded pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Player dashboard triggers footer */}
          <div className="flex justify-between items-center text-zinc-400 text-xs mt-2 border-t border-zinc-900 pt-3">
            <div className="flex gap-2 items-center">
              <span className="font-bold text-zinc-350">Slide {playIndex + 1} of {slides.length}</span>
              <span className="text-zinc-800">|</span>
              <button 
                onClick={() => { 
                  if (playIndex > 0) {
                    const prevIdx = playIndex - 1;
                    setPlayIndex(prevIdx);
                    const snd = slides[prevIdx]?.transitionSound || 'none';
                    if (snd !== 'none') playSound(snd);
                  } 
                }}
                disabled={playIndex === 0}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ◀ Back
              </button>
              <button 
                onClick={() => { 
                  if (playIndex < slides.length - 1) {
                    const nextIdx = playIndex + 1;
                    setPlayIndex(nextIdx);
                    const snd = slides[nextIdx]?.transitionSound || 'none';
                    if (snd !== 'none') playSound(snd);
                  } else {
                    setIsPlaying(false);
                    setShowPresenterMode(false);
                  } 
                }}
                className="px-3.5 py-1 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold rounded"
              >
                Next ▶
              </button>
            </div>

            <div className="text-center text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">
              ⌨️ Hit Space / Right Arrow to advance, Left Arrow to regress slides.
            </div>

            <div className="text-zinc-500 text-right font-mono text-[9px] uppercase tracking-wider">
              Sound: {slides[playIndex]?.transitionSound || 'none'} | Duration: {slides[playIndex]?.transitionDuration || 600}ms
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
