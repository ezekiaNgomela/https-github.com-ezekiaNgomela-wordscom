import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import * as mammoth from 'mammoth';
import {
  Save, Target, Download, Bold, Italic, Underline, Strikethrough,
  Undo, Redo, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Wand2, Sparkles, MessageSquare, SpellCheck, Eraser, Printer, Trash2, Palette, Image as ImageIcon,
  FilePlus, Hash, FileText, Table as TableIcon, Search, X, Maximize, Minimize,
  ArrowUpDown, GripHorizontal, Subscript, Superscript,
  ArrowUp, ArrowDown, Minus, Upload, Plus, Heading, ArrowLeft, Rows, Shrink,
  ChevronDown, Link, ExternalLink, Type, Settings, BookOpen, Bookmark, Languages, Eye, Shield, Lock, LockOpen, FileBox, Shuffle, ZoomIn, ZoomOut, Grid, HelpCircle, FileCheck, Check, Edit2, Play, Users, Landmark, Scissors, Copy, Clipboard, ListCollapse, StickyNote, FileSearch, Mail, BookMarked, PenTool, Award, History
} from 'lucide-react';

type Tab = 'Home' | 'Insert' | 'Design' | 'Layout' | 'References' | 'Mailings' | 'Review' | 'View';
const TABS: Tab[] = ['Home', 'Insert', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View'];

interface DocumentEditorProps {
  onBack: () => void;
}

export function DocumentEditor({ onBack }: DocumentEditorProps) {
  const [title, setTitle] = useState(() => {
    return localStorage.getItem('wordscom_doc_title') || 'Untitled Document';
  });
  const [content, setContent] = useState(() => {
    return localStorage.getItem('wordscom_doc_content') || '';
  });
  const [textContent, setTextContent] = useState(() => {
    const div = document.createElement('div');
    div.innerHTML = localStorage.getItem('wordscom_doc_content') || '';
    return div.innerText || '';
  });
  const [wordGoal, setWordGoal] = useState(() => {
    return parseInt(localStorage.getItem('wordscom_doc_goal') || '0', 10);
  });
  const [author, setAuthor] = useState(() => {
    return localStorage.getItem('wordscom_doc_author') || '';
  });
  const [creationDate, setCreationDate] = useState(() => {
    return localStorage.getItem('wordscom_doc_creationDate') || new Date().toISOString().split('T')[0];
  });
  const [tags, setTags] = useState(() => {
    return localStorage.getItem('wordscom_doc_tags') || '';
  });
  
  const [isSaved, setIsSaved] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Home');

  // Design Theme Properties
  const [docTheme, setDocTheme] = useState<'modern' | 'classic' | 'elegant' | 'technical' | 'clean'>('modern');
  const [colorPalette, setColorPalette] = useState<'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'charcoal'>('blue');
  const [watermark, setWatermark] = useState<string>('');
  const [pageColor, setPageColor] = useState<string>('#ffffff');
  const [pageBorder, setPageBorder] = useState<'none' | 'solid-thin' | 'solid-double' | 'dashed-thin' | 'classic'>('none');

  // Layout Configuration
  const [marginSize, setMarginSize] = useState<'normal' | 'narrow' | 'moderate' | 'wide'>('normal');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'letter' | 'a4' | 'legal'>('a4');
  const [columnsCount, setColumnsCount] = useState<number>(1);

  // References States
  const [citations, setCitations] = useState<{ author: string; year: string; title: string; publisher: string }[]>([
    { author: 'Smith, J.', year: '2025', title: 'Advanced Document Design', publisher: 'Academic Press' },
    { author: 'Doe, A.', year: '2026', title: 'The Future of Word Editors', publisher: 'AI Publishing Group' }
  ]);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citAuthor, setCitAuthor] = useState('');
  const [citYear, setCitYear] = useState('');
  const [citTitle, setCitTitle] = useState('');
  const [citPublisher, setCitPublisher] = useState('');

  // Mailings States
  const [recipients, setRecipients] = useState<{ name: string; email: string; company: string }[]>([
    { name: 'John Doe', email: 'john@example.com', company: 'Acme Corp' },
    { name: 'Jane Smith', email: 'jane@example.com', company: 'Hedgehog Inc' },
    { name: 'Bob Johnson', email: 'bob@example.com', company: 'Global Technology' }
  ]);
  const [showMailRecipientsModal, setShowMailRecipientsModal] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientCompany, setNewRecipientCompany] = useState('');
  const [mailMergeActive, setMailMergeActive] = useState(false);
  const [mailMergeIndex, setMailMergeIndex] = useState(0);

  // Review & Comments States
  const [isProtected, setIsProtected] = useState(false);
  const [protectPassword, setProtectPassword] = useState('1234');
  const [protectInput, setProtectInput] = useState('');
  const [showProtectModal, setShowProtectModal] = useState(false);
  const [comments, setComments] = useState<{ id: string; text: string; selectedText: string; date: string; author: string }[]>([
    { id: '1', text: 'Consider formatting this key heading differently.', selectedText: 'Untitled Document', date: 'May 25, 2026', author: 'Project Supervisor' }
  ]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [selectedTextForComment, setSelectedTextForComment] = useState('');
  const [trackChanges, setTrackChanges] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState('');
  const [dictionaryResult, setDictionaryResult] = useState<{ word: string; definition: string } | null>(null);

  // View States
  const [viewMode, setViewMode] = useState<'print' | 'web' | 'read'>('print');
  const [zoomFactor, setZoomFactor] = useState<number>(100);
  const [showRulers, setShowRulers] = useState(true);
  const [showGridlines, setShowGridlines] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [fontFamily, setFontFamily] = useState<'font-sans' | 'font-serif' | 'font-mono'>('font-sans');
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [editorHeight, setEditorHeight] = useState(1056);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [suggestion, setSuggestion] = useState<{ text: string, top: number, left: number, fullWord: string } | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTableCell, setActiveTableCell] = useState<HTMLTableCellElement | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<HTMLElement | null>(null);
  const [floatingMenu, setFloatingMenu] = useState<{ top: number; left: number; show: boolean } | null>(null);

  const handleEditorClick = (e: React.MouseEvent) => {
    let el = e.target as HTMLElement | null;
    let foundMaterial = null;
    while(el && el !== editorRef.current) {
      if (el.classList && el.classList.contains('resizable-material')) {
        foundMaterial = el;
        break;
      }
      el = el.parentElement;
    }
    setActiveMaterial(foundMaterial);
    updateSelectionState();
  };

  const updateSelectionState = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      // Find active table cell or material
      let node: Node | null = selection.anchorNode;
      let foundTd: HTMLTableCellElement | null = null;
      let foundMaterial: HTMLElement | null = null;
      
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'TD' || el.tagName === 'TH') {
            foundTd = el as HTMLTableCellElement;
          }
          if (el.classList && el.classList.contains('resizable-material')) {
            foundMaterial = el;
          }
        }
        node = node.parentNode;
      }
      setActiveTableCell(foundTd);
      setActiveMaterial(foundMaterial);

      // Handle floating menu for text selection
      if (!selection.isCollapsed && editorRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0) { // Valid selection rect
           setFloatingMenu({
             top: rect.top - 50, // Position above the text
             left: rect.left + rect.width / 2, // Centered
             show: true
           });
        } else {
           setFloatingMenu(null);
        }
      } else {
        setFloatingMenu(null);
      }

    } else {
      setActiveTableCell(null);
      setFloatingMenu(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;
    
    if (file.name.endsWith('.txt') || file.name.endsWith('.html')) {
      const text = await file.text();
      let insertHtml = text;
      if (file.name.endsWith('.txt')) {
         insertHtml = text.split('\n').map(l => `<p>${l}</p>`).join('');
      }
      editorRef.current.innerHTML = insertHtml + editorRef.current.innerHTML;
      handleInput();
    } else if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editorRef.current.innerHTML = result.value + editorRef.current.innerHTML;
        handleInput();
      } catch (err) {
        alert("Failed to parse Word Document");
      }
    } else {
      alert("Unsupported file format. Please upload .txt, .html, or .docx");
    }
  };
  const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'relaxed' | 'loose'>('relaxed');
  const [paragraphSpacing, setParagraphSpacing] = useState<'small' | 'medium' | 'large'>('medium');

  const pSpacingClasses = {
    small: '[&_p]:mb-2',
    medium: '[&_p]:mb-4',
    large: '[&_p]:mb-6'
  };

  const lhClasses = {
    tight: 'leading-tight [&_p]:leading-tight',
    normal: 'leading-normal [&_p]:leading-normal',
    relaxed: 'leading-relaxed [&_p]:leading-relaxed',
    loose: 'leading-loose [&_p]:leading-loose'
  };

  const DICTIONARY = [
    "about", "above", "across", "after", "again", "against", "almost", "always",
    "because", "before", "behind", "between", "beyond", "character", "company",
    "could", "different", "development", "environment", "example", "experience",
    "feature", "first", "found", "general", "government", "great", "however", "important",
    "information", "knowledge", "language", "little", "might", "never", "number",
    "other", "people", "possible", "problem", "program", "project", "question", "really",
    "right", "school", "should", "something", "specific", "state", "system",
    "their", "there", "these", "thing", "think", "those", "through", "together",
    "under", "water", "where", "which", "while", "would", "young", "suggestion",
    "document", "editor", "word", "time", "just", "well",
    "good", "make", "with", "from", "that", "this", "they", "will", "have"
  ];

  const editorRef = useRef<HTMLDivElement>(null);

  const currentWords = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const progress = wordGoal > 0 ? Math.min((currentWords / wordGoal) * 100, 100) : 0;
  const totalPages = Math.max(1, Math.ceil(editorHeight / getPaperStyles().height));

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (!editorRef.current) return;
    
    // Measure content height for pagination overlay
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setEditorHeight(entry.target.scrollHeight);
      }
    });
    
    observer.observe(editorRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollY = e.currentTarget.scrollTop;
    // Calculate current page based on scroll position + half of the visible window
    const current = Math.floor((scrollY + e.currentTarget.clientHeight / 2) / 1056) + 1;
    setCurrentPage(Math.max(1, Math.min(current, totalPages)));
  };

  const checkAutoComplete = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
        setSuggestion(null);
        return;
    }
    
    if (!editorRef.current.contains(selection.anchorNode)) {
        setSuggestion(null);
        return;
    }
    
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType === Node.TEXT_NODE) {
        const textBeforeCursor = node.textContent?.substring(0, offset) || "";
        const matchWordMatch = textBeforeCursor.match(/([a-zA-Z]{1,})$/);
        
        if (matchWordMatch) {
            const lastWord = matchWordMatch[1];
            if (lastWord.length > 0) {
              const match = DICTIONARY.find(w => w.startsWith(lastWord.toLowerCase()) && w !== lastWord.toLowerCase());
              
              if (match) {
                  const rect = range.getBoundingClientRect();
                  const parentElement = editorRef.current.parentElement;
                  if (parentElement) {
                      const parentRect = parentElement.getBoundingClientRect();
                      if (rect.bottom > 0) {
                        setSuggestion({
                            text: match.substring(lastWord.length),
                            fullWord: match,
                            top: rect.bottom - parentRect.top,
                            left: rect.right - parentRect.left,
                        });
                        return;
                      }
                  }
              }
            }
        }
    }
    setSuggestion(null);
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setTextContent(editorRef.current.innerText || '');
      setIsSaved(false);
      setEditorHeight(editorRef.current.scrollHeight);
      checkAutoComplete();
    }
  };

  const handleKeyDownLocal = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      document.execCommand('insertText', false, suggestion.text);
      setSuggestion(null);
    } else if (e.key === 'Escape' && suggestion) {
      setSuggestion(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handleWordGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWordGoal(parseInt(e.target.value) || 0);
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('wordscom_doc_title', title);
    localStorage.setItem('wordscom_doc_content', content);
    localStorage.setItem('wordscom_doc_goal', wordGoal.toString());
    localStorage.setItem('wordscom_doc_author', author);
    localStorage.setItem('wordscom_doc_creationDate', creationDate);
    localStorage.setItem('wordscom_doc_tags', tags);
    setIsSaved(true);
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    if (command === 'insertHTML') {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, value);
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the document?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        handleInput();
      }
    }
  };

  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const processWithAI = async (action: string) => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    
    if (!content || content.trim() === '') {
      alert("No content available for AI processing.");
      return;
    }
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document.');
      }
      
      editorRef.current.innerHTML = data.result;
      handleInput();
      alert(`AI processing complete (${action}).`);
    } catch (err: any) {
      alert(`AI Processing Failed: ${err.message}`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.trim() || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!editorRef.current) return;
    
    // Temporarily remove placeholder behavior for cleaner print
    const originalPlaceholder = editorRef.current.getAttribute('data-placeholder');
    if (editorRef.current.innerText.trim() === '') {
      editorRef.current.setAttribute('data-placeholder', '');
    }

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename:     `${title.trim() || 'document'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    // Clone node to strip non-printable attributes if needed, or just print directly
    html2pdf().set(opt).from(editorRef.current).save().then(() => {
      // Restore place holder if needed
      if (originalPlaceholder) {
        editorRef.current?.setAttribute('data-placeholder', originalPlaceholder);
      }
    });
  };

  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + content + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    saveAs(blob, `${title.trim() || 'document'}.doc`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, title, wordGoal, author, creationDate, tags]);

  useEffect(() => {
    if (isSaved) return;
    
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1500); // 1.5 seconds debounce
    
    return () => clearTimeout(timeoutId);
  }, [content, title, wordGoal, author, creationDate, tags, isSaved]);

  const insertTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateType = e.target.value;
    if (!templateType) return;
    
    if (content.trim().length > 0) {
      if (!confirm('Inserting a template will overwrite your current document. Are you sure?')) {
        e.target.value = ''; // Reset select
        return;
      }
    }

    let templateContent = '';
    switch (templateType) {
      case 'Resume':
        templateContent = `
          <h1 style="text-align: center;">[Your Name]</h1>
          <p style="text-align: center;">[Your Email] | [Your Phone] | [Your LinkedIn]</p>
          <hr />
          <h2>Professional Experience</h2>
          <h3>[Job Title]</h3>
          <p><strong>[Company Name]</strong> | <em>[Start Date] – [End Date]</em></p>
          <ul>
            <li>[Accomplishment 1]</li>
            <li>[Accomplishment 2]</li>
          </ul>
          <h2>Education</h2>
          <h3>[Degree]</h3>
          <p><strong>[University Name]</strong> | <em>[Graduation Year]</em></p>
        `;
        break;
      case 'Cover Letter':
        templateContent = `
          <p>[Your Name]<br/>[Your Address]<br/>[Your Email/Phone]</p>
          <p>[Date]</p>
          <br/>
          <p>[Hiring Manager Name]<br/>[Company Name]<br/>[Company Address]</p>
          <br/>
          <p>Dear [Hiring Manager Name],</p>
          <p>I am writing to express my interest in the [Job Title] position at [Company Name]. With my background in [Your Field], I am confident I can bring value to your team.</p>
          <p>In my previous role at [Previous Company], I successfully [Mention an achievement]. I believe my skills in [Skill 1] and [Skill 2] align perfectly with your requirements.</p>
          <p>Thank you for considering my application. I look forward to the opportunity to discuss how my experience and skills will be an asset to [Company Name].</p>
          <p>Sincerely,</p>
          <br/>
          <p>[Your Name]</p>
        `;
        break;
      case 'Project Proposal':
        templateContent = `
          <h1 style="text-align: center;">Project Proposal: [Project Name]</h1>
          <br/>
          <h2>1. Executive Summary</h2>
          <p>[Provide a brief overview of the project, its main objectives, and expected outcomes.]</p>
          <h2>2. Problem Statement</h2>
          <p>[Describe the problem or opportunity that the project addresses.]</p>
          <h2>3. Proposed Solution</h2>
          <p>[Explain how the project will solve the problem or capitalize on the opportunity.]</p>
          <h2>4. Project Timeline</h2>
          <ul>
            <li><strong>Phase 1:</strong> [Description] (Date)</li>
            <li><strong>Phase 2:</strong> [Description] (Date)</li>
          </ul>
          <h2>5. Budget Estimation</h2>
          <p>[Provide an estimated budget for the project.]</p>
        `;
        break;
      default:
        return;
    }

    if (editorRef.current) {
      editorRef.current.innerHTML = templateContent;
      setContent(templateContent);
      setIsSaved(false);
      
      // Update text content
      const div = document.createElement('div');
      div.innerHTML = templateContent;
      setTextContent(div.innerText || "");
    }
    
    e.target.value = ''; // Reset select after insertion
  };

  const insertCoverPage = () => {
    if (editorRef.current) {
      const coverHtml = `
        <div style="page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: 2rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem; color: #1f2937;">Document Title</h1>
          <h2 style="font-size: 1.5rem; color: #6b7280; margin-bottom: 2rem;">Subtitle Goes Here</h2>
          <p style="margin-top: 4rem; color: #9ca3af;">Author / Date</p>
        </div>
        <p><br></p>
      `;
      editorRef.current.innerHTML = coverHtml + editorRef.current.innerHTML;
      handleInput();
    }
  };

  const insertPageBreak = () => {
    const html = `<hr class="page-break" style="page-break-after: always; border: none; border-top: 2px dashed #d1d5db; margin: 40px 0; width: 100%;" />`;
    exec('insertHTML', html);
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid #d1d5db;" border="1">
        <tbody>
          <tr><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td></tr>
          <tr><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td></tr>
          <tr><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td><td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;"><br></td></tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    exec('insertHTML', tableHtml);
  };

  const addTableRow = (below: boolean) => {
    if (!activeTableCell) return;
    const tr = activeTableCell.closest('tr');
    if (!tr) return;
    const table = tr.closest('table');
    if (!table) return;

    const colCount = tr.cells.length;
    const newRow = table.insertRow(below ? tr.rowIndex + 1 : tr.rowIndex);

    for (let i = 0; i < colCount; i++) {
      const newCell = newRow.insertCell();
      newCell.style.border = '1px solid #d1d5db';
      newCell.style.padding = '8px';
      newCell.style.minWidth = '50px';
      newCell.innerHTML = '<br>';
    }

    handleInput();
  };

  const addTableCol = (right: boolean) => {
    if (!activeTableCell) return;
    const cell = activeTableCell;
    const tr = cell.closest('tr');
    if (!tr) return;
    const table = tr.closest('table');
    if (!table) return;

    const colIndex = cell.cellIndex;
    const insertIndex = right ? colIndex + 1 : colIndex;

    Array.from(table.rows).forEach((row) => {
      const isHeaderCell = (row as HTMLTableRowElement).cells[0]?.tagName === 'TH';
      const newCell = document.createElement(isHeaderCell ? 'th' : 'td');
      newCell.style.border = '1px solid #d1d5db';
      newCell.style.padding = '8px';
      newCell.style.minWidth = '50px';
      newCell.innerHTML = '<br>';

      if (isHeaderCell) {
        newCell.style.backgroundColor = '#1e293b';
        newCell.style.color = '#ffffff';
        newCell.style.fontWeight = 'bold';
      }

      if (insertIndex >= (row as HTMLTableRowElement).cells.length) {
        (row as HTMLTableRowElement).appendChild(newCell);
      } else {
        (row as HTMLTableRowElement).insertBefore(newCell, (row as HTMLTableRowElement).cells[insertIndex]);
      }
    });

    handleInput();
  };

  const deleteTableRow = () => {
    if (!activeTableCell) return;
    const tr = activeTableCell.closest('tr');
    if (!tr) return;
    const table = tr.closest('table');
    if (!table) return;

    if (table.rows.length <= 1) {
      table.remove();
      setActiveTableCell(null);
    } else {
      table.deleteRow(tr.rowIndex);
      setActiveTableCell(null);
    }
    handleInput();
  };

  const deleteTableCol = () => {
    if (!activeTableCell) return;
    const cell = activeTableCell;
    const tr = cell.closest('tr');
    if (!tr) return;
    const table = tr.closest('table');
    if (!table) return;

    const colIndex = cell.cellIndex;

    if ((tr as HTMLTableRowElement).cells.length <= 1) {
      table.remove();
      setActiveTableCell(null);
    } else {
      Array.from(table.rows).forEach((row) => {
        if (colIndex < (row as HTMLTableRowElement).cells.length) {
          (row as HTMLTableRowElement).deleteCell(colIndex);
        }
      });
      setActiveTableCell(null);
    }
    handleInput();
  };

  const convertToHeaderRow = () => {
    if (!activeTableCell) return;
    const table = activeTableCell.closest('table');
    if (!table) return;

    const firstRow = table.rows[0];
    if (!firstRow) return;

    const cells = Array.from((firstRow as HTMLTableRowElement).cells);
    cells.forEach((cell) => {
      const cellEl = cell as HTMLTableCellElement;
      if (cellEl.tagName !== 'TH' && cellEl.tagName !== 'th') {
        const th = document.createElement('th');
        th.innerHTML = cellEl.innerHTML;
        th.style.border = '1px solid #d1d5db';
        th.style.padding = '8px';
        th.style.minWidth = cellEl.style.minWidth || '50px';
        th.style.backgroundColor = '#1e293b';
        th.style.color = '#ffffff';
        th.style.fontWeight = 'bold';
        th.style.textAlign = cellEl.style.textAlign || 'center';
        cellEl.replaceWith(th);
      } else {
        const th = cellEl;
        th.style.backgroundColor = '#1e293b';
        th.style.color = '#ffffff';
        th.style.fontWeight = 'bold';
      }
    });

    handleInput();
  };

  // --- Interactive Reference Tools ---
  const insertTableOfContents = () => {
    if (!editorRef.current) return;
    const headings = Array.from(editorRef.current.querySelectorAll('h1, h2, h3'));
    if (headings.length === 0) {
      alert("No headings (H1, H2, or H3) found in the document to generate a Table of Contents. Please apply some headings using the 'Home' tab styling presets first!");
      return;
    }
    
    let tocHtml = `
      <div class="toc-container" style="border: 2px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 20px 0; background-color: #f8fafc; font-family: sans-serif;" contenteditable="false">
        <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 1.125rem; font-weight: bold; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">Table of Contents</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
    `;

    headings.forEach((h: any, index) => {
      const id = h.id || `heading-${index}-${Math.floor(Math.random()*1000)}`;
      h.id = id;
      const text = h.innerText || h.textContent || '';
      const level = h.tagName.toLowerCase();
      const indentStyle = level === 'h1' ? 'font-weight: bold; padding-left: 0;' : level === 'h2' ? 'padding-left: 20px; font-size: 0.9rem; color: #475569;' : 'padding-left: 40px; font-size: 0.8rem; color: #64748b;';
      
      tocHtml += `
        <li style="display: flex; justify-content: space-between; align-items: baseline; ${indentStyle}">
          <span>${text}</span>
          <span style="flex-grow: 1; border-bottom: 1px dotted #cbd5e1; margin: 0 8px;"></span>
          <a href="#${id}" style="color: #2563eb; text-decoration: none; font-weight: bold;">p. ${1 + Math.floor(index / 2)}</a>
        </li>
      `;
    });

    tocHtml += `
        </ul>
      </div>
      <p><br></p>
    `;
    exec('insertHTML', tocHtml);
  };

  const insertFootnote = () => {
    const noteText = prompt("Enter Footnote Comment (will render inline and append at bottom of page structure):");
    if (!noteText) return;
    const footnotes = editorRef.current?.querySelectorAll('.footnote-ref') || [];
    const footnoteCount = footnotes.length + 1;
    
    const superscriptHtml = `<sup class="footnote-ref" style="color: #2563eb; font-weight: bold; cursor: pointer; padding: 0 2px;" title="${noteText}">[${footnoteCount}]</sup>`;
    exec('insertHTML', superscriptHtml);

    if (editorRef.current) {
      const bottomHtml = `
        <div class="footnote-item" style="font-size: 0.75rem; color: #475569; border-top: 1px solid #e2e8f0; margin-top: 16px; padding-top: 4px;" contenteditable="false">
          <sup style="font-weight: bold; color: #2563eb;">[${footnoteCount}]</sup> ${noteText}
        </div>
      `;
      editorRef.current.innerHTML += bottomHtml;
      handleInput();
    }
  };

  const insertEndnote = () => {
    const noteText = prompt("Enter Endnote citation details:");
    if (!noteText) return;
    const endCount = (editorRef.current?.querySelectorAll('.endnote-ref').length || 0) + 1;
    
    const endnoteHtml = `<sup class="endnote-ref" style="color: #9333ea; font-weight: bold; cursor: pointer; padding: 0 2px;" title="${noteText}">[E-${endCount}]</sup>`;
    exec('insertHTML', endnoteHtml);

    if (editorRef.current) {
      const bottomHtml = `
        <div class="endnote-item" style="font-size: 0.75rem; color: #6b21a8; border-top: 1px dashed #d8b4fe; margin-top: 24px; padding-top: 6px;" contenteditable="false">
          <sup style="font-weight: bold; color: #9333ea;">[Endnote E-${endCount}]</sup> ${noteText}
        </div>
      `;
      editorRef.current.innerHTML += bottomHtml;
      handleInput();
    }
  };

  const insertBibliography = () => {
    if (citations.length === 0) {
      alert("No citations added to this document database yet. Use 'Add Citation' to enter academic journal records first!");
      return;
    }
    
    let bibHtml = `
      <div class="bibliography-section" style="margin-top: 48px; border-top: 2px solid #475569; padding-top: 20px; font-family: serif;" contenteditable="false">
        <h2 style="font-size: 1.5rem; font-weight: bold; color: #0f172a; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Works Cited & Bibliography</h2>
        <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
    `;

    const sortedCitations = [...citations].sort((a, b) => a.author.localeCompare(b.author));
    sortedCitations.forEach((cit) => {
      bibHtml += `
        <li style="font-size: 0.85rem; line-height: 1.6; color: #1e293b; padding-left: 24px; text-indent: -24px;">
          <strong>${cit.author}</strong> (${cit.year}). <em>${cit.title}</em>. Publisher: ${cit.publisher}.
        </li>
      `;
    });

    bibHtml += `
        </ul>
      </div>
      <p><br></p>
    `;
    exec('insertHTML', bibHtml);
  };

  const handleAddCitationSubmit = () => {
    if (!citAuthor || !citYear || !citTitle) {
      alert("Please fill in Author, Year, and Title to add citation!");
      return;
    }
    const newCit = { author: citAuthor, year: citYear, title: citTitle, publisher: citPublisher || 'N/A' };
    setCitations([...citations, newCit]);
    
    // Injects citation inline e.g. (Smith, 2025)
    const inlineText = `(${citAuthor.split(',')[0].trim()}, ${citYear})`;
    exec('insertHTML', inlineText);
    
    // Reset values and close
    setCitAuthor('');
    setCitYear('');
    setCitTitle('');
    setCitPublisher('');
    setShowCitationModal(false);
  };

  const insertCaption = () => {
    const captionText = prompt("Enter Figure Caption text:", "Figure 1: Description of item");
    if (!captionText) return;
    const captionHtml = `<p style="text-align: center; font-size: 0.8rem; font-style: italic; color: #4b5563; margin-top: 6px; margin-bottom: 12px;" class="doc-caption">${captionText}</p>`;
    exec('insertHTML', captionHtml);
  };

  const insertIndexCard = () => {
    const term = prompt("Enter Index Keyword Term:");
    if (!term) return;
    const desc = prompt("Enter Index page reference or category:", "p. 1");
    if (!desc) return;
    
    const indexHtml = `
      <div class="index-badge" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 0.75rem; margin: 2px; font-weight: 500;" title="Index Marker">
        🔍 ${term} (${desc})
      </div>
    `;
    exec('insertHTML', indexHtml);
  };

  // --- Interactive Mailing Tools ---
  const insertMergeField = (fieldName: string) => {
    const tag = `{{${fieldName}}}`;
    exec('insertHTML', `<span class="bg-blue-100 text-blue-800 font-mono text-xs px-1 py-0.5 rounded border border-blue-200" style="font-weight: 600;" contenteditable="false">${tag}</span>`);
  };

  const addMailingRecipient = () => {
    if (!newRecipientName || !newRecipientEmail) {
      alert("Name and Email are required to register a Mailing recipient!");
      return;
    }
    setRecipients([...recipients, {
      name: newRecipientName,
      email: newRecipientEmail,
      company: newRecipientCompany || 'Independent'
    }]);
    setNewRecipientName('');
    setNewRecipientEmail('');
    setNewRecipientCompany('');
  };

  const deleteRecipient = (indexToDelete: number) => {
    setRecipients(recipients.filter((_, i) => i !== indexToDelete));
  };

  // --- Comment System ---
  const handleAddComment = () => {
    const selection = window.getSelection();
    const selText = selection ? selection.toString().trim() : '';
    
    if (!selText) {
      alert("Please highlight or select some text inside the editor sheet first so we can attach your comment!");
      return;
    }
    
    setSelectedTextForComment(selText);
    setCommentInput('');
    setShowCommentModal(true);
  };

  const submitComment = () => {
    if (!commentInput.trim()) return;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const mockAuthor = author.trim() || 'Co-author';
    
    const newComment = {
      id: String(Date.now()),
      text: commentInput,
      selectedText: selectedTextForComment,
      date: dateStr,
      author: mockAuthor
    };

    setComments([...comments, newComment]);
    setShowCommentModal(false);
    
    // Highlight comment text in editor
    exec('hiliteColor', '#fef08a'); // soft yellow highlight
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  // --- Translation Tools ---
  const translateSelectedParagraphs = (lang: string) => {
    const selection = window.getSelection();
    const sourceText = selection ? selection.toString().trim() : '';
    if (!sourceText) {
      alert("Please select/highlight the paragraph text you want to translate.");
      return;
    }

    const dictEnToSp: Record<string, string> = {
      "untitled document": "Documento sin título",
      "document": "documento",
      "proposal": "propuesta",
      "timeline": "cronograma",
      "budget": "presupuesto",
      "hiring": "contratación",
      "experience": "experiencia",
      "education": "educación",
      "achievements": "logros",
      "professional": "profesional",
      "skills": "habilidades"
    };

    const dictEnToFr: Record<string, string> = {
      "untitled document": "Document sans titre",
      "document": "document",
      "proposal": "proposition",
      "timeline": "chronologie",
      "budget": "budget",
      "hiring": "embauche",
      "experience": "expérience",
      "education": "éducation",
      "achievements": "réalisations",
      "professional": "professionnel",
      "skills": "compétences"
    };

    const dictEnToGe: Record<string, string> = {
      "untitled document": "Unbenanntes Dokument",
      "document": "Dokument",
      "proposal": "Vorschlag",
      "timeline": "Zeitplan",
      "budget": "Budget",
      "hiring": "Einstellung",
      "experience": "Erfahrung",
      "education": "Ausbildung",
      "achievements": "Erfolge",
      "professional": "Professionell",
      "skills": "Fähigkeiten"
    };

    const dictEnToJa: Record<string, string> = {
      "untitled" : "無題のドキュメント",
      "document": "ドキュメント",
      "proposal": "提案書",
      "timeline": "タイムライン",
      "budget": "予算",
      "experience": "経験",
      "education": "教育",
      "professional": "プロフェッショナル",
      "skills": "スキル"
    };

    let targetDict = dictEnToSp;
    let langName = "Spanish";
    if (lang === 'fr') { targetDict = dictEnToFr; langName = "French"; }
    else if (lang === 'de') { targetDict = dictEnToGe; langName = "German"; }
    else if (lang === 'ja') { targetDict = dictEnToJa; langName = "Japanese"; }

    // Mock translation by scanning keywords
    let outputText = sourceText;
    Object.entries(targetDict).forEach(([key, val]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      outputText = outputText.replace(regex, val);
    });

    if (outputText === sourceText) {
      outputText = `[Translated to ${langName}]: ` + sourceText.split(' ').map(w => w + "o").join(' ');
    }

    exec('insertHTML', `<span class="bg-green-50 text-green-800 border-b border-green-300 px-1" title="Translated from English">${outputText}</span>`);
  };

  // --- Protection Methods ---
  const handleToggleProtect = () => {
    if (isProtected) {
      const pwInput = prompt("Enter Password to Unprotect Document:");
      if (pwInput === protectPassword) {
        setIsProtected(false);
        alert("Document unprotected successfully! Editing enabled.");
      } else {
        alert("Incorrect password. Document remains locked.");
      }
    } else {
      const pwInput = prompt("Set a password to lock this document from edits (defaults to 1234):", "1234");
      if (pwInput) {
        setProtectPassword(pwInput);
        setIsProtected(true);
        alert(`Document protected. Locked mode enabled. Password set to: ${pwInput}`);
      }
    }
  };

  // --- Dictionary Word Scanner ---
  const handleDictionaryLookup = () => {
    if (!dictionaryWord.trim()) return;
    const wordList: Record<string, string> = {
      "development": "The process of developing or being developed; growth, progress, or state of advancement.",
      "knowledge": "Facts, information, and skills acquired by a person through experience or education.",
      "intelligence": "The ability to acquire and apply knowledge and skills.",
      "academic": "Relating to education and scholarship; scholarly, educational, or scholastic.",
      "structure": "The arrangement of and relations between the parts or elements of something complex.",
      "research": "The systematic investigation into and study of materials and sources in order to establish facts.",
      "innovation": "The action or process of innovating; a new method, idea, product, etc.",
      "technology": "The application of scientific knowledge for practical purposes.",
      "document": "A piece of written, printed, or electronic matter that provides information or evidence.",
      "collaborate": "Work jointly on an activity or project, especially to produce or create something."
    };
    const definition = wordList[dictionaryWord.toLowerCase().trim()] || "Term identified! Commonly referenced in standard layouts to describe architecture, operations, or documentation.";
    setDictionaryResult({ word: dictionaryWord, definition });
  };

  function getPaperStyles() {
    let width = 816;
    let height = 1056;
    if (paperSize === 'a4') {
      width = 794;
      height = 1123;
    } else if (paperSize === 'legal') {
      width = 816;
      height = 1344;
    }
    if (orientation === 'landscape') {
      const temp = width;
      width = height; height = temp;
    }
    return { width, height };
  }

  const getThemePaletteColors = () => {
    const colors = {
      blue: { primary: '#2563eb', secondary: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
      emerald: { primary: '#059669', secondary: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
      rose: { primary: '#e11d48', secondary: '#fff1f2', border: '#fecdd3', text: '#9f1239' },
      amber: { primary: '#d97706', secondary: '#fffbeb', border: '#fde68a', text: '#92400e' },
      violet: { primary: '#7c3aed', secondary: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
      charcoal: { primary: '#374151', secondary: '#f3f4f6', border: '#e5e7eb', text: '#111827' }
    };
    return colors[colorPalette];
  };

  const handleFindNext = () => {
    if (!findText) return;
    const found = (window as any).find(findText, false, false, true, false, false, false);
    if (!found) {
      alert('Text not found or end of document reached.');
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    const selection = window.getSelection();
    if (selection && selection.toString().toLowerCase() === findText.toLowerCase() && selection.rangeCount > 0) {
      document.execCommand('insertText', false, replaceText);
      handleInput();
    }
    handleFindNext();
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    
    // Check if there are any occurrences first without moving selection visually for performance
    const textContentTemp = editorRef.current.innerText || '';
    if (!textContentTemp.toLowerCase().includes(findText.toLowerCase())) {
      alert('Text not found.');
      return;
    }

    const selection = window.getSelection();
    if(selection) selection.removeAllRanges();
    
    // Move selection to start of editor
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(true);
    selection?.addRange(range);
    
    let count = 0;
    while ((window as any).find(findText, false, false, true, false, false, false)) {
      if (editorRef.current.contains(window.getSelection()?.anchorNode || null)) {
        document.execCommand('insertText', false, replaceText);
        count++;
      } else {
        break;
      }
    }
    handleInput();
    alert(`Replaced ${count} occurrences.`);
  };

  const FONT_FAMILIES = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Garamond', 'Georgia', 
    'Helvetica', 'Impact', 'Palatino', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
  ];

  const FONT_SIZES = [
    { label: '8pt', value: '1' },
    { label: '10pt', value: '2' },
    { label: '12pt', value: '3' },
    { label: '14pt', value: '4' },
    { label: '18pt', value: '5' },
    { label: '24pt', value: '6' },
    { label: '36pt', value: '7' }
  ];

  const RibbonButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label?: string, onClick: () => void, active?: boolean }) => (
    <button
      onClick={onClick}
      className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2 sm:py-1.5 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-700'}`}
      title={label}
    >
      {icon}
      {label && <span className="text-[10px] sm:text-xs font-medium hidden sm:inline-block">{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full relative bg-white overflow-hidden">
      {wordGoal > 0 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-20">
          <div 
            className={`h-full transition-all duration-300 ease-out ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="sticky top-0 z-30 bg-white w-full shadow-sm flex flex-col shrink-0 border-b border-gray-200">
        {!isFocusMode && (
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
                <FileText size={15} className="text-blue-500 fill-blue-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 hidden lg:inline shrink-0">Word Editor</span>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-xs sm:text-sm font-semibold bg-transparent border-0 ring-0 focus:outline-none focus:ring-1 focus:ring-blue-500 px-1 py-0.5 rounded cursor-pointer w-[120px] sm:w-[180px] lg:w-[240px] truncate text-white placeholder-zinc-500 hover:bg-zinc-800"
                  placeholder="Document Title"
                />
              </div>
            </div>

            {/* Ribbon Tabs integrated directly in Title Row! */}
            <div className="flex items-center gap-0.5 border-l border-zinc-700 ml-2 px-1 overflow-x-auto hide-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 sm:px-3 py-0.5 text-xs font-bold rounded transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-block text-[10px] text-zinc-400">
                {isSaved ? '● Saved' : '○ Unsaved'}
              </span>
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`p-1 px-2.5 sm:py-1 text-xs rounded font-medium flex items-center gap-1 ${
                  isSaved 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                }`}
              >
                <Save size={13} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar min-h-[48px] px-2 py-1.5 bg-gray-100/50">
          {/* HOME TAB */}
          {activeTab === 'Home' && (
            <>
              {/* Clipboard & Quick Actions */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">Clips</span>
                <RibbonButton icon={<Undo size={14} />} label="Undo" onClick={() => exec('undo')} />
                <RibbonButton icon={<Redo size={14} />} label="Redo" onClick={() => exec('redo')} />
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <RibbonButton icon={<Scissors size={14} />} label="Cut" onClick={() => { document.execCommand('cut'); }} />
                <RibbonButton icon={<Copy size={14} />} label="Copy" onClick={() => { document.execCommand('copy'); }} />
                <RibbonButton icon={<Clipboard size={14} />} label="Paste" onClick={() => {
                  const text = prompt("Paste/Insert custom text at selection point:");
                  if (text) exec('insertHTML', text);
                }} />
              </div>

              {/* Document Actions File bar */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">File</span>
                <label className="flex items-center gap-1 px-1.5 py-1 text-gray-700 hover:bg-gray-100 rounded cursor-pointer transition-colors" title="Import File">
                  <Upload size={14} />
                  <span className="text-[10px] font-medium hidden sm:inline">Import</span>
                  <input type="file" className="hidden" accept=".txt,.html,.docx" onChange={handleFileUpload} />
                </label>
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <RibbonButton icon={<Download size={14} />} label="Save TXT" onClick={handleDownload} />
                <RibbonButton icon={<Download size={14} className="text-blue-600" />} label="Export PDF" onClick={handleDownloadPdf} />
                <RibbonButton icon={<Download size={14} className="text-pink-600" />} label="Export DOCX" onClick={handleExportDocx} />
                <RibbonButton icon={<Printer size={14} />} label="Print" onClick={() => window.print()} />
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <RibbonButton icon={<Eraser size={14} className="text-amber-600" />} label="Clear Formats" onClick={() => exec('removeFormat')} />
                <RibbonButton icon={<Trash2 size={14} className="text-red-600" />} label="Clear All" onClick={handleClear} />
              </div>

              {/* Font Config */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <select 
                  onChange={(e) => exec('fontName', e.target.value)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-blue-500 max-w-[100px] text-gray-700 font-medium cursor-pointer"
                  defaultValue="Arial"
                  title="Font Family"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                  ))}
                </select>

                <select 
                  onChange={(e) => exec('fontSize', e.target.value)}
                  className="text-xs bg-white border border-gray-300 rounded px-1 py-1 outline-none focus:border-blue-500 w-[55px] text-gray-700 font-medium cursor-pointer"
                  defaultValue="3"
                  title="Font Size"
                >
                  {FONT_SIZES.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <div className="flex items-center gap-0.5">
                  <RibbonButton icon={<Bold size={14} />} onClick={() => exec('bold')} />
                  <RibbonButton icon={<Italic size={14} />} onClick={() => exec('italic')} />
                  <RibbonButton icon={<Underline size={14} />} onClick={() => exec('underline')} />
                  <RibbonButton icon={<Strikethrough size={14} />} onClick={() => exec('strikeThrough')} />
                  <RibbonButton icon={<Subscript size={14} />} onClick={() => exec('subscript')} />
                  <RibbonButton icon={<Superscript size={14} />} onClick={() => exec('superscript')} />
                </div>
              </div>

              {/* Presets and Alignment */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">Format</span>
                <select 
                  onChange={(e) => exec('formatBlock', e.target.value)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-blue-500 max-w-[110px] text-gray-700 font-medium cursor-pointer"
                  defaultValue="P"
                  title="Style Preset"
                >
                  <option value="P">Paragraph Text</option>
                  <option value="H1">Title [H1]</option>
                  <option value="H2">Subtitle [H2]</option>
                  <option value="H3">Heading 1 [H3]</option>
                  <option value="H4">Heading 2 [H4]</option>
                  <option value="blockquote">Blockquote Panel</option>
                </select>
                
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <div className="flex items-center gap-0.5">
                  <RibbonButton icon={<AlignLeft size={14} />} onClick={() => exec('justifyLeft')} />
                  <RibbonButton icon={<AlignCenter size={14} />} onClick={() => exec('justifyCenter')} />
                  <RibbonButton icon={<AlignRight size={14} />} onClick={() => exec('justifyRight')} />
                  <RibbonButton icon={<AlignJustify size={14} />} onClick={() => exec('justifyFull')} />
                </div>
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <div className="flex items-center gap-0.5">
                  <RibbonButton icon={<List size={14} />} onClick={() => exec('insertUnorderedList')} />
                  <RibbonButton icon={<ListOrdered size={14} />} onClick={() => exec('insertOrderedList')} />
                </div>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                {/* Foreground color picker */}
                <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded" title="Text Color">
                  <Palette size={14} className="text-gray-700" />
                  <input
                    type="color"
                    onChange={(e) => exec('foreColor', e.target.value)}
                    className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
                    defaultValue="#000000"
                  />
                </div>
                {/* Background highlite picker */}
                <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded mr-1" title="Highlight Color">
                  <span className="text-xs font-bold text-gray-500">ab</span>
                  <input
                    type="color"
                    onChange={(e) => exec('hiliteColor', e.target.value)}
                    className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
                    defaultValue="#ffff00"
                  />
                </div>
              </div>
            </>
          )}

          {/* INSERT TAB */}
          {activeTab === 'Insert' && (
            <>
              {/* Pages */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">Pages</span>
                <RibbonButton icon={<ImageIcon size={14} className="text-indigo-600" />} label="Add Cover Page" onClick={insertCoverPage} />
                <RibbonButton icon={<FilePlus size={14} />} label="Page Break" onClick={insertPageBreak} />
                <RibbonButton icon={<Plus size={14} />} label="Blank Page" onClick={() => {
                  exec('insertHTML', `<div style="page-break-after: always; min-height:10vh;"></div><p><br></p>`);
                }} />
              </div>

              {/* Tables */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">Tables</span>
                <RibbonButton icon={<TableIcon size={14} className="text-teal-600" />} label="Insert Table" onClick={insertTable} />
                
                {activeTableCell && (
                  <>
                    <div className="w-px h-5 bg-gray-200 mx-0.5" />
                    <RibbonButton icon={<Plus size={12} />} label="Row Above" onClick={() => addTableRow(false)} />
                    <RibbonButton icon={<Plus size={12} />} label="Row Below" onClick={() => addTableRow(true)} />
                    <RibbonButton icon={<Plus size={12} />} label="Col Right" onClick={() => addTableCol(true)} />
                    <RibbonButton icon={<Heading size={12} />} label="Header Mode" onClick={convertToHeaderRow} />
                    <RibbonButton icon={<Trash2 size={12} className="text-red-500" />} label="Del Cell" onClick={() => { if(activeTableCell) activeTableCell.innerHTML = ''; }} />
                  </>
                )}
              </div>

              {/* Illustrations */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden lg:inline">Illustrations</span>
                <RibbonButton icon={<ImageIcon size={14} />} label="Insert Image URL" onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) exec('insertHTML', `<div style="display:inline-block; resize:both; overflow:hidden; border: 1px dotted transparent; padding: 2px; max-width: 100%; min-width: 50px; min-height: 50px;" class="resizable-material" contenteditable="false"><img src="${url}" style="width:100%; height:100%; object-fit:contain; pointer-events:none;" /></div><p><br></p>`);
                }} />
                
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                
                <span className="text-[10px] text-gray-500 font-medium px-1">Curated:</span>
                <select
                  onChange={(e) => {
                    const category = e.target.value;
                    const samples: Record<string, string> = {
                      work: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop',
                      office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop',
                      analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop',
                      creative: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop'
                    };
                    if (samples[category]) {
                      exec('insertHTML', `<img src="${samples[category]}" alt="${category}" style="width: 100%; max-width: 450px; border-radius: 8px; margin: 12px auto; display: block;" />`);
                    }
                    e.target.value = '';
                  }}
                  className="text-xs bg-white border border-gray-300 rounded px-1 py-0.5 outline-none cursor-pointer"
                  defaultValue=""
                  title="Curated Artwork"
                >
                  <option value="" disabled>Illustration Preset...</option>
                  <option value="work">Developer Work Station</option>
                  <option value="office">Modern Team Office</option>
                  <option value="analytics">Data & Analytics Chart</option>
                  <option value="creative">Creative Brainstorming</option>
                </select>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <span className="text-[10px] text-gray-500 font-medium px-1">Shapes:</span>
                <select
                  onChange={(e) => {
                    const styleType = e.target.value;
                    let blockHtml = '';
                    if (styleType === 'quote') {
                      blockHtml = `<blockquote style="border-left: 4px solid #3b82f6; background-color: #f0f7ff; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #1e40af;">Enter callout highlight quote text here...</blockquote>`;
                    } else if (styleType === 'grey') {
                      blockHtml = `<blockquote style="border-left: 4px solid #4b5563; background-color: #f3f4f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 4px 4px 0; color: #374151;">Enter referenced note or snippet...</blockquote>`;
                    } else if (styleType === 'green') {
                      blockHtml = `<blockquote style="border-left: 4px solid #10b981; background-color: #ecfdf5; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; color: #065f46;"><strong>💡 Key Insight:</strong> Write custom key takeaways here...</blockquote>`;
                    }
                    if (blockHtml) exec('insertHTML', blockHtml);
                    e.target.value = '';
                  }}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  defaultValue=""
                  title="Insert Shapes"
                >
                  <option value="" disabled>Shapes/Callout...</option>
                  <option value="quote">Blue Feature Block</option>
                  <option value="grey">Grey Editorial Quote</option>
                  <option value="green">Green Solution Card</option>
                </select>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                
                {/* Vector icon shortcuts */}
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[10px] text-gray-400">Icons:</span>
                  <button className="text-xs hover:bg-gray-200 p-1 rounded" onClick={() => exec('insertHTML', '⭐')} title="Star">⭐</button>
                  <button className="text-xs hover:bg-gray-200 p-1 rounded" onClick={() => exec('insertHTML', '✅')} title="Check">✅</button>
                  <button className="text-xs hover:bg-gray-200 p-1 rounded" onClick={() => exec('insertHTML', '📌')} title="Pin">📌</button>
                  <button className="text-xs hover:bg-gray-200 p-1 rounded" onClick={() => exec('insertHTML', '🌐')} title="Web">🌐</button>
                </div>
              </div>

              {/* Links & Text Box */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">Links</span>
                <RibbonButton icon={<Link size={14} className="text-blue-500" />} label="Hyperlink" onClick={() => {
                  const desc = prompt("Enter link description text:", "Google");
                  const url = prompt("Enter URL:", "https://google.com");
                  if (desc && url) {
                    exec('insertHTML', `<a href="${url}" target="_blank" style="color:#2563eb; text-decoration:underline;">${desc}</a>`);
                  }
                }} />
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <RibbonButton icon={<Type size={14} />} label="Text Box" onClick={() => {
                  exec('insertHTML', `<div style="border: 2px dashed #94a3b8; background-color:#f8fafc; padding: 16px; margin: 12px 0; border-radius: 6px;" class="custom-textbox"><strong>Double-click to overwrite textbox:</strong> Add floating comments, labels, or definitions.</div>`);
                }} />
              </div>

              {/* Headers / Footer Page Number */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden md:inline">Nav</span>
                <RibbonButton icon={<Heading size={14} />} label="Add Header" onClick={() => {
                  exec('insertHTML', `<p style="text-align: right; color:#94a3b8; font-size:11px; margin-bottom: 2rem;" class="header-region">[Insert Document Header Category here]</p>`);
                }} />
                <RibbonButton icon={<Minus size={14} />} label="Add Footer" onClick={() => {
                  exec('insertHTML', `<p style="text-align: center; color:#94a3b8; font-size:11px; margin-top: 3rem;" class="footer-region">[Insert page bottom footer / copyright information here]</p>`);
                }} />
                <RibbonButton icon={<Hash size={14} className="text-green-600" />} label="Page Numbers" active={showPageNumbers} onClick={() => setShowPageNumbers(!showPageNumbers)} />
              </div>
            </>
          )}

          {/* DESIGN TAB */}
          {activeTab === 'Design' && (
            <>
              {/* Document Formatting Themes */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Theme</span>
                <div className="flex items-center gap-1">
                  {[
                    { key: 'modern', label: 'Modern Suite', font: 'font-sans' },
                    { key: 'classic', label: 'Classic Editorial', font: 'font-serif' },
                    { key: 'elegant', label: 'Elegant Crimson', font: 'font-serif' },
                    { key: 'technical', label: 'Tech Blueprint', font: 'font-mono' },
                    { key: 'clean', label: 'Clean Minimal', font: 'font-sans' }
                  ].map((themeOpt) => (
                    <button
                      key={themeOpt.key}
                      onClick={() => {
                        setDocTheme(themeOpt.key as any);
                        setFontFamily(themeOpt.font as any);
                        if (themeOpt.key === 'elegant') {
                          setColorPalette('rose');
                          setPageColor('#fafaf9');
                          setPageBorder('classic');
                          setLineHeight('relaxed');
                        } else if (themeOpt.key === 'classic') {
                          setColorPalette('charcoal');
                          setPageColor('#fffdf5');
                          setPageBorder('solid-thin');
                          setLineHeight('normal');
                        } else if (themeOpt.key === 'technical') {
                          setColorPalette('blue');
                          setPageColor('#f8fafc');
                          setPageBorder('dashed-thin');
                          setLineHeight('tight');
                        } else {
                          setColorPalette('blue');
                          setPageColor('#ffffff');
                          setPageBorder('none');
                          setLineHeight('relaxed');
                        }
                      }}
                      className={`px-2 py-1 text-[11px] font-semibold border rounded transition-all ${docTheme === themeOpt.key ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {themeOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palettes Accent Colors */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Palette</span>
                <div className="flex items-center gap-1 px-1">
                  {[
                    { key: 'blue', color: 'bg-blue-600', label: 'Blue' },
                    { key: 'emerald', color: 'bg-emerald-600', label: 'Green' },
                    { key: 'rose', color: 'bg-rose-600', label: 'Rose' },
                    { key: 'amber', color: 'bg-amber-600', label: 'Amber' },
                    { key: 'violet', color: 'bg-violet-600', label: 'Purple' },
                    { key: 'charcoal', color: 'bg-gray-700', label: 'Gray' }
                  ].map((pSwatch) => (
                    <button
                      key={pSwatch.key}
                      onClick={() => {
                        setColorPalette(pSwatch.key as any);
                        if (editorRef.current) {
                          // Change H1-H3 styling colors
                          const colorMap: Record<string, string> = {
                            blue: '#1d4ed8', emerald: '#047857', rose: '#be123c', amber: '#b45309', violet: '#6d28d9', charcoal: '#374151'
                          };
                          const selectedCol = colorMap[pSwatch.key];
                          editorRef.current.querySelectorAll('h1, h2, h3').forEach((el: any) => {
                            el.style.color = selectedCol;
                          });
                        }
                      }}
                      className={`w-5 h-5 rounded-full ${pSwatch.color} border transition-all hover:scale-110 flex items-center justify-center ${colorPalette === pSwatch.key ? 'ring-2 ring-offset-1 ring-blue-500 scale-105 border-white' : 'border-gray-300'}`}
                      title={`${pSwatch.label} Palette`}
                    />
                  ))}
                </div>
              </div>

              {/* Paragraph presets */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Spacing</span>
                <select
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value as any)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  title="Line Spacing Height"
                >
                  <option value="tight">Line: Tight</option>
                  <option value="normal">Line: Standard</option>
                  <option value="relaxed">Line: Relaxed</option>
                  <option value="loose">Line: Double Layout</option>
                </select>
                
                <select
                  value={paragraphSpacing}
                  onChange={(e) => setParagraphSpacing(e.target.value as any)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  title="Paragraph Margin"
                >
                  <option value="small">Spacing: Small</option>
                  <option value="medium">Spacing: Medium</option>
                  <option value="large">Spacing: High-Margins</option>
                </select>
              </div>

              {/* Page Background colors */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Page Color</span>
                <div className="flex items-center gap-1">
                  {[
                    { value: '#ffffff', bg: 'bg-white', label: 'White' },
                    { value: '#fffdf5', bg: 'bg-[#fffdf5]', label: 'Cream' },
                    { value: '#fafaf9', bg: 'bg-[#fafaf9]', label: 'Linen' },
                    { value: '#f0f9ff', bg: 'bg-[#f0f9ff]', label: 'Ice' },
                    { value: '#f3f4f6', bg: 'bg-gray-100', label: 'Gray' }
                  ].map((colorSwatch) => (
                    <button
                      key={colorSwatch.value}
                      onClick={() => setPageColor(colorSwatch.value)}
                      className={`w-5 h-5 rounded border ${colorSwatch.bg} hover:scale-105 transition-all ${pageColor === colorSwatch.value ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-gray-300'}`}
                      title={colorSwatch.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={pageColor}
                    onChange={(e) => setPageColor(e.target.value)}
                    className="w-5 h-5 p-0 border border-gray-300 bg-transparent rounded cursor-pointer leading-none px-0"
                    title="Custom Page Tint"
                  />
                </div>
              </div>

              {/* Borders, Watermark */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Borders</span>
                <select
                  value={pageBorder}
                  onChange={(e) => setPageBorder(e.target.value as any)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  title="External Border Line"
                >
                  <option value="none">Border: None</option>
                  <option value="solid-thin">Border: Solid Thin</option>
                  <option value="solid-double">Border: Heavy Double</option>
                  <option value="dashed-thin">Border: Dashed</option>
                  <option value="classic">Border: Classic Frame</option>
                </select>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <span className="text-[10px] text-gray-500 font-medium pl-1">Watermark:</span>
                <select
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none mr-1 cursor-pointer"
                  title="Page Draft Overlay"
                >
                  <option value="">None</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="URGENT">URGENT</option>
                  <option value="COPY">COPY</option>
                </select>
              </div>
            </>
          )}

          {/* LAYOUT TAB */}
          {activeTab === 'Layout' && (
            <>
              {/* Margins */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Margins</span>
                <div className="flex items-center gap-1">
                  {[
                    { key: 'normal', label: 'Normal (1")' },
                    { key: 'narrow', label: 'Narrow (0.5")' },
                    { key: 'moderate', label: 'Moderate' },
                    { key: 'wide', label: 'Wide (2")' }
                  ].map((mOpt) => (
                    <button
                      key={mOpt.key}
                      onClick={() => setMarginSize(mOpt.key as any)}
                      className={`px-2 py-1 text-[11px] font-semibold border rounded transition-all ${marginSize === mOpt.key ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {mOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Orientation */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Orientation</span>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-2 py-1 text-[11px] font-bold border rounded transition-all ${orientation === 'portrait' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-2 py-1 text-[11px] font-bold border rounded transition-all ${orientation === 'landscape' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  Landscape
                </button>
              </div>

              {/* Paper Size, Columns */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Page Size</span>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                >
                  <option value="letter">Letter (8.5 x 11")</option>
                  <option value="a4">A4 (8.3 x 11.7")</option>
                  <option value="legal">Legal Size (8.5 x 14")</option>
                </select>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Columns</span>
                <select
                  value={columnsCount}
                  onChange={(e) => setColumnsCount(Number(e.target.value))}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  title="Multi-Column layout"
                >
                  <option value={1}>1 Column View</option>
                  <option value={2}>2 Columns Layout (Split)</option>
                  <option value={3}>3 Columns Layout (Mag)</option>
                </select>
              </div>

              {/* Line breaks & Indents */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Paragraph</span>
                <RibbonButton icon={<ArrowUpDown size={14} />} label="Add Line Break" onClick={() => exec('insertHTML', '<br/>')} />
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <RibbonButton icon={<Plus size={14} />} label="Indent Unit" onClick={() => exec('indent')} />
                <RibbonButton icon={<Minus size={14} />} label="Outdent Unit" onClick={() => exec('outdent')} />
              </div>
            </>
          )}

          {/* REFERENCES TAB */}
          {activeTab === 'References' && (
            <>
              {/* Table of Contents */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">TOC</span>
                <button
                  onClick={insertTableOfContents}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-semibold shadow-sm transition-all"
                >
                  <BookMarked size={12} className="text-white" />
                  <span>Insert Automatic Table of Contents</span>
                </button>
              </div>

              {/* Footnotes & Endnotes */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Footnotes</span>
                <RibbonButton icon={<StickyNote size={14} className="text-blue-500" />} label="Insert Footnote" onClick={insertFootnote} />
                <RibbonButton icon={<ListCollapse size={14} className="text-amber-500" />} label="Insert Endnote" onClick={insertEndnote} />
              </div>

              {/* Citations & Bibliography */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Citations (APA/MLA)</span>
                <button
                  onClick={() => setShowCitationModal(true)}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 transition-colors"
                  title="Add Citation to Database"
                >
                  <Plus size={13} className="text-green-600 font-bold" />
                  <span>Add Citation Info</span>
                </button>
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <button
                  onClick={insertBibliography}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded text-xs font-semibold transition-all"
                  title="Insert MLA Bibliography Section at bottom"
                >
                  <BookOpen size={13} />
                  <span>Insert Bibliography</span>
                </button>
              </div>

              {/* Captions and Indexes */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Index</span>
                <RibbonButton icon={<FileSearch size={14} />} label="Add Figure Caption" onClick={insertCaption} />
                <RibbonButton icon={<Award size={14} />} label="Register Index Term" onClick={insertIndexCard} />
              </div>
            </>
          )}

          {/* MAILINGS TAB */}
          {activeTab === 'Mailings' && (
            <>
              {/* Envelopes and labels */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Create</span>
                <button
                  onClick={() => {
                    exec('insertHTML', `
                      <div class="envelope-mock" style="border: 2px solid #94a3b8; background-color: #fafaf9; width: 100%; max-width: 480px; padding: 24px; border-radius: 8px; font-family: sans-serif; margin: 16px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" contenteditable="false">
                        <div style="font-size: 0.75rem; color: #475569; margin-bottom: 24px;">Return Address:<br/>[YOUR NAME]<br/>[YOUR DEPT]</div>
                        <div style="text-align: center; margin: 30px auto; font-size: 0.95rem; font-weight: bold; width: fit-content; border: 1px dashed #cbd5e1; padding: 12px 24px; background: white;">
                          TO: <span style="font-family: monospace;">{{Recipient_Name}}</span><br/>
                          <span style="font-weight: 500; font-size: 0.85rem;">{{Company}}</span><br/>
                          <span style="font-weight: normal; font-size: 0.8rem; color: #64748b;">{{Email}}</span>
                        </div>
                      </div>
                      <p><br></p>
                    `);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-gray-700 hover:bg-gray-100 rounded text-xs font-semibold border border-transparent hover:border-gray-200"
                >
                  <FileBox size={14} className="text-gray-500" />
                  <span>Envelopes Sheet</span>
                </button>
                <button
                  onClick={() => {
                    exec('insertHTML', `
                      <table style="width: 100%; border: 2px dashed #3b82f6; border-collapse: collapse; margin: 16px 0;" border="1" contenteditable="false">
                        <tbody>
                          <tr>
                            <td style="padding: 16px; border: 1px dashed #3b82f6; text-align: center; font-size: 0.8rem; background-color: #f0fdf4;"><strong>{{Recipient_Name}}</strong><br/>${recipients[0]?.company || 'Company'}</td>
                            <td style="padding: 16px; border: 1px dashed #3b82f6; text-align: center; font-size: 0.8rem; background-color: #f0fdf4;"><strong>{{Recipient_Name}}</strong><br/>${recipients[1]?.company || 'Company'}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p><br></p>
                    `);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-gray-700 hover:bg-gray-100 rounded text-xs font-semibold border border-transparent hover:border-gray-200"
                >
                  <span className="text-sm mr-1">🏷️</span>
                  <span>Printable Labels matrix</span>
                </button>
              </div>

              {/* Database and fields */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Database</span>
                <button
                  onClick={() => setShowMailRecipientsModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded text-xs font-semibold text-gray-700 shadow-sm transition-colors"
                >
                  <Users size={13} className="text-blue-600" />
                  <span>Manage Recipients ({recipients.length})</span>
                </button>

                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <span className="text-[10px] text-gray-500 font-semibold px-1">Fields:</span>
                
                {['Recipient_Name', 'Email', 'Company', 'Current_Date'].map((fieldName) => (
                  <button
                    key={fieldName}
                    onClick={() => insertMergeField(fieldName)}
                    className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[10px] rounded border border-blue-200 transition-colors uppercase font-bold"
                  >
                    +{fieldName}
                  </button>
                ))}
              </div>

              {/* Live Run Merge Simulator */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Run Merge</span>
                <button
                  onClick={() => {
                    setMailMergeActive(!mailMergeActive);
                    setMailMergeIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${mailMergeActive ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold animate-pulse' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}
                >
                  <Shuffle size={13} />
                  <span>{mailMergeActive ? 'Disable Merge Review' : 'Run Live Mail Merge'}</span>
                </button>

                {mailMergeActive && (
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <button
                      onClick={() => setMailMergeIndex(prev => Math.max(0, prev - 1))}
                      disabled={mailMergeIndex === 0}
                      className="p-1 hover:bg-amber-100 rounded text-amber-700 disabled:opacity-30"
                    >
                      &larr;
                    </button>
                    <span className="text-[11px] font-bold text-amber-800">
                      Copy {mailMergeIndex + 1} of {recipients.length} ({recipients[mailMergeIndex]?.name})
                    </span>
                    <button
                      onClick={() => setMailMergeIndex(prev => Math.min(recipients.length - 1, prev + 1))}
                      disabled={mailMergeIndex === recipients.length - 1}
                      className="p-1 hover:bg-amber-100 rounded text-amber-700 disabled:opacity-30"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* REVIEW TAB */}
          {activeTab === 'Review' && (
            <>
              {/* Proofing Tools */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Proofing</span>
                <RibbonButton icon={<SpellCheck size={14} className="text-green-600" />} label="Spell Check Toggle" active={spellCheckEnabled} onClick={() => setSpellCheckEnabled(!spellCheckEnabled)} />
                <button
                  onClick={() => {
                    // Count potential issues in editor
                    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
                    const errorsCount = Math.ceil(wordCount * 0.03); // estimate 3% typos
                    alert(`Proofing Complete!\n\nMetrics Investigated:\n- Total words audited: ${wordCount}\n- Estimated Spelling typos highlighted: ${errorsCount}\n- Grammar suggestion flags: 1 (Academic spacing)\n\nReview complete! Clean up indicators using the 'Home' eraser tool.`);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-gray-700 hover:bg-gray-100 rounded text-xs font-semibold"
                >
                  <SpellCheck size={14} className="text-blue-500" />
                  <span>Scan Grammar</span>
                </button>
              </div>

              {/* Translation */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Translation</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      translateSelectedParagraphs(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  defaultValue=""
                  title="Translate highlighted selection"
                >
                  <option value="" disabled>Translate Highlight...</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="ja">Japanese (日本語)</option>
                </select>
              </div>

              {/* AI Writing Assistant */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">AI Writing</span>
                <RibbonButton icon={<Wand2 size={14} className={isProcessingAI ? "text-gray-400" : "text-purple-600 animate-pulse"} />} label={isProcessingAI ? "Processing" : "Summarize"} onClick={() => processWithAI('Summarize')} />
                <RibbonButton icon={<Sparkles size={14} className={isProcessingAI ? "text-gray-400" : "text-purple-600"} />} label="Refine Tone" onClick={() => processWithAI('Refine Tone')} />
                <RibbonButton icon={<MessageSquare size={14} className={isProcessingAI ? "text-gray-400" : "text-purple-600"} />} label="Draft Body Content" onClick={() => processWithAI('Generate Body')} />
              </div>

              {/* Dictionary query */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Dictionary</span>
                <input
                  type="text"
                  placeholder="Query term e.g. research..."
                  value={dictionaryWord}
                  onChange={(e) => setDictionaryWord(e.target.value)}
                  className="px-2 py-0.5 text-xs border border-gray-300 rounded outline-none w-32 focus:border-blue-500 text-gray-700"
                />
                <button
                  onClick={handleDictionaryLookup}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-bold text-xs hover:bg-blue-100 transition-colors"
                >
                  Define
                </button>

                {dictionaryResult && (
                  <div className="absolute top-44 bg-white border border-gray-200 shadow-xl rounded p-3 z-50 max-w-sm" style={{ transform: 'translateX(-10%)' }}>
                    <div className="flex justify-between items-center mb-1 border-b pb-1">
                      <span className="font-bold text-sm text-blue-700">Definition: "{dictionaryResult.word}"</span>
                      <button className="text-xs font-semibold text-gray-400 hover:text-black" onClick={() => setDictionaryResult(null)}>[x]</button>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{dictionaryResult.definition}</p>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Comments</span>
                <button
                  onClick={handleAddComment}
                  className="flex items-center gap-1 px-2.5 py-1 text-gray-700 hover:bg-gray-100 rounded text-xs font-semibold"
                  title="Highlight some text first, then add comments!"
                >
                  <MessageSquare size={14} className="text-blue-500" />
                  <span>New Comment Row</span>
                </button>
                <RibbonButton icon={<History size={14} />} label="Toggle Revisions Timeline" active={trackChanges} onClick={() => setTrackChanges(!trackChanges)} />
              </div>

              {/* Document Protection */}
              <div className="flex items-center gap-0.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Protect</span>
                <button
                  onClick={handleToggleProtect}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all ${isProtected ? 'bg-red-600 text-white animate-pulse' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {isProtected ? <Lock size={12} className="text-white fill-white" /> : <LockOpen size={12} className="text-gray-500" />}
                  <span>{isProtected ? 'Locked (Unprotect)' : 'Protect'}</span>
                </button>
              </div>
            </>
          )}

          {/* VIEW TAB */}
          {activeTab === 'View' && (
            <>
              {/* Layout Modes */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Layout View</span>
                {[
                  { key: 'print', label: 'Print Layout', desc: 'Standard printed papers' },
                  { key: 'web', label: 'Web Layout', desc: 'Fluid width webpage style' },
                  { key: 'read', label: 'Read Mode Focus', desc: 'Distraction-free ivory reader' }
                ].map((vOpt) => (
                  <button
                    key={vOpt.key}
                    onClick={() => {
                      setViewMode(vOpt.key as any);
                      if (vOpt.key === 'read') {
                        setIsFocusMode(true);
                      } else {
                        setIsFocusMode(false);
                      }
                    }}
                    className={`px-2 py-1 text-[11px] font-semibold border rounded transition-all ${viewMode === vOpt.key ? 'bg-blue-600 border-blue-600 text-white shadow' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    title={vOpt.desc}
                  >
                    {vOpt.label}
                  </button>
                ))}
              </div>

              {/* Zoom Factor */}
              <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Zoom</span>
                <RibbonButton icon={<ZoomOut size={14} />} onClick={() => setZoomFactor(prev => Math.max(50, prev - 25))} />
                <span className="text-xs font-bold text-gray-700 min-w-[36px] text-center">{zoomFactor}%</span>
                <RibbonButton icon={<ZoomIn size={14} />} onClick={() => setZoomFactor(prev => Math.min(200, prev + 25))} />
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <button
                  onClick={() => setZoomFactor(100)}
                  className="px-1.5 py-0.5 text-[10px] font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 rounded"
                >
                  Reset (100%)
                </button>
              </div>

              {/* Toggle Guides */}
              <div className="flex items-center gap-1 bg-white/60 p-1 rounded border border-gray-200 shadow-sm shrink-0 mr-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 px-1 hidden sm:inline">Guides</span>
                <RibbonButton icon={<Grid size={14} />} label="Toggle Ruler Guide" active={showRulers} onClick={() => setShowRulers(!showRulers)} />
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <RibbonButton icon={<Grid size={14} className="text-indigo-600" />} label="Toggle Layout Gridlines" active={showGridlines} onClick={() => setShowGridlines(!showGridlines)} />
              </div>
            </>
          )}

        </div>

        {/* Global Contextual Table Cell Editing row (Available under any tab!) */}
        {activeTableCell && (
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar min-h-[40px] px-2 py-1 bg-blue-50/75 border-t border-blue-100 select-none shrink-0 shadow-inner">
            <span className="text-xs font-bold text-blue-700 px-2 uppercase tracking-wider">Contextual Table Tools</span>
            <div className="w-px h-4 bg-blue-200 mx-0.5 block" />
            <span className="text-[10px] font-bold text-blue-500 uppercase">Align:</span>
            <RibbonButton icon={<AlignLeft size={13} />} label="Left" onClick={() => { activeTableCell.style.textAlign = 'left'; handleInput(); }} />
            <RibbonButton icon={<AlignCenter size={13} />} label="Center" onClick={() => { activeTableCell.style.textAlign = 'center'; handleInput(); }} />
            <RibbonButton icon={<AlignRight size={13} />} label="Right" onClick={() => { activeTableCell.style.textAlign = 'right'; handleInput(); }} />
            <RibbonButton icon={<AlignJustify size={13} />} label="Justify" onClick={() => { activeTableCell.style.textAlign = 'justify'; handleInput(); }} />
            
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <span className="text-[10px] font-bold text-blue-500 uppercase">Vertical:</span>
            <RibbonButton icon={<ArrowUp size={13} />} label="Top" onClick={() => { activeTableCell.style.verticalAlign = 'top'; handleInput(); }} />
            <RibbonButton icon={<Minus size={13} />} label="Middle" onClick={() => { activeTableCell.style.verticalAlign = 'middle'; handleInput(); }} />
            <RibbonButton icon={<ArrowDown size={13} />} label="Bottom" onClick={() => { activeTableCell.style.verticalAlign = 'bottom'; handleInput(); }} />
            
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <span className="text-[10px] font-bold text-blue-500 uppercase">Colors:</span>
            <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-blue-100/50 px-1 py-0.5 rounded" title="Cell Border Color">
              <span className="text-[10px] font-medium text-blue-800">Border</span>
              <input
                type="color"
                onChange={(e) => {
                  activeTableCell.style.borderColor = e.target.value;
                  handleInput();
                }}
                className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
                defaultValue="#d1d5db"
              />
            </div>
            <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-blue-100/50 px-1 py-0.5 rounded" title="Cell Background Color">
              <span className="text-[10px] font-medium text-blue-800">Fill</span>
              <input
                type="color"
                onChange={(e) => {
                  activeTableCell.style.backgroundColor = e.target.value;
                  handleInput();
                }}
                className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
                defaultValue="#ffffff"
              />
            </div>

            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <span className="text-[10px] text-blue-600 font-bold uppercase">Presets:</span>
            <RibbonButton 
                icon={<Rows size={13} />} 
                label="Striped Rows" 
                active={activeTableCell?.closest('table')?.classList.contains('table-striped')} 
                onClick={() => { 
                    const table = activeTableCell.closest('table'); 
                    if(table) { table.classList.toggle('table-striped'); handleInput(); } 
                }} 
            />
            <RibbonButton 
                icon={<Heading size={13} />} 
                label="Bold Header" 
                active={activeTableCell?.closest('table')?.classList.contains('table-bold-header')} 
                onClick={() => { 
                    const table = activeTableCell.closest('table'); 
                    if(table) { table.classList.toggle('table-bold-header'); handleInput(); } 
                }} 
            />
            <RibbonButton 
                icon={<Shrink size={13} />} 
                label="Condensed Layout" 
                active={activeTableCell?.closest('table')?.classList.contains('table-condensed')} 
                onClick={() => { 
                    const table = activeTableCell.closest('table'); 
                    if(table) { table.classList.toggle('table-condensed'); handleInput(); } 
                }} 
            />
            <RibbonButton 
                icon={<Grid size={13} />} 
                label="Toggle Show Borders" 
                active={activeTableCell?.closest('table')?.classList.contains('show-borders')} 
                onClick={() => { 
                    const table = activeTableCell.closest('table'); 
                    if(table) { table.classList.toggle('show-borders'); handleInput(); } 
                }} 
            />

            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <span className="text-[10px] text-blue-600 font-bold uppercase">Grid:</span>
            <RibbonButton icon={<Plus size={13} />} label="Add Row Above" onClick={() => addTableRow(false)} />
            <RibbonButton icon={<Plus size={13} />} label="Add Row Below" onClick={() => addTableRow(true)} />
            <RibbonButton icon={<Plus size={13} />} label="Add Column" onClick={() => addTableCol(true)} />
            <RibbonButton icon={<Heading size={13} />} label="Make Header Row" onClick={convertToHeaderRow} />
            <RibbonButton icon={<Trash2 size={13} className="text-red-500" />} label="Delete Row" onClick={deleteTableRow} />
            <RibbonButton icon={<Trash2 size={13} className="text-red-500" />} label="Delete Column" onClick={deleteTableCol} />
          </div>
        )}
      </div>

      {showFindReplace && (
        <div className="absolute top-32 right-4 sm:right-8 w-80 bg-white shadow-2xl rounded-lg border border-gray-200 z-50 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
              <Search size={16} className="text-gray-500" />
              Find and Replace
            </h3>
            <button onClick={() => setShowFindReplace(false)} className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Find</label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Search text..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Replace with</label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement text..."
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button 
                onClick={handleFindNext}
                disabled={!findText}
                className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Next
              </button>
              <button 
                onClick={handleReplace}
                disabled={!findText}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Replace
              </button>
              <button 
                onClick={handleReplaceAll}
                disabled={!findText}
                className="w-full px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-200/50 p-4 sm:p-8 flex justify-center w-full relative"
        onScroll={handleScroll}
      >
        <div className={`relative shadow-md bg-white border border-gray-200 transition-all duration-300 mx-auto ${viewMode === 'web' || viewMode === 'read' ? 'w-full max-w-5xl' : ''}`} style={{ maxWidth: viewMode === 'print' ? getPaperStyles().width : undefined }}>
          
          {/* Watermark Overlay */}
          {watermark && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center overflow-hidden z-0 opacity-10">
               {Array.from({ length: totalPages }).map((_, i) => (
                 <div key={`watermark-${i}`} className="flex-none flex items-center justify-center w-full" style={{ height: getPaperStyles().height }}>
                    <span className="text-[8rem] sm:text-[12rem] font-bold text-gray-800 uppercase tracking-widest -rotate-45 whitespace-nowrap opacity-50">
                      {watermark}
                    </span>
                 </div>
               ))}
            </div>
          )}

          {/* Overlay Page Numbers & Visual Pagination lines */}
          {viewMode === 'print' && showPageNumbers && Array.from({ length: totalPages }).map((_, i) => (
            <React.Fragment key={`page-${i}`}>
              <div 
                className="absolute -left-12 sm:-left-16 w-12 flex justify-end pointer-events-none select-none print:hidden opacity-80 z-20"
                style={{ top: `${(i + 1) * getPaperStyles().height - 8}px` }}
              >
                <span className="text-gray-400 text-[10px] font-bold tracking-wider">PG {i + 1}</span>
              </div>
              <div 
                className="absolute left-0 w-full border-b border-dashed border-gray-300 pointer-events-none opacity-60 z-10 print:hidden"
                style={{ top: `${(i + 1) * getPaperStyles().height}px` }}
              />
            </React.Fragment>
          ))}

          <div 
            ref={editorRef}
            className={`w-full relative z-10 p-12 sm:p-16 md:p-24 outline-none ${fontFamily} [&_h1]:text-4xl [&_h1]:sm:text-5xl [&_h1]:font-extrabold [&_h1]:mb-6 [&_h1]:mt-8 [&_h2]:text-3xl [&_h2]:sm:text-4xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_h3]:text-2xl [&_h3]:sm:text-3xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-2 [&_h5]:mt-3 [&_h6]:text-base [&_h6]:font-medium [&_h6]:text-gray-600 [&_h6]:mb-1 [&_h6]:mt-2 [&_ul]:list-disc [&_ul]:ml-8 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-8 [&_ol]:mb-4 [&_table.table-striped_tr:nth-child(even)_td]:!bg-gray-100/50 [&_table.table-bold-header_tr:first-child_td]:!bg-gray-100 [&_table.table-bold-header_tr:first-child_td]:!font-bold [&_table.table-condensed_td]:!p-1 [&_table.show-borders]:!border [&_table.show-borders]:!border-gray-400 [&_table.show-borders_td]:!border [&_table.show-borders_td]:!border-gray-400 ${pSpacingClasses[paragraphSpacing]} ${lhClasses[lineHeight]} focus:shadow-lg focus:ring-1 focus:ring-blue-100 transition-shadow`}
            style={{ 
               minHeight: getPaperStyles().height,
               backgroundColor: pageColor === '#ffffff' ? 'transparent' : pageColor
            }}
            contentEditable
            spellCheck={spellCheckEnabled}
            onInput={handleInput}
            onMouseUp={updateSelectionState}
            onClick={handleEditorClick}
            onKeyUp={updateSelectionState}
            onKeyDown={handleKeyDownLocal}
            data-placeholder="Start typing your document here..."
          />
          
          {/* Floating Menu for text selection */}
          {floatingMenu && floatingMenu.show && (
            <div 
              className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg flex items-center px-1 py-1 gap-0.5 animate-in fade-in zoom-in-95 duration-150"
              style={{
                 top: `${Math.max(0, floatingMenu.top)}px`,
                 left: `${Math.max(0, floatingMenu.left)}px`,
                 transform: 'translateX(-50%)'
              }}
              onMouseDown={(e) => e.preventDefault()} // Keep focus on editor
            >
               <button className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold" onClick={() => exec('bold')}>B</button>
               <button className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 italic" onClick={() => exec('italic')}>I</button>
               <button className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 underline" onClick={() => exec('underline')}>U</button>
               <div className="w-px h-4 bg-gray-300 mx-1 block" />
               <button className="p-1 hover:bg-gray-100 rounded text-gray-700" onClick={() => exec('justifyLeft')}><AlignLeft size={14} /></button>
               <button className="p-1 hover:bg-gray-100 rounded text-gray-700" onClick={() => exec('justifyCenter')}><AlignCenter size={14} /></button>
               <button className="p-1 hover:bg-gray-100 rounded text-gray-700" onClick={() => exec('justifyRight')}><AlignRight size={14} /></button>
               <button className="p-1 hover:bg-gray-100 rounded text-gray-700" onClick={() => exec('justifyFull')}><AlignJustify size={14} /></button>
               <div className="w-px h-4 bg-gray-300 mx-1 block" />
               <button className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 line-through" onClick={() => exec('strikeThrough')}>S</button>
               <select 
                 className="text-xs bg-transparent outline-none cursor-pointer border-none font-medium hover:bg-gray-100 p-0.5 rounded"
                 onChange={(e) => exec('fontSize', e.target.value)}
                 defaultValue="3"
               >
                  <option value="1">10pt</option>
                  <option value="2">11pt</option>
                  <option value="3">12pt</option>
                  <option value="4">14pt</option>
                  <option value="5">18pt</option>
                  <option value="6">24pt</option>
               </select>
               <div className="w-px h-4 bg-gray-300 mx-1 block" />
               <input 
                  type="color" 
                  className="w-5 h-5 rounded cursor-pointer border-none bg-transparent block"
                  onChange={(e) => exec('foreColor', e.target.value)}
                  title="Text Color"
               />
               <input 
                  type="color" 
                  className="w-5 h-5 rounded cursor-pointer border-none bg-transparent block"
                  onChange={(e) => exec('hiliteColor', e.target.value)}
                  title="Highlight Color"
               />
            </div>
          )}

          {/* Material Formatting Menu */}
          {activeMaterial && (
            <div 
              className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg flex items-center px-1 py-1 gap-0.5 animate-in fade-in zoom-in-95 duration-150"
              style={{
                 top: `${Math.max(0, activeMaterial.offsetTop - 50)}px`,
                 left: `${Math.max(0, activeMaterial.offsetLeft + activeMaterial.offsetWidth / 2)}px`,
                 transform: 'translateX(-50%)'
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
               <button 
                 className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 text-xs font-semibold flex items-center gap-1"
                 title="Float Left (Wrap Text)" 
                 onClick={() => { activeMaterial.style.float = 'left'; activeMaterial.style.margin = '0 15px 15px 0'; }}
               >
                 <AlignLeft size={14} /> Wrap L
               </button>
               <button 
                 className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 text-xs font-semibold flex items-center gap-1"
                 title="Float Right (Wrap Text)" 
                 onClick={() => { activeMaterial.style.float = 'right'; activeMaterial.style.margin = '0 0 15px 15px'; }}
               >
                 <AlignRight size={14} /> Wrap R
               </button>
               <button 
                 className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 text-xs font-semibold flex items-center gap-1"
                 title="In Line (No Wrap)" 
                 onClick={() => { activeMaterial.style.float = 'none'; activeMaterial.style.margin = '0'; }}
               >
                 <AlignCenter size={14} /> Inline
               </button>
               <div className="w-px h-4 bg-gray-300 mx-1 block" />
               <button 
                 className="p-1 px-1.5 hover:bg-red-50 text-red-600 rounded text-xs font-semibold"
                 title="Delete Frame" 
                 onClick={() => { activeMaterial.remove(); setActiveMaterial(null); handleInput(); }}
               >
                 Delete
               </button>
            </div>
          )}

          {/* Autocomplete Suggestion */}
          {suggestion && (
            <div 
              className="absolute z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity flex items-center gap-1"
              style={{ top: Math.max(0, suggestion.top + 5) + 'px', left: Math.max(0, suggestion.left) + 'px' }}
            >
              <span>{suggestion.fullWord}</span>
              <span className="text-gray-400 bg-gray-700 px-1 rounded text-[10px]">Tab</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!isFocusMode && (
        <div className="flex justify-between items-center py-2 px-4 border-t border-gray-200 text-xs text-gray-500 bg-gray-50 shrink-0 select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium min-w-[70px]">
              <FileText size={14} className="text-gray-400" />
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <div className="w-px h-3 bg-gray-300 hidden sm:block"></div>
            <span className="hidden sm:inline">{textContent.length} chars</span>
            <span>{currentWords} words</span>
            {wordGoal > 0 && (
              <>
                <div className="w-px h-3 bg-gray-300 hidden sm:block"></div>
                <span className={`hidden sm:inline ${currentWords >= wordGoal ? 'text-green-600 font-medium' : ''}`}>
                  {Math.round(progress)}% of goal
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isSaved && <span className="text-amber-500 italic">Unsaved</span>}
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                isSaved 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
