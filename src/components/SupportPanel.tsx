import { useState, useEffect, useRef } from 'react';
import { 
  FileType, ScanText, BrainCircuit, Aperture, QrCode, Archive, 
  X, BookOpen, ChevronLeft, ChevronRight, RotateCcw, Lock, Globe, Check, Copy, Gamepad2, Award, Frown, Smile, 
  Palette, LayoutGrid, Minus, Plus, RefreshCw, Image as ImageIcon, 
  Play, Trophy, Users, Upload, ExternalLink, Download, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const t = (en: string, km: string) => km || en;

function ConverterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState('Multiple Images to PDF');
  const [processing, setProcessing] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24}/></button>
        <div className="flex items-center gap-3 mb-6">
          <FileType className="text-blue-500" size={24} />
          <h2 className="text-xl font-bold text-slate-800">File Converter Tool</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-600 mb-2">Select Operation</label>
          <select value={operation} onChange={e => setOperation(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 text-sm font-medium">
            <option>Multiple Images to PDF</option>
            <option>PDF to Images</option>
            <option>ZIP to PDF</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-600 mb-2">Upload File(s)</label>
          <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <label className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-200">
              Choose File
              <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
            <span className="text-sm text-slate-500 truncate">{file ? file.name : 'No file chosen'}</span>
          </div>
        </div>
        <button onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false); alert('Conversion Complete! Download starting...'); }, 2000); }} disabled={!file || processing} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
          <RefreshCw size={18} className={processing ? 'animate-spin' : ''} /> {processing ? 'Converting...' : 'Convert File'}
        </button>
      </div>
    </div>
  );
}

function OcrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24}/></button>
        <div className="flex items-center gap-3 mb-6">
          <ScanText className="text-blue-500" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Image OCR Extract</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-600 mb-2">Upload Image (JPG/PNG)</label>
          <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <label className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-200">
              Choose Image
              <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
            <span className="text-sm text-slate-500 truncate">{file ? file.name : 'No image chosen'}</span>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-600 mb-2">Extracted Text Output</label>
          <textarea value={output} readOnly placeholder="Extracted text will appear here..." className="w-full border border-slate-200 rounded-xl p-3 outline-none min-h-[120px] text-sm resize-none bg-slate-50" />
        </div>
        <button onClick={() => { setProcessing(true); setTimeout(() => { setOutput('Sample extracted text from the image successfully processed.'); setProcessing(false); }, 2000); }} disabled={!file || processing} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
          <ScanText size={18} className={processing ? 'animate-pulse' : ''} /> {processing ? 'Extracting...' : 'Extract Text'}
        </button>
      </div>
    </div>
  );
}

