import { useEffect, useState } from 'react';
import { AiAssistantSidebar } from './components/ai/AiAssistantSidebar';
import { AiDocumentEditor } from './components/editor/AiDocumentEditor';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { CommandBar } from './components/toolbar/CommandBar';
import { AiCommandId } from './lib/ai/commands';
import { EMPTY_DOCUMENT_HTML, STARTUP_PROPOSAL_HTML } from './lib/editor/templates';
import { loadDocument, saveDocument } from './lib/editor/storage';
import { exportDocx, exportPdf } from './lib/export/document-export';
import { processDocument } from './server/actions/documentActions';

export default function App() {
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
      setContent(result);
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
      setContent(result);
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
          onExportDocx={() => exportDocx(content)}
          onExportPdf={() => exportPdf(content)}
          isProcessing={isProcessing}
        />
      }
      editor={<AiDocumentEditor content={content} onChange={setContent} onRunCommand={runCommand} />}
      assistant={<AiAssistantSidebar onRunCommand={runCommand} onAsk={askAssistant} isProcessing={isProcessing} status={status} />}
    />
  );
}
