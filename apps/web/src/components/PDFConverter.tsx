import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { UploadCloud, Download, FileImage, Trash2, Layout, BookOpen, Layers, CheckSquare, Square, RotateCw, RotateCcw, Crop } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { PDFPageRenderer } from './PDFPageRenderer';

// We need to set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function PDFConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<{ url: string | null, pageNum: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [cropPageNum, setCropPageNum] = useState<number | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isCroppingMouseState, setIsCroppingMouseState] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number, y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const cropImageUrl = cropPageNum ? pages.find(p => p.pageNum === cropPageNum)?.url : null;
  
  // Expose ensuring URL for downloads and operations
  const getPageUrl = async (pageNum: number) => {
    const pageObj = pages.find(p => p.pageNum === pageNum);
    if (pageObj && pageObj.url) return pageObj.url;
    if (!pdf) return null;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL(format, 0.9);
  };

  const handleSetImageUrl = useCallback((pageNum: number, url: string) => {
    setPages(prev => prev.map(p => p.pageNum === pageNum ? { ...p, url } : p));
  }, []);

  const handleCropMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCropStart({ x, y });
    setCropRect({ x, y, w: 0, h: 0 });
    setIsCroppingMouseState(true);
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCroppingMouseState || !cropStart || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    setCropRect({
      x: Math.min(cropStart.x, currentX),
      y: Math.min(cropStart.y, currentY),
      w: Math.abs(currentX - cropStart.x),
      h: Math.abs(currentY - cropStart.y)
    });
  };

  const handleCropMouseUp = () => {
    setIsCroppingMouseState(false);
  };

  useEffect(() => {
    setPages(prev => prev.map(p => ({ ...p, url: null })));
  }, [format]);

  const handleApplyCrop = async () => {
    if (!cropRect || !cropPageNum || !cropImageUrl) return;
    setIsProcessing(true);
    
    const cropImg = new Image();
    cropImg.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const sourceX = (cropRect.x / 100) * cropImg.width;
      const sourceY = (cropRect.y / 100) * cropImg.height;
      const sourceW = (cropRect.w / 100) * cropImg.width;
      const sourceH = (cropRect.h / 100) * cropImg.height;
      
      canvas.width = sourceW;
      canvas.height = sourceH;
      
      ctx.drawImage(cropImg, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
      const newUrl = canvas.toDataURL(format);
      
      handleSetImageUrl(cropPageNum, newUrl);
      setCropPageNum(null);
      setCropRect(null);
      setIsProcessing(false);
    };
    cropImg.src = cropImageUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setPages([]);
      setSelectedPages(new Set());
      setIsProcessing(true);
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);

        const newPages = [];
        for (let i = 1; i <= loadedPdf.numPages; i++) {
          newPages.push({ url: null, pageNum: i });
        }
        setPages(newPages);
      } catch (err) {
        console.error("Error displaying PDF:", err);
        alert("Failed to render PDF.");
      } finally {
        setIsProcessing(false);
      }
    } else if (selected) {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleDownload = (url: string, pageNum: number) => {
    saveAs(url, `${file?.name.replace('.pdf', '')}_page_${pageNum}.${format.split('/')[1]}`);
  };

  const toggleSelection = (pageNum: number) => {
    const newSet = new Set(selectedPages);
    if (newSet.has(pageNum)) {
      newSet.delete(pageNum);
    } else {
      newSet.add(pageNum);
    }
    setSelectedPages(newSet);
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.pageNum)));
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPages.size === 0) return;
    setIsProcessing(true);
    
    if (selectedPages.size === 1) {
      // Just download the single file if only one is selected
      const pageNum = Array.from(selectedPages)[0];
      const url = await getPageUrl(pageNum);
      if (url) handleDownload(url, pageNum);
      setIsProcessing(false);
      return;
    }

    const zip = new JSZip();
    const toZip = Array.from(selectedPages);
    
    for (let pageNum of toZip) {
      const url = await getPageUrl(pageNum);
      if (url) {
        const idx = url.indexOf('base64,') + 'base64,'.length;
        const content = url.substring(idx);
        const extension = format.split('/')[1];
        zip.file(`page_${pageNum}.${extension}`, content, {base64: true});
      }
    }
    
    const blob = await zip.generateAsync({type: 'blob'});
    saveAs(blob, `${file?.name.replace('.pdf', '')}_selected.zip`);
    setIsProcessing(false);
  };

  const rotateImageBase64 = (base64: string, degrees: number, fmt: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);
        
        if (Math.abs(degrees) === 90 || Math.abs(degrees) === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL(fmt));
      };
      img.src = base64;
    });
  };

  const handleRotateSelected = async (degrees: 90 | -90) => {
    if (selectedPages.size === 0) return;
    setIsProcessing(true);
    
    const newPages = [...pages];
    
    for (let i = 0; i < newPages.length; i++) {
        if (selectedPages.has(newPages[i].pageNum)) {
            const url = await getPageUrl(newPages[i].pageNum);
            if (url) {
                const rotatedUrl = await rotateImageBase64(url, degrees, format);
                newPages[i] = { ...newPages[i], url: rotatedUrl };
            }
        }
    }
    
    setPages(newPages);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex flex-col border-b border-gray-200 bg-white">
        {/* Ribbon Header */}
        <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-6 text-xs sm:text-sm font-medium">
            <span className="text-red-600 border-b-2 border-red-600 pb-2 -mb-[9px] px-1">Convert</span>
          </div>
        </div>

        {/* Ribbon Content */}
        <div className="flex items-center gap-2 overflow-x-auto min-h-[48px] px-2 py-1.5 bg-gray-100/50">
          {process ? (
             <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 cursor-pointer transition-colors">
               <UploadCloud size={16} />
               <span>Upload PDF</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
             </label>
          ) : null}
          
          <div className="w-px h-6 bg-gray-300 mx-1 block" />
          
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value as any)}
            className="text-xs sm:text-sm bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-red-500 shadow-sm"
          >
            <option value="image/jpeg">JPG Format</option>
            <option value="image/png">PNG Format</option>
          </select>
          
          <div className="w-px h-6 bg-gray-300 mx-1 block" />
          
          <button 
            disabled={pages.length === 0}
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Layers size={16} />
            <span className="hidden sm:inline">{pages.length > 0 && selectedPages.size === pages.length ? 'Deselect All' : 'Select All'}</span>
          </button>
          
          <button 
            disabled={selectedPages.size === 0}
            onClick={handleDownloadSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download Selected {selectedPages.size > 0 && `(${selectedPages.size})`}</span>
          </button>
          
          <button 
            disabled={selectedPages.size === 0}
            onClick={() => handleRotateSelected(-90)}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Rotate Left (CCW)"
          >
            <RotateCcw size={16} />
          </button>
          
          <button 
            disabled={selectedPages.size === 0}
            onClick={() => handleRotateSelected(90)}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Rotate Right (CW)"
          >
            <RotateCw size={16} />
          </button>
          
          <button 
            disabled={selectedPages.size !== 1}
            onClick={() => setCropPageNum(Array.from(selectedPages)[0])}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Crop selected page (Select 1 page only)"
          >
            <Crop size={16} />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 block" />
          
          <button 
            disabled={!file}
            onClick={() => { setFile(null); setPages([]); setPdf(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
        {!file && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full max-w-md text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600 shadow-sm border border-red-200">
              <FileImage size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Convert PDF to Image</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Upload a standard PDF document to instantly extract out each individual page into a high-quality JPG or PNG image.
            </p>
            <label className="flex items-center gap-2 px-6 py-3 bg-red-600 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:bg-red-700 cursor-pointer transition-colors focus:ring-4 focus:ring-red-100">
               <UploadCloud size={18} />
               <span>Select PDF Document</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-100 border-t-red-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Processing pages...</p>
          </div>
        )}

        {pages.length > 0 && !isProcessing && (
          <div className="w-full max-w-5xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{file?.name} - {pages.length} Pages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pages.map((p) => (
                <PDFPageRenderer
                  key={p.pageNum}
                  pdf={pdf}
                  pageNum={p.pageNum}
                  url={p.url}
                  format={format}
                  selected={selectedPages.has(p.pageNum)}
                  onToggle={toggleSelection}
                  onDownload={handleDownload}
                  onSetUrl={handleSetImageUrl}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {cropPageNum && cropImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">Crop Page {cropPageNum}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCropPageNum(null); setCropRect(null); }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApplyCrop}
                  disabled={!cropRect || cropRect.w === 0 || cropRect.h === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Apply Crop
                </button>
              </div>
            </div>
            <div className="bg-gray-100 flex-1 relative flex items-center justify-center p-4 overflow-hidden select-none"
                 onMouseMove={handleCropMouseMove}
                 onMouseUp={handleCropMouseUp}
                 onMouseLeave={handleCropMouseUp}>
              <div className="relative inline-block border shadow-xl bg-white max-h-[70vh] flex items-center justify-center">
                <img 
                  ref={imgRef}
                  src={cropImageUrl} 
                  alt="Crop preview" 
                  className="block h-auto w-auto max-h-[70vh] max-w-full pointer-events-none" 
                />
                
                <div 
                  className="absolute inset-0 cursor-crosshair z-10"
                  onMouseDown={handleCropMouseDown}
                >
                  {cropRect && (
                    <div 
                      className="absolute border-2 border-green-500 bg-green-500/20"
                      style={{
                        left: `${cropRect.x}%`,
                        top: `${cropRect.y}%`,
                        width: `${cropRect.w}%`,
                        height: `${cropRect.h}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
              Drag over the image to select the area to crop
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
