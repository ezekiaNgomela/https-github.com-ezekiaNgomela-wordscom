import { ChangeEvent, useRef, useState } from 'react';
import { FileAudio, Image as ImageIcon, Lock, Mic, NotebookPen, ScanText, Volume2, WandSparkles } from 'lucide-react';
import { PremiumState } from '../../lib/ai/premium';
import { PremiumDocumentTask, PremiumMediaTask } from '../../server/actions/premiumAiActions';
import { PREMIUM_AI_MODELS } from '../../lib/ai/premium-models';

type PremiumAiPanelProps = {
  premium: PremiumState;
  isProcessing: boolean;
  onPremiumText: (task: PremiumDocumentTask, concept?: string) => void;
  onPremiumMedia: (task: PremiumMediaTask, file: File) => void;
  onDictationText: (text: string) => void;
  onReadDocument: () => void;
};

const fileLabel = (file: File | null) => file ? file.name : 'Choose file';

export function PremiumAiPanel({ premium, isProcessing, onPremiumText, onPremiumMedia, onDictationText, onReadDocument }: PremiumAiPanelProps) {
  const [concept, setConcept] = useState('');
  const [dialog, setDialog] = useState('');
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [dictationStatus, setDictationStatus] = useState('Ready');
  const recognitionRef = useRef<any>(null);

  const locked = !premium.isPremium;

  const handleMedia = (event: ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    setter(event.target.files?.[0] ?? null);
  };

  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictationStatus('Speech recognition is not available in this browser. Upload audio instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((result: any) => result[0]?.transcript)
        .filter(Boolean)
        .join(' ');
      if (text) onDictationText(text);
    };
    recognition.onend = () => setDictationStatus('Stopped');
    recognition.onerror = () => setDictationStatus('Dictation failed. Try audio upload.');
    recognitionRef.current = recognition;
    recognition.start();
    setDictationStatus('Listening...');
  };

  const stopDictation = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setDictationStatus('Stopped');
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Premium AI models</p>
          <h3 className="mt-1 font-bold text-slate-950">Refine, scan, listen, transcribe</h3>
        </div>
        {locked && <Lock size={18} className="text-slate-400" />}
      </div>

      {locked && (
        <p className="mb-4 rounded-2xl bg-white p-3 text-sm text-slate-600">
          Sign in with an active premium subscription to run grammar refinement, concept notes, speech, audio transcription, and scanner AI.
        </p>
      )}

      <div className="mb-4 rounded-2xl bg-white p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Model stack</p>
        <div className="space-y-2">
          {PREMIUM_AI_MODELS.map((model) => (
            <div key={model.id} className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{model.name}:</span> {model.purpose}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button disabled={locked || isProcessing} onClick={() => onPremiumText('refineGrammar')} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left text-sm font-semibold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
          <WandSparkles size={17} className="text-cyan-500" /> Grammar + text refining
        </button>

        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><NotebookPen size={16} className="text-cyan-500" /> Notes from concept</label>
          <textarea value={concept} onChange={(event) => setConcept(event.target.value)} disabled={locked || isProcessing} placeholder="Describe the concept, idea, or prompt..." className="h-20 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-cyan-400 disabled:opacity-50" />
          <button disabled={locked || isProcessing || !concept.trim()} onClick={() => onPremiumText('conceptNotes', concept)} className="mt-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Create notes</button>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Mic size={16} className="text-cyan-500" /> Dialogue / meeting notes</label>
          <textarea value={dialog} onChange={(event) => setDialog(event.target.value)} disabled={locked || isProcessing} placeholder="Paste dialogue or meeting transcript..." className="h-20 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-cyan-400 disabled:opacity-50" />
          <button disabled={locked || isProcessing || !dialog.trim()} onClick={() => onPremiumText('dialogNotes', dialog)} className="mt-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Summarize dialogue</button>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Volume2 size={16} className="text-cyan-500" /> Text to speech + dictation</p>
          <div className="flex flex-wrap gap-2">
            <button disabled={locked || isProcessing} onClick={onReadDocument} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">Read document</button>
            <button disabled={locked || isProcessing} onClick={startDictation} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">Start dictation</button>
            <button disabled={locked || isProcessing} onClick={stopDictation} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">Stop</button>
          </div>
          <p className="mt-2 text-xs text-slate-500">{dictationStatus}</p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><ScanText size={16} className="text-cyan-500" /> Text scanner: image or video</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            <ImageIcon size={16} /> {fileLabel(scanFile)}
            <input className="hidden" type="file" accept="image/*,video/*" disabled={locked || isProcessing} onChange={(event) => handleMedia(event, setScanFile)} />
          </label>
          <button disabled={locked || isProcessing || !scanFile} onClick={() => scanFile && onPremiumMedia('scanText', scanFile)} className="mt-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Generate text document</button>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileAudio size={16} className="text-cyan-500" /> Audio to document</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            <FileAudio size={16} /> {fileLabel(audioFile)}
            <input className="hidden" type="file" accept="audio/*" disabled={locked || isProcessing} onChange={(event) => handleMedia(event, setAudioFile)} />
          </label>
          <button disabled={locked || isProcessing || !audioFile} onClick={() => audioFile && onPremiumMedia('transcribeAudio', audioFile)} className="mt-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Transcribe audio</button>
        </div>
      </div>
    </div>
  );
}