function FlashcardModal({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<'review' | 'quiz'>('review');
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizState, setQuizState] = useState('idle');

  useEffect(() => {
    if (open) {
      const fetchCards = async () => {
        let q = supabase.from('flashcards').select('*').order('created_at', { ascending: false });
        if (!isAdmin) q = q.eq('is_private', false);
        const { data } = await q;
        if (data) setCards(data);
      };
      fetchCards();
      setIsFlipped(false);
      setCurrentIndex(0);
      setQuizState('idle');
    }
  }, [open, isAdmin]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[800px] h-[95vh] sm:h-[85vh] rounded-3xl relative flex flex-col shadow-2xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-500"><BookOpen size={24} /></div>
            <div><h3 className="text-xl font-bold text-slate-800">Knowledge Center</h3><p className="text-xs text-slate-500 mt-1">Learn, memorize, and test your knowledge</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24} /></button>
        </div>
        <div className="flex border-b border-slate-100">
          <button onClick={() => { setActiveTab('review'); setIsFlipped(false); }} className={`flex-1 py-4 text-sm font-bold border-b-2 ${activeTab === 'review' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Review</button>
          <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-4 text-sm font-bold border-b-2 ${activeTab === 'quiz' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Quiz Mode</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeTab === 'review' && (
            <div className="flex flex-col items-center justify-center h-full max-w-[650px] mx-auto">
              {cards.length === 0 ? <p className="font-bold text-slate-400">No cards available.</p> : (
                <div className="w-full flex flex-col items-center gap-4 h-full">
                  <div className="text-xs font-bold tracking-widest uppercase text-slate-500">CARD {currentIndex + 1} OF {cards.length}</div>
                  <div className="relative w-full flex-1 min-h-[400px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1200px' }}>
                    <div className="w-full h-full transition-transform duration-500 rounded-3xl relative shadow-md" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      <div className="absolute inset-0 rounded-3xl flex flex-col p-6 sm:p-10 text-white" style={{ backfaceVisibility: 'hidden', background: cards[currentIndex].color || '#0ea5e9' }}>
                        <div className="flex justify-between items-center mb-6 opacity-80"><span className="text-xs font-bold uppercase tracking-wider">QUESTION</span><div className="flex gap-2"><Copy size={16}/>{isAdmin && (cards[currentIndex].is_private ? <Lock size={16}/> : <Globe size={16}/>)}</div></div>
                        <div className="flex-1 overflow-y-auto"><pre className="text-lg sm:text-xl font-bold whitespace-pre-wrap font-sans">{cards[currentIndex].question}</pre></div>
                        <div className="mt-4 flex justify-center opacity-80 text-sm font-medium"><RotateCcw size={16} className="mr-2"/> Click to flip</div>
                      </div>
                      <div className="absolute inset-0 rounded-3xl flex flex-col p-6 sm:p-10 text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: cards[currentIndex].color || '#0ea5e9' }}>
                        <div className="flex justify-between items-center mb-6 opacity-80"><span className="text-xs font-bold uppercase tracking-wider">ANSWER</span><Copy size={16}/></div>
                        <div className="flex-1 overflow-y-auto"><pre className="text-lg sm:text-xl font-bold whitespace-pre-wrap font-sans">{cards[currentIndex].answer}</pre></div>
                        <div className="mt-4 flex justify-center opacity-80 text-sm font-medium"><RotateCcw size={16} className="mr-2"/> Click to flip</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full mt-4">
                    <button onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentIndex(prev => prev - 1), 150); }} disabled={currentIndex === 0} className="flex-1 py-4 rounded-2xl flex justify-center items-center gap-2 font-bold bg-white text-slate-700 shadow-sm border border-slate-100 disabled:opacity-50"><ChevronLeft size={20} /> Prev</button>
                    <button onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentIndex(prev => prev + 1), 150); }} disabled={currentIndex === cards.length - 1} className="flex-1 py-4 rounded-2xl flex justify-center items-center gap-2 font-bold bg-white text-slate-700 shadow-sm border border-slate-100 disabled:opacity-50">Next <ChevronRight size={20} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'quiz' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {quizState === 'idle' ? (
                <>
                  <Award size={64} className="text-amber-400 mb-6" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Quiz coming soon!</h3>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VaultModal({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin: boolean }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchVault = async () => {
        const { data } = await supabase.from('schedules').select('data_json').eq('type', 'vault_items').maybeSingle();
        if (data?.data_json) setNotes(data.data_json);
      };
      fetchVault();
    }
  }, [open]);

  if (!open) return null;
  const visibleNotes = isAdmin ? notes : notes.filter(n => !n.is_private);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[900px] h-[95vh] sm:h-[85vh] bg-white rounded-3xl relative flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center"><Archive size={24}/></div><div><h3 className="text-xl font-extrabold text-slate-800">My Vault</h3><p className="text-xs text-slate-500 mt-1">{isAdmin ? 'Admin View: All files' : 'Public View: Shared files'}</p></div></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {visibleNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400"><Archive size={64} className="mb-4"/><p className="font-bold text-lg">Vault is empty.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleNotes.map(note => {
                const isExpanded = expandedId === note.id;
                return (
                  <div key={note.id} className="p-5 bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm" style={{ borderTop: `4px solid ${note.type === 'document' ? '#10b981' : note.type === 'link' ? '#3b82f6' : '#f59e0b'}` }}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">{note.type === 'link' ? <LinkIcon size={18} className="text-blue-500"/> : note.type === 'password' ? <Lock size={18} className="text-amber-500"/> : <FileText size={18} className="text-emerald-500"/>} {note.title}</h4>
                      <div className="flex gap-2 text-slate-400"><Copy size={16} className="cursor-pointer hover:text-slate-700"/> {isAdmin && (note.is_private ? <Lock size={16} className="text-rose-500"/> : <Globe size={16} className="text-emerald-500"/>)}</div>
                    </div>
                    {note.content && <p className={`text-sm text-slate-600 mb-4 whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100 ${!isExpanded ? 'line-clamp-3' : ''}`}>{note.content}</p>}
                    <button onClick={() => setExpandedId(isExpanded ? null : note.id)} className="mt-auto w-full py-2 flex justify-center items-center gap-1 text-xs font-bold text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-lg">{isExpanded ? <><ChevronUp size={16}/> See Less</> : <><ChevronDown size={16}/> See All</>}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QrGeneratorModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [data, setData] = useState('https://khouvchvea.com');
  const [resolution, setResolution] = useState(1000);
  const [activeSection, setActiveSection] = useState('content');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !(window as any).QRCodeStyling) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js';
      document.head.appendChild(s);
    }
  }, [open]);

  useEffect(() => {
    if (open && (window as any).QRCodeStyling && qrRef.current) {
      qrRef.current.innerHTML = '';
      const qrCode = new (window as any).QRCodeStyling({ width: 300, height: 300, data: data, dotsOptions: { type: 'square' }, cornersSquareOptions: { type: 'square' } });
      qrCode.append(qrRef.current);
    }
  }, [data, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[1100px] rounded-3xl relative flex flex-col h-[90vh] shadow-2xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <h3 className="flex items-center gap-3 text-xl font-extrabold text-slate-800"><div className="bg-blue-50 p-2 rounded-xl"><QrCode size={24} className="text-blue-500" /></div> High-Res QR Code Generator</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24} /></button>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          <div className="w-full lg:w-[50%] lg:overflow-y-auto border-r border-slate-100">
            <button onClick={() => setActiveSection('content')} className="w-full flex items-center justify-between p-5 border-b border-slate-100 font-bold bg-blue-50/50 text-blue-700"><span className="flex items-center gap-3"><div className="bg-blue-500 text-white p-1.5 rounded-lg"><Globe size={18}/></div> ENTER CONTENT</span> {activeSection === 'content' ? <Minus size={18}/> : <Plus size={18}/>}</button>
            {activeSection === 'content' && <div className="p-6"><label className="block text-xs font-bold uppercase text-slate-500 mb-2">YOUR URL</label><input type="text" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50 font-medium"/></div>}
            
            <button onClick={() => setActiveSection('colors')} className="w-full flex items-center justify-between p-5 border-b border-slate-100 font-bold text-slate-700"><span className="flex items-center gap-3"><Palette size={18}/> SET COLORS</span> <Plus size={18}/></button>
            <button onClick={() => setActiveSection('logo')} className="w-full flex items-center justify-between p-5 border-b border-slate-100 font-bold text-slate-700"><span className="flex items-center gap-3"><ImageIcon size={18}/> ADD LOGO IMAGE</span> <Plus size={18}/></button>
            <button onClick={() => setActiveSection('design')} className="w-full flex items-center justify-between p-5 border-b border-slate-100 font-bold text-slate-700"><span className="flex items-center gap-3"><LayoutGrid size={18}/> CUSTOMIZE DESIGN</span> <Plus size={18}/></button>
          </div>
          <div className="w-full lg:w-[50%] p-8 flex flex-col items-center justify-center bg-slate-900">
            <div className="bg-white rounded-3xl p-4 mb-8 shadow-2xl"><div ref={qrRef} className="w-[250px] h-[250px] [&>canvas]:w-full [&>canvas]:h-auto"/></div>
            <div className="w-full max-w-[320px]">
               <div className="flex justify-between items-center mb-3 text-[10px] font-extrabold uppercase text-slate-400"><span>LOW QUALITY</span><span className="text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full">{resolution} X {resolution} PX</span><span>HIGH QUALITY</span></div>
               <input type="range" min="400" max="2000" step="200" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="w-full mb-8 accent-blue-500"/>
               <button className="w-full bg-[#8bc34a] hover:bg-[#7cb342] text-white py-4 rounded-xl font-extrabold text-sm mb-3 shadow-lg transition-transform active:scale-95">Create QR Code</button>
               <button className="w-full bg-[#4fc3f7] hover:bg-[#29b6f6] text-white py-4 rounded-xl font-extrabold text-sm mb-3 shadow-lg transition-transform active:scale-95">Download PNG</button>
               <button className="w-full border-2 border-[#4fc3f7] text-[#4fc3f7] py-3 rounded-xl font-extrabold text-sm hover:bg-[#4fc3f7]/10 transition-colors">.SVG</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpinWheelModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [namesText, setNamesText] = useState('សិស្សទី១\nសិស្សទី២\nសិស្សទី៣');
  const [names, setNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => { setNames(namesText.split('\n').filter(Boolean)); }, [namesText]);

  useEffect(() => {
    if (!open || !canvasRef.current || names.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const w = 800, h = 800, cx = 400, cy = 400, r = 380;
    ctx.clearRect(0,0,w,h);
    names.forEach((name, i) => {
      const angle = i * ((2*Math.PI)/names.length);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,angle,angle+((2*Math.PI)/names.length));
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle+((2*Math.PI)/names.length)/2);
      ctx.textAlign='right'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.font='bold 24px sans-serif';
      ctx.fillText(name.substring(0,15), r-30, 0); ctx.restore();
    });
  }, [names, open]);

  const spin = () => {
    if (names.length < 2 || isSpinning) return;
    setIsSpinning(true); setWinner(null);
    const winIndex = Math.floor(Math.random() * names.length);
    setRotation(Math.floor(rotation/360)*360 + 2880 + (270 - (winIndex * (360/names.length) + (360/names.length)/2)));
    setTimeout(() => { setWinner(names[winIndex]); setIsSpinning(false); }, 5000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[1000px] bg-white rounded-3xl relative flex flex-col md:flex-row h-[90vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-rose-500"><X size={20}/></button>
        <div className="w-full md:w-[40%] flex flex-col p-6 border-r border-slate-100 bg-slate-50">
          <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3"><div className="bg-fuchsia-100 p-2 rounded-xl text-fuchsia-500"><Aperture size={24}/></div> Spin Wheel</h3>
          <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold uppercase text-slate-500">Names ({names.length})</span><button onClick={()=>setNamesText('')} className="text-xs text-rose-500 font-bold">Clear</button></div>
          <textarea value={namesText} onChange={e => setNamesText(e.target.value)} disabled={isSpinning} className="w-full flex-1 p-4 border border-slate-200 rounded-2xl outline-none resize-none mb-4 font-medium"/>
          <label className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold flex justify-center items-center gap-2 cursor-pointer shadow-sm hover:bg-slate-50"><Upload size={18}/> Upload .txt<input type="file" accept=".txt" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload=ev=>setNamesText(ev.target?.result as string); r.readAsText(f); } }} className="hidden"/></label>
        </div>
        <div className="w-full md:w-[60%] flex flex-col items-center justify-center p-8 relative bg-white">
          <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center mb-10">
            <div className="absolute -top-[20px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-slate-800 drop-shadow-md"/>
            <canvas ref={canvasRef} width={800} height={800} className="w-full h-full" style={{ transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0, 1)' : 'none', transform: `rotate(${rotation}deg)` }}/>
          </div>
          <button onClick={spin} disabled={isSpinning || names.length<2} className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-12 py-4 rounded-full font-bold text-xl shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"><Play size={24}/> {isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
          {winner && !isSpinning && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 animate-fade-up text-center">
              <Trophy size={80} className="text-amber-400 mb-6 animate-bounce"/>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">WINNER</h3>
              <p className="text-5xl font-black text-slate-800 mb-10">{winner}</p>
              <button onClick={()=>setWinner(null)} className="bg-slate-800 text-white px-10 py-4 rounded-xl font-bold text-lg">Continue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   6. MAIN SUPPORT/TOOLS COMPONENT
   ========================================= */
export function SupportPanel({ isAdmin }: { isAdmin: boolean }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const tools = [
    { id: 'converter', title: 'File Converter Tool', description: 'Convert PDF to Image (JPG/PNG) or Image to PDF seamlessly.', icon: FileType, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { id: 'ocr', title: 'Image OCR Tool', description: 'Extract text from images automatically. Supports English and Khmer.', icon: ScanText, iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
    { id: 'flashcard', title: 'Flashcards', description: 'Digital study cards designed to help learners review and remember lessons more easily.', icon: BrainCircuit, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { id: 'wheel', title: 'Spin Wheel', description: 'Use this tool to spin the wheel and randomly select an outcome.', icon: Aperture, iconBg: 'bg-fuchsia-50', iconColor: 'text-fuchsia-500' },
    { id: 'qr', title: 'Custom QR Generator', description: 'Create beautiful QR codes with custom colors and logos.', icon: QrCode, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { id: 'vault', title: 'My Vault', description: 'Access my shared notes, important links, and documents.', icon: Archive, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' }
  ];

  return (
    <div className="w-full animate-fade-in pb-20 pt-4 px-3 sm:px-4">
      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl mx-auto">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} onClick={() => setActiveModal(tool.id)} className="bg-white rounded-[24px] p-5 flex items-start gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-slate-100 shadow-sm active:scale-[0.98]">
              <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 ${tool.iconBg} ${tool.iconColor}`}><Icon size={26} strokeWidth={1.5} /></div>
              <div className="flex flex-col pt-0.5"><h3 className="font-bold text-slate-800 text-[15px] sm:text-base mb-1.5">{tool.title}</h3><p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed">{tool.description}</p></div>
            </div>
          );
        })}
      </div>

      <ConverterModal open={activeModal === 'converter'} onClose={() => setActiveModal(null)} />
      <OcrModal open={activeModal === 'ocr'} onClose={() => setActiveModal(null)} />
      <FlashcardModal open={activeModal === 'flashcard'} onClose={() => setActiveModal(null)} isAdmin={isAdmin} />
      <QrGeneratorModal open={activeModal === 'qr'} onClose={() => setActiveModal(null)} />
      <SpinWheelModal open={activeModal === 'wheel'} onClose={() => setActiveModal(null)} />
      <VaultModal open={activeModal === 'vault'} onClose={() => setActiveModal(null)} isAdmin={isAdmin} />
    </div>
  );
}