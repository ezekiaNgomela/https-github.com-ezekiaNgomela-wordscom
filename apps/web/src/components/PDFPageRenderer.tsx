import React, { useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Download, CheckSquare, Square } from 'lucide-react';

interface PDFPageRendererProps {
  pdf: pdfjsLib.PDFDocumentProxy | null;
  pageNum: number;
  url: string | null;
  format: 'image/jpeg' | 'image/png';
  selected: boolean;
  onToggle: (pageNum: number) => void;
  onDownload: (url: string, pageNum: number) => void;
  onSetUrl: (pageNum: number, url: string) => void;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = ({ 
  pdf, 
  pageNum, 
  url, 
  format, 
  selected, 
  onToggle, 
  onDownload, 
  onSetUrl 
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const isRendering = useRef(false);

  useEffect(() => {
    isRendering.current = false;
  }, [format]);

  useEffect(() => {
    if (url || !pdf || isRendering.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        isRendering.current = true;
        renderPage();
      }
    }, { rootMargin: '200px' });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [pdf, pageNum, format, url]);

  const renderPage = async () => {
    if (!pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL(format, 0.9);
        onSetUrl(pageNum, dataUrl);
      }
    } catch (e) {
      console.error(e);
      isRendering.current = false;
    }
  };

  return (
    <div 
      ref={targetRef}
      className={`bg-white rounded-lg border shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative cursor-pointer ${selected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'}`}
      onClick={() => onToggle(pageNum)}
    >
      <div className="absolute top-2 left-2 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(pageNum); }}
          className="bg-white rounded shadow-sm flex items-center justify-center p-0.5"
        >
          {selected 
            ? <CheckSquare size={20} className="text-red-500" />
            : <Square size={20} className="text-gray-300" />
          }
        </button>
      </div>
      <div className="bg-gray-100 aspect-[1/1.414] relative border-b border-gray-200 flex items-center justify-center p-2">
        {url ? (
          <>
            <img src={url} alt={`Page ${pageNum}`} className="max-h-full max-w-full object-contain shadow-sm border border-gray-300 bg-white" />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onDownload(url, pageNum); }}
                className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Download Image"
              >
                <Download size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500"></div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Page {pageNum}</span>
        <span className="text-gray-400 font-mono text-xs uppercase">{format.split('/')[1]}</span>
      </div>
    </div>
  );
};
