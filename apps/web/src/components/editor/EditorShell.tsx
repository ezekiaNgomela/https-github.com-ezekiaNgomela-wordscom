import { useEffect, useMemo, useState } from 'react';
import { AiAssistantSidebar } from '../ai/AiAssistantSidebar';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { CommandBar } from '../toolbar/CommandBar';
import { AiCommandId } from '../../lib/ai/commands';
import { EMPTY_DOCUMENT_HTML, STARTUP_PROPOSAL_HTML } from '../../lib/editor/templates';
import { autoDetectHeadings, autoFormatPlainTextToHtml, getDocumentSuggestions } from '../../lib/editor/intelligence';
import { loadDocument, saveDocument } from '../../lib/editor/storage';
import { exportDocx, exportPdf } from '../../lib/export/document-export';
import { processDocument } from '../../server/actions/documentActions';
import { AiDocumentEditor } from './AiDocumentEditor';

export function EditorShell() {
  const [content, setContent] = useState(EMPTY_DOCUMENT_HTML);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready to turn intent into a structured document.');

  useEffect(() => {
    setContent(loadDocument(EMPTY_DOCUMENT_HTML));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveDocument(content), 600);
    return () => window.clearTimeout(timeout);
  }, [content]);

  const suggestions = useMemo(() => getDocumentSuggestions(content), [content]);

  const autoFormat = () => {
    const plainText = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '\n');
    const formatted = content.includes('<') ? autoDetectHeadings(content) : autoFormatPlainTextToHtml(plainText);
    setContent(formatted);
    setStatus('Auto formatting applied with heading detection.');
  };

  const runCommand = async (command: AiCommandId) => {
    if (command === 'proposal' && content.replace(/<[^>]*>/g, '').trim().length < 80) {
      setContent(STARTUP_PROPOSAL_HTML);
      setStatus('Generated a startup proposal structure locally.');
      return;
    }

    setIsProcessing(true);
    setStatus(`Running /${command}...`);
    try {
      const { result } = await processDocument({ command, content });
      setContent(autoDetectHeadings(result));
      setStatus(`/${command} completed. Document updated.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'AI command failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const askAssistant = async (message: string) => {
    setIsProcessing(true);
    setStatus('AI is reading the document...');
    try {
      const { result } = await processDocument({ command: 'chat', content, message });
      setContent(autoDetectHeadings(result));
      setStatus('Assistant updated the document.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Assistant request failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <WorkspaceLayout
      commandBar={
        <CommandBar
          onSave={() => {
            saveDocument(content);
            setStatus('Document saved in this browser.');
          }}
          onAutoFormat={autoFormat}
          onExportDocx={() => exportDocx(content)}
          onExportPdf={() => exportPdf(content)}
          isProcessing={isProcessing}
        />
      }
      editor={<AiDocumentEditor content={content} onChange={setContent} onRunCommand={runCommand} onAutoFormat={autoFormat} />}
      assistant={
        <AiAssistantSidebar
          onRunCommand={runCommand}
          onAsk={askAssistant}
          isProcessing={isProcessing}
          status={status}
          suggestions={suggestions}
        />
      }
    />
  );
}
