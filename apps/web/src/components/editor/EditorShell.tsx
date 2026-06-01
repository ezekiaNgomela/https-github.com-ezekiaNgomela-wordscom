import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AiAssistantSidebar } from '../ai/AiAssistantSidebar';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { CommandBar } from '../toolbar/CommandBar';
import { AiCommandId } from '../../lib/ai/commands';
import { EMPTY_DOCUMENT_HTML, STARTUP_PROPOSAL_HTML } from '../../lib/editor/templates';
import { autoDetectHeadings, autoFormatPlainTextToHtml, getDocumentSuggestions } from '../../lib/editor/intelligence';
import { loadDocument, saveDocument } from '../../lib/editor/storage';
import { exportDocx, exportPdf } from '../../lib/export/document-export';
import { EMPTY_PREMIUM_STATE, PremiumState, readPremiumState } from '../../lib/ai/premium';
import { processDocument } from '../../server/actions/documentActions';
import { PremiumDocumentTask, PremiumMediaTask, runPremiumDocumentTask, runPremiumMediaTask } from '../../server/actions/premiumAiActions';
import { auth, logOut, signIn } from '../../firebase';
import { AiDocumentEditor } from './AiDocumentEditor';

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Unable to read media file.'));
    reader.readAsDataURL(file);
  });

const appendDictation = (content: string, text: string) => `${content}<p>${text}</p>`;

export function EditorShell() {
  const [content, setContent] = useState(EMPTY_DOCUMENT_HTML);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready to turn intent into a structured document.');
  const [premium, setPremium] = useState<PremiumState>(EMPTY_PREMIUM_STATE);

  useEffect(() => {
    setContent(loadDocument(EMPTY_DOCUMENT_HTML));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setPremium(await readPremiumState(user));
      } catch (error) {
        console.error(error);
        setPremium(user ? { ...EMPTY_PREMIUM_STATE, isSignedIn: true } : EMPTY_PREMIUM_STATE);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveDocument(content), 600);
    return () => window.clearTimeout(timeout);
  }, [content]);

  const suggestions = useMemo(() => getDocumentSuggestions(content), [content]);

  const requirePremium = () => {
    if (premium.isPremium) return true;
    setStatus(premium.isSignedIn ? 'Upgrade to premium to use this AI model.' : 'Sign in with a premium account to use this AI model.');
    return false;
  };

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

  const runPremiumText = async (task: PremiumDocumentTask, concept?: string) => {
    if (!requirePremium()) return;
    setIsProcessing(true);
    setStatus('Premium AI is refining the document...');
    try {
      const { result } = await runPremiumDocumentTask({ task, content, concept });
      setContent(autoDetectHeadings(result));
      setStatus('Premium AI document model completed.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Premium AI request failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const runPremiumMedia = async (task: PremiumMediaTask, file: File) => {
    if (!requirePremium()) return;
    setIsProcessing(true);
    setStatus(task === 'transcribeAudio' ? 'Transcribing audio into a document...' : 'Scanning media and extracting text...');
    try {
      const data = await fileToBase64(file);
      const { result } = await runPremiumMediaTask({ task, content, media: { mimeType: file.type, data } });
      setContent(autoDetectHeadings(result));
      setStatus(task === 'transcribeAudio' ? 'Audio transcript document created.' : 'Scanned text document created.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Premium media AI request failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDictationText = (text: string) => {
    if (!requirePremium()) return;
    setContent((current) => appendDictation(current, text));
    setStatus('Dictation added to the document.');
  };

  const readDocument = () => {
    if (!requirePremium()) return;
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) {
      setStatus('No document text available to read.');
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    setStatus('Reading the document aloud.');
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
          onSignIn={signIn}
          onSignOut={logOut}
          isProcessing={isProcessing}
          isSignedIn={premium.isSignedIn}
          premium={premium}
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
          premium={premium}
          onPremiumText={runPremiumText}
          onPremiumMedia={runPremiumMedia}
          onDictationText={handleDictationText}
          onReadDocument={readDocument}
        />
      }
    />
  );
}
