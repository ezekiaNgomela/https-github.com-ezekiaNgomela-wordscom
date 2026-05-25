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
  ArrowUp, ArrowDown, Minus, Upload, Plus, Heading
} from 'lucide-react';

type Tab = 'Edit' | 'Tools' | 'AI' | 'Metrics' | 'Layout' | 'Other';
const TABS: Tab[] = ['Edit', 'Tools', 'AI', 'Metrics', 'Layout', 'Other'];

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
  const [activeTab, setActiveTab] = useState<Tab>('Edit');
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
  const [floatingMenu, setFloatingMenu] = useState<{ top: number; left: number; show: boolean } | null>(null);

  const updateSelectionState = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      // Find active table cell
      let node: Node | null = selection.anchorNode;
      let foundTd: HTMLTableCellElement | null = null;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'TD' || el.tagName === 'TH') {
            foundTd = el as HTMLTableCellElement;
            break;
          }
        }
        node = node.parentNode;
      }
      setActiveTableCell(foundTd);

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
  const totalPages = Math.max(1, Math.ceil(editorHeight / 1056));

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

  const mockAI = (action: string) => {
    alert(`AI ${action} is currently a placeholder. In a full implementation, this would process the text and update the editor.`);
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
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `${title.trim() || 'document'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
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
      const isHeaderCell = row.cells[0]?.tagName === 'TH';
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

      if (insertIndex >= row.cells.length) {
        row.appendChild(newCell);
      } else {
        row.insertBefore(newCell, row.cells[insertIndex]);
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

    if (tr.cells.length <= 1) {
      table.remove();
      setActiveTableCell(null);
    } else {
      Array.from(table.rows).forEach((row) => {
        if (colIndex < row.cells.length) {
          row.deleteCell(colIndex);
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

    const cells = Array.from(firstRow.cells);
    cells.forEach((cell) => {
      if (cell.tagName !== 'TH' && cell.tagName !== 'th') {
        const th = document.createElement('th');
        th.innerHTML = cell.innerHTML;
        th.style.border = '1px solid #d1d5db';
        th.style.padding = '8px';
        th.style.minWidth = cell.style.minWidth || '50px';
        th.style.backgroundColor = '#1e293b';
        th.style.color = '#ffffff';
        th.style.fontWeight = 'bold';
        th.style.textAlign = cell.style.textAlign || 'center';
        cell.replaceWith(th);
      } else {
        const th = cell as HTMLTableCellElement;
        th.style.backgroundColor = '#1e293b';
        th.style.color = '#ffffff';
        th.style.fontWeight = 'bold';
      }
    });

    handleInput();
  };

  const handleFindNext = () => {
    if (!findText) return;
    const found = window.find(findText, false, false, true, false, false, false);
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
    while (window.find(findText, false, false, true, false, false, false)) {
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

        {/* Ribbon Content */}
        <div className="bg-gray-50 flex flex-col">

        {/* Tab Content */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar min-h-[48px] px-2 py-1.5 bg-gray-100/50">
          {activeTab === 'Edit' && (
            <>
              <RibbonButton icon={<Undo size={16} />} label="Undo" onClick={() => exec('undo')} />
              <RibbonButton icon={<Redo size={16} />} label="Redo" onClick={() => exec('redo')} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              
              <select 
                onChange={(e) => exec('formatBlock', e.target.value)}
                className="text-xs sm:text-sm bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-blue-500 max-w-[110px] sm:max-w-none text-gray-700 font-medium shadow-sm hover:border-gray-400 cursor-pointer"
                defaultValue="P"
                title="Heading Level"
              >
                <option value="P">Paragraph Text</option>
                <option value="H1">Heading 1</option>
                <option value="H2">Heading 2</option>
                <option value="H3">Heading 3</option>
                <option value="H4">Heading 4</option>
                <option value="H5">Heading 5</option>
                <option value="H6">Heading 6</option>
              </select>
              
              <div className="w-px h-6 bg-gray-300 mx-1 block" />

              <select 
                onChange={(e) => exec('fontName', e.target.value)}
                className="text-xs sm:text-sm bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-blue-500 max-w-[120px] sm:max-w-[150px] text-gray-700 font-medium shadow-sm hover:border-gray-400 cursor-pointer"
                defaultValue="Arial"
                title="Font Family"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
              </select>

              <select 
                onChange={(e) => exec('fontSize', e.target.value)}
                className="text-xs sm:text-sm bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-blue-500 w-[60px] sm:w-[70px] text-gray-700 font-medium shadow-sm hover:border-gray-400 cursor-pointer ml-1"
                defaultValue="3"
                title="Font Size"
              >
                {FONT_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>

              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <div className="flex items-center bg-transparent gap-0.5">
                <RibbonButton icon={<Bold size={16} />} onClick={() => exec('bold')} />
                <RibbonButton icon={<Italic size={16} />} onClick={() => exec('italic')} />
                <RibbonButton icon={<Underline size={16} />} onClick={() => exec('underline')} />
                <RibbonButton icon={<Strikethrough size={16} />} onClick={() => exec('strikeThrough')} />
                <RibbonButton icon={<Subscript size={16} />} onClick={() => exec('subscript')} />
                <RibbonButton icon={<Superscript size={16} />} onClick={() => exec('superscript')} />
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <div className="flex items-center bg-transparent gap-0.5">
                <RibbonButton icon={<List size={16} />} onClick={() => exec('insertUnorderedList')} />
                <RibbonButton icon={<ListOrdered size={16} />} onClick={() => exec('insertOrderedList')} />
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <div className="flex items-center bg-transparent gap-0.5">
                <RibbonButton icon={<AlignLeft size={16} />} onClick={() => exec('justifyLeft')} />
                <RibbonButton icon={<AlignCenter size={16} />} onClick={() => exec('justifyCenter')} />
                <RibbonButton icon={<AlignRight size={16} />} onClick={() => exec('justifyRight')} />
                <RibbonButton icon={<AlignJustify size={16} />} onClick={() => exec('justifyFull')} />
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-gray-200 p-1.5 rounded transition-colors" title="Text Color">
                <Palette size={16} className="text-gray-700" />
                <input
                  type="color"
                  onChange={(e) => exec('foreColor', e.target.value)}
                  className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
                  defaultValue="#000000"
                />
              </div>
            </>
          )}

          {activeTab === 'Tools' && (
            <>
              <RibbonButton icon={<SpellCheck size={16} />} label="Spell Check" active={spellCheckEnabled} onClick={() => setSpellCheckEnabled(!spellCheckEnabled)} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton icon={<Eraser size={16} />} label="Clear Formats" onClick={() => exec('removeFormat')} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton 
                icon={<ImageIcon size={16} />} 
                label="Insert Image" 
                onClick={() => {
                  const url = window.prompt('Enter image URL:');
                  if (url) exec('insertImage', url);
                }} 
              />
              <RibbonButton 
                icon={<TableIcon size={16} />} 
                label="Insert Table" 
                onClick={insertTable} 
              />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              {activeTableCell && (
                 <>
                  <div className="flex items-center bg-gray-100 gap-1 p-1 rounded border border-gray-200 shadow-sm mx-1">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-600 px-1">Cell:</span>
                    <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors" title="Cell Border Color">
                      <span className="text-[10px] font-medium text-gray-700">Border</span>
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
                    <div className="flex items-center bg-transparent gap-1 cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors" title="Cell Background Color">
                       <span className="text-[10px] font-medium text-gray-700">Bg</span>
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
                  </div>
                  <div className="flex items-center bg-gray-100 gap-0.5 p-1 rounded border border-gray-200 shadow-sm mx-1">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-600 px-1">Table:</span>
                    <RibbonButton icon={<Plus size={14} />} label="Add Row Below" onClick={() => addTableRow(true)} />
                    <RibbonButton icon={<Plus size={14} />} label="Add Col Right" onClick={() => addTableCol(true)} />
                    <RibbonButton icon={<Heading size={14} />} label="Header" onClick={convertToHeaderRow} />
                  </div>
                  <div className="w-px h-6 bg-gray-300 mx-1 block" />
                 </>
              )}
              <RibbonButton 
                icon={<Search size={16} />} 
                label="Find & Replace" 
                active={showFindReplace}
                onClick={() => setShowFindReplace(!showFindReplace)} 
              />
            </>
          )}

          {activeTab === 'AI' && (
            <>
              <RibbonButton icon={<Wand2 size={16} className="text-purple-600" />} label="Summarize" onClick={() => mockAI('Summarize')} />
              <RibbonButton icon={<SpellCheck size={16} className="text-purple-600" />} label="Fix Grammar" onClick={() => mockAI('Fix Grammar')} />
              <RibbonButton icon={<Sparkles size={16} className="text-purple-600" />} label="Change Tone" onClick={() => mockAI('Change Tone')} />
              <RibbonButton icon={<MessageSquare size={16} className="text-purple-600" />} label="Generate Body" onClick={() => mockAI('Generate Body')} />
            </>
          )}

          {activeTab === 'Metrics' && (
            <div className="flex items-center gap-4 sm:gap-6 px-2 w-full max-w-full overflow-x-auto">
              <div className="flex flex-col min-w-[70px]">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Word Goal</span>
                <div className="flex items-center gap-1">
                  <Target size={12} className="text-gray-400" />
                  <input 
                    type="number"
                    className="w-12 sm:w-16 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none p-0 text-xs sm:text-sm font-medium"
                    value={wordGoal || ''}
                    onChange={handleWordGoalChange}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gray-300 shrink-0" />
              <div className="flex flex-col min-w-[60px]">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Words</span>
                <span className="text-xs sm:text-sm font-medium text-gray-800">{currentWords}</span>
              </div>
              <div className="flex flex-col min-w-[60px]">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Chars</span>
                <span className="text-xs sm:text-sm font-medium text-gray-800">{textContent.length}</span>
              </div>
              <div className="flex flex-col min-w-[60px]">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Read Time</span>
                <span className="text-xs sm:text-sm font-medium text-gray-800">{Math.ceil(currentWords / 200)}m</span>
              </div>
            </div>
          )}

          {activeTab === 'Layout' && (
            <>
              <select
                onChange={insertTemplate}
                defaultValue=""
                className="text-xs sm:text-sm bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 shadow-sm text-gray-700"
                title="Insert Template"
              >
                <option value="" disabled>Insert Template...</option>
                <option value="Resume">Resume</option>
                <option value="Cover Letter">Cover Letter</option>
                <option value="Project Proposal">Project Proposal</option>
              </select>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="text-xs sm:text-sm bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-blue-500 shadow-sm"
                title="Default Document Font"
              >
                <option value="font-sans">Sans Serif (Default)</option>
                <option value="font-serif">Serif (Formal)</option>
                <option value="font-mono">Monospace (Code)</option>
              </select>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton 
                icon={<ArrowUpDown size={16} />} 
                label={`Line: ${lineHeight.charAt(0).toUpperCase() + lineHeight.slice(1)}`}
                onClick={() => {
                  const options: ('tight' | 'normal' | 'relaxed' | 'loose')[] = ['tight', 'normal', 'relaxed', 'loose'];
                  const idx = options.indexOf(lineHeight);
                  setLineHeight(options[(idx + 1) % options.length]);
                }} 
              />
              <RibbonButton 
                icon={<GripHorizontal size={16} />} 
                label={`Spacing: ${paragraphSpacing.charAt(0).toUpperCase() + paragraphSpacing.slice(1)}`}
                onClick={() => {
                  const options: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
                  const idx = options.indexOf(paragraphSpacing);
                  setParagraphSpacing(options[(idx + 1) % options.length]);
                }} 
              />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton icon={<AlignLeft size={16} />} onClick={() => exec('justifyLeft')} />
              <RibbonButton icon={<AlignCenter size={16} />} onClick={() => exec('justifyCenter')} />
              <RibbonButton icon={<AlignRight size={16} />} onClick={() => exec('justifyRight')} />
              <RibbonButton icon={<AlignJustify size={16} />} onClick={() => exec('justifyFull')} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <button 
                onClick={insertCoverPage}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <ImageIcon size={14} className="text-gray-500" />
                Add Cover Page
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton icon={<FilePlus size={16} />} label="Page Break" onClick={insertPageBreak} />
              <RibbonButton icon={<Hash size={16} />} label="Toggle Overlay Page Numbers" active={showPageNumbers} onClick={() => setShowPageNumbers(!showPageNumbers)} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton 
                icon={isFocusMode ? <Minimize size={16} /> : <Maximize size={16} />} 
                label={isFocusMode ? "Exit Focus" : "Focus Mode"} 
                active={isFocusMode} 
                onClick={() => setIsFocusMode(!isFocusMode)} 
              />
            </>
          )}

          {activeTab === 'Other' && (
            <>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-100 cursor-pointer transition-all">
                 <Upload size={16} />
                 <span>Import File</span>
                 <input type="file" className="hidden" accept=".txt,.html,.docx" onChange={handleFileUpload} />
              </label>
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton icon={<Download size={16} />} label="Download TXT" onClick={handleDownload} />
              <RibbonButton icon={<Download size={16} />} label="Export PDF" onClick={handleDownloadPdf} />
              <RibbonButton icon={<Download size={16} />} label="Export DOCX" onClick={handleExportDocx} />
              <RibbonButton icon={<Printer size={16} />} label="Print" onClick={() => window.print()} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <RibbonButton icon={<Trash2 size={16} />} label="Clear All" onClick={handleClear} />
              <div className="w-px h-6 bg-gray-300 mx-1 block" />
              <div className="flex items-center gap-3 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-medium">Author</span>
                  <input type="text" value={author} onChange={(e) => { setAuthor(e.target.value); setIsSaved(false); }} className="text-xs border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-blue-500 max-w-[100px] shadow-sm" placeholder="Author Name" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-medium">Date</span>
                  <input type="date" value={creationDate} onChange={(e) => { setCreationDate(e.target.value); setIsSaved(false); }} className="text-xs border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-blue-500 w-[115px] shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-medium">Tags</span>
                  <input type="text" value={tags} onChange={(e) => { setTags(e.target.value); setIsSaved(false); }} className="text-xs border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-blue-500 max-w-[120px] shadow-sm" placeholder="tag1, tag2..." />
                </div>
              </div>
            </>
          )}
        </div>
        
        {activeTab === 'Edit' && activeTableCell && (
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar min-h-[40px] px-2 py-1.5 bg-blue-50/50 border-t border-blue-100">
            <span className="text-xs font-semibold text-blue-600 px-2 uppercase tracking-wider">Table Cell</span>
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <RibbonButton icon={<AlignLeft size={16} />} label="Align Left" onClick={() => { activeTableCell.style.textAlign = 'left'; handleInput(); }} />
            <RibbonButton icon={<AlignCenter size={16} />} label="Align Center" onClick={() => { activeTableCell.style.textAlign = 'center'; handleInput(); }} />
            <RibbonButton icon={<AlignRight size={16} />} label="Align Right" onClick={() => { activeTableCell.style.textAlign = 'right'; handleInput(); }} />
            <RibbonButton icon={<AlignJustify size={16} />} label="Justify" onClick={() => { activeTableCell.style.textAlign = 'justify'; handleInput(); }} />
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <RibbonButton icon={<ArrowUp size={16} />} label="Top" onClick={() => { activeTableCell.style.verticalAlign = 'top'; handleInput(); }} />
            <RibbonButton icon={<Minus size={16} />} label="Middle" onClick={() => { activeTableCell.style.verticalAlign = 'middle'; handleInput(); }} />
            <RibbonButton icon={<ArrowDown size={16} />} label="Bottom" onClick={() => { activeTableCell.style.verticalAlign = 'bottom'; handleInput(); }} />
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <span className="text-[10px] text-blue-500 font-semibold uppercase">Rows</span>
            <RibbonButton icon={<Plus size={16} />} label="Add Row Below" onClick={() => addTableRow(true)} />
            <RibbonButton icon={<Plus size={16} />} label="Add Row Above" onClick={() => addTableRow(false)} />
            <RibbonButton icon={<Trash2 size={16} className="text-red-500" />} label="Delete Row" onClick={deleteTableRow} />
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <span className="text-[10px] text-blue-500 font-semibold uppercase">Cols</span>
            <RibbonButton icon={<Plus size={16} />} label="Add Col Right" onClick={() => addTableCol(true)} />
            <RibbonButton icon={<Plus size={16} />} label="Add Col Left" onClick={() => addTableCol(false)} />
            <RibbonButton icon={<Trash2 size={16} className="text-red-500" />} label="Delete Col" onClick={deleteTableCol} />
            <div className="w-px h-4 bg-blue-200 mx-1 block" />
            <RibbonButton icon={<Heading size={16} />} label="Header Row" onClick={convertToHeaderRow} />
          </div>
        )}
      </div>
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
        <div className="relative w-full max-w-[816px] shadow-md bg-white border border-gray-200">
          <div 
            ref={editorRef}
            className={`w-full min-h-[1056px] p-12 sm:p-16 md:p-24 outline-none ${fontFamily} [&_h1]:text-4xl [&_h1]:sm:text-5xl [&_h1]:font-extrabold [&_h1]:mb-6 [&_h1]:mt-8 [&_h2]:text-3xl [&_h2]:sm:text-4xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_h3]:text-2xl [&_h3]:sm:text-3xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-2 [&_h5]:mt-3 [&_h6]:text-base [&_h6]:font-medium [&_h6]:text-gray-600 [&_h6]:mb-1 [&_h6]:mt-2 [&_ul]:list-disc [&_ul]:ml-8 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-8 [&_ol]:mb-4 ${pSpacingClasses[paragraphSpacing]} ${lhClasses[lineHeight]} focus:shadow-lg focus:ring-1 focus:ring-blue-100 transition-shadow`}
            contentEditable
            spellCheck={spellCheckEnabled}
            onInput={handleInput}
            onMouseUp={updateSelectionState}
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
          
          {/* Overlay Page Numbers & Visual Pagination lines */}
          {showPageNumbers && Array.from({ length: totalPages }).map((_, i) => (
            <React.Fragment key={i}>
              <div 
                className="absolute left-0 w-full flex justify-center pointer-events-none select-none print:hidden opacity-50 z-10"
                style={{ top: `${(i + 1) * 1056 - 32}px` }}
              >
                <span className="text-gray-400 text-sm font-medium bg-white px-2">- {i + 1} -</span>
              </div>
              {i < totalPages - 1 && (
                <div 
                  className="absolute left-0 w-full border-b-2 border-dashed border-gray-300 pointer-events-none opacity-50 z-10"
                  style={{ top: `${(i + 1) * 1056}px` }}
                />
              )}
            </React.Fragment>
          ))}
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
