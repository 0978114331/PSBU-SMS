import { useState, useEffect, useRef } from 'react';
import { 
  FileType, ScanText, BrainCircuit, Aperture, QrCode, Archive, 
  X, BookOpen, Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, 
  Settings, Layers, Lock, Globe, Check, Edit2, Copy, Gamepad2, 
  Award, Frown, Smile, Palette, LayoutGrid, Minus, RefreshCw, 
  Image as ImageIcon, Play, Trophy, Users, FileText, Upload, 
  Link as LinkIcon, StickyNote, ExternalLink, Download, ChevronDown, ChevronUp 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper function to replace translation logic
const t = (en: string, km: string) => km || en;

/* =========================================
   1. FLASHCARD MODAL COMPONENT
   ========================================= */
type Card = { id: string; question: string; answer: string; color: string; is_private: boolean; };
function FlashcardModal({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin: boolean }) {
  const PRESET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#06b6d4', '#0ea5e9', '#84cc16', '#f97316', '#db2777', '#64748b'];
  const [activeTab, setActiveTab] = useState<'review' | 'quiz' | 'manage'>('review');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', color: '#10b981', is_private: false });
  const [quizScore, setQuizScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizState, setQuizState] = useState<'idle' | 'playing' | 'feedback' | 'finished'>('idle');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledQuizCards, setShuffledQuizCards] = useState<Card[]>([]);

  const fetchCards = async () => {
    let query = supabase.from('flashcards').select('*').order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('is_private', false);
    const { data } = await query;
    if (data) setCards(data);
  };

  useEffect(() => {
    if (open) {
      fetchCards();
      setIsFlipped(false);
      setCurrentIndex(0);
      cancelEdit();
      setQuizState('idle');
    }
  }, [open, isAdmin]);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveCard = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setLoading(true);
    if (editingId) {
      const { error } = await supabase.from('flashcards').update({ question: form.question.trim(), answer: form.answer.trim(), color: form.color, is_private: form.is_private }).eq('id', editingId);
      if (!error) { cancelEdit(); await fetchCards(); }
    } else {
      const { error } = await supabase.from('flashcards').insert({ question: form.question.trim(), answer: form.answer.trim(), color: form.color, is_private: form.is_private });
      if (!error) { cancelEdit(); await fetchCards(); }
    }
    setLoading(false);
  };

  const startEdit = (card: Card) => {
    setForm({ question: card.question, answer: card.answer, color: card.color || '#10b981', is_private: card.is_private });
    setEditingId(card.id);
    document.getElementById('manage-tab-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm({ question: '', answer: '', color: '#10b981', is_private: false });
    setEditingId(null);
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    await supabase.from('flashcards').delete().eq('id', id);
    if (currentIndex >= cards.length - 1) setCurrentIndex(Math.max(0, cards.length - 2));
    setIsFlipped(false);
    await fetchCards();
    if (editingId === id) cancelEdit();
  };

  const toggleVisibility = async (card: Card) => {
    const { error } = await supabase.from('flashcards').update({ is_private: !card.is_private }).eq('id', card.id);
    if (!error) await fetchCards();
  };

  const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  const startQuiz = () => {
    const shuffled = shuffleArray(cards);
    setShuffledQuizCards(shuffled);
    setQuizScore(0);
    setQuizIndex(0);
    generateQuizOptions(shuffled[0], shuffled);
    setQuizState('playing');
    setSelectedAnswer(null);
  };

  const generateQuizOptions = (currentCard: Card, allQuizCards: Card[]) => {
    const otherAnswers = allQuizCards.filter(c => c.id !== currentCard.id).map(c => c.answer);
    const uniqueOthers = Array.from(new Set(otherAnswers));
    const distractors = shuffleArray(uniqueOthers).slice(0, 3);
    const finalOptions = shuffleArray([currentCard.answer, ...distractors]);
    setQuizOptions(finalOptions);
  };

  const handleQuizAnswer = (selected: string) => {
    const correct = selected === shuffledQuizCards[quizIndex].answer;
    setSelectedAnswer(selected);
    setIsCorrect(correct);
    setQuizScore(prev => correct ? prev + 10 : prev - 5);
    setQuizState('feedback');
  };

  const nextQuizQuestion = () => {
    if (quizIndex < shuffledQuizCards.length - 1) {
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      generateQuizOptions(shuffledQuizCards[nextIdx], shuffledQuizCards);
      setQuizState('playing');
      setSelectedAnswer(null);
    } else {
      setQuizState('finished');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[800px] h-[95vh] sm:h-[85vh] rounded-2xl relative flex flex-col shadow-2xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-emerald-50 text-emerald-500"><BookOpen size={24} /></div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">{t('Knowledge Center', 'កាតរំលឹកមេរៀន និងល្បែងសាកល្បង')}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500"><X size={24} /></button>
        </div>
        <div className="flex border-b border-slate-200">
          <button onClick={() => { setActiveTab('review'); setIsFlipped(false); }} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'review' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500'}`}><Layers size={16} /> Review</button>
          <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500'}`}><Gamepad2 size={16} /> Quiz Mode</button>
          {isAdmin && <button onClick={() => setActiveTab('manage')} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'manage' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500'}`}><Settings size={16} /> Manage</button>}
        </div>
        <div id="manage-tab-container" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeTab === 'review' && (
            <div className="flex flex-col items-center justify-center h-full max-w-[650px] mx-auto">
              {cards.length === 0 ? (
                <div className="text-center text-slate-400 flex flex-col items-center"><BookOpen size={64} className="mb-4" /><p className="font-semibold text-lg">មិនទាន់មានកាតនៅឡើយទេ</p></div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4 h-full py-2">
                  <div className="text-xs font-bold tracking-widest uppercase text-slate-500">Card {currentIndex + 1} of {cards.length}</div>
                  <div className="relative w-full flex-1 min-h-[350px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1200px' }}>
                    <div className="w-full h-full transition-transform duration-500 rounded-2xl relative" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      <div className="absolute inset-0 rounded-2xl border flex flex-col p-5 sm:p-8 shadow-lg text-white" style={{ backfaceVisibility: 'hidden', background: cards[currentIndex].color || '#10b981' }}>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Question</span>
                          <button onClick={(e) => handleCopy(cards[currentIndex].question, 'q', e)} className="p-1.5 hover:bg-white/20 rounded-md text-white">{copiedId === 'q' ? <Check size={16} /> : <Copy size={16} />}</button>
                        </div>
                        <div className="flex-1 overflow-y-auto"><pre className="text-base font-medium whitespace-pre-wrap font-sans">{cards[currentIndex].question}</pre></div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold"><RotateCcw size={14} /> ចុចដើម្បីបង្វិល</div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl border flex flex-col p-5 sm:p-8 shadow-lg text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: cards[currentIndex].color || '#10b981' }}>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Answer</span>
                          <button onClick={(e) => handleCopy(cards[currentIndex].answer, 'a', e)} className="p-1.5 hover:bg-white/20 rounded-md text-white">{copiedId === 'a' ? <Check size={16} /> : <Copy size={16} />}</button>
                        </div>
                        <div className="flex-1 overflow-y-auto"><pre className="text-base font-medium whitespace-pre-wrap font-sans">{cards[currentIndex].answer}</pre></div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold"><RotateCcw size={14} /> ចុចដើម្បីបង្វិលត្រឡប់</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full mt-2">
                    <button onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentIndex(prev => prev - 1), 150); }} disabled={currentIndex === 0} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={20} /> Prev</button>
                    <button onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentIndex(prev => prev + 1), 150); }} disabled={currentIndex === cards.length - 1} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30">Next <ChevronRight size={20} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'quiz' && (
            <div className="flex flex-col h-full max-w-[700px] mx-auto w-full">
              {cards.length < 4 ? (
                <div className="text-center opacity-50 flex flex-col items-center justify-center h-full"><Gamepad2 size={64} className="mb-4" /><p className="font-semibold text-lg">ត្រូវការកាតយ៉ាងតិច ៤ សម្រាប់លេង</p></div>
              ) : quizState === 'idle' ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 bg-amber-50 text-amber-500"><Award size={40} /></div>
                  <h3 className="text-2xl font-bold text-slate-800">Ready to test your knowledge?</h3>
                  <button onClick={startQuiz} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg"><Gamepad2 size={20} /> Start Quiz</button>
                </div>
              ) : quizState === 'finished' ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${quizScore > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}><Award size={48} /></div>
                  <h3 className="text-3xl font-bold text-slate-800">Quiz Complete!</h3>
                  <p className="text-xl font-medium text-slate-600">Your Score: <span className={quizScore > 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>{quizScore}</span></p>
                  <button onClick={startQuiz} className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 mt-4"><RotateCcw size={18} /> Play Again</button>
                </div>
              ) : (
                <div className="flex flex-col h-full w-full">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-slate-200 text-slate-600">Q {quizIndex + 1} of {shuffledQuizCards.length}</span>
                    <span className="text-sm font-bold flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white"><Award size={16} className={quizScore >= 0 ? 'text-amber-500' : 'text-rose-500'}/> Score: {quizScore}</span>
                  </div>
                  <div className="mb-8 px-2 text-center"><h3 className="text-xl font-bold leading-relaxed text-slate-800">{shuffledQuizCards[quizIndex].question}</h3></div>
                  {quizState === 'feedback' && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center justify-between shadow-sm border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                      <div className="flex items-center gap-3 font-bold text-base">{isCorrect ? <Smile size={24} /> : <Frown size={24} />}{isCorrect ? 'Correct! +10 Points' : 'Wrong Answer! -5 Points'}</div>
                      <button onClick={nextQuizQuestion} className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>Next Question</button>
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto w-full flex flex-col gap-3 pb-6">
                    {quizOptions.map((opt, idx) => {
                      let btnClass = "bg-white border-slate-200 text-slate-700";
                      if (quizState === 'feedback') {
                        if (opt === shuffledQuizCards[quizIndex].answer) btnClass = "bg-emerald-500 border-emerald-600 text-white";
                        else if (opt === selectedAnswer) btnClass = "bg-rose-500 border-rose-600 text-white";
                      }
                      return (
                        <button key={idx} disabled={quizState === 'feedback'} onClick={() => handleQuizAnswer(opt)} className={`p-4 rounded-xl border text-left flex items-center gap-4 w-full ${btnClass}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${quizState === 'feedback' && (opt === shuffledQuizCards[quizIndex].answer || opt === selectedAnswer) ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{['A', 'B', 'C', 'D'][idx]}</div>
                          <div className="text-sm font-medium whitespace-pre-wrap">{opt}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {isAdmin && activeTab === 'manage' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-base mb-4 flex justify-between">{editingId ? <span className="text-blue-500 flex items-center gap-2"><Edit2 size={18} /> Editing</span> : 'Create New Card'}{editingId && <button onClick={cancelEdit} className="text-xs text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg">Cancel</button>}</h4>
                <div className="flex flex-col gap-4">
                  <textarea placeholder="Question..." value={form.question} onChange={e => setForm({...form, question: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-blue-500" rows={3}/>
                  <textarea placeholder="Answer..." value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-blue-500" rows={4}/>
                  <div className="flex gap-2 flex-wrap">{PRESET_COLORS.map(c => <button key={c} onClick={() => setForm({...form, color: c})} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', border: '2px solid white' }}>{form.color === c && <Check size={14} color="white" />}</button>)}</div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_private} onChange={e => setForm({...form, is_private: e.target.checked})} className="w-4 h-4"/> <span className="text-sm font-bold text-slate-700">Private (Hidden from public)</span></label>
                  <button onClick={saveCard} disabled={loading || !form.question || !form.answer} className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md">{loading ? 'Saving...' : editingId ? 'Update' : 'Add Card'}</button>
                </div>
              </div>
              <div className="pb-4">
                <h4 className="font-bold text-base mb-4 text-slate-800">Your Deck ({cards.length})</h4>
                <div className="flex flex-col gap-3">
                  {cards.map((card, i) => (
                    <div key={card.id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-sm shrink-0" style={{ background: card.color }}>{i + 1}</div>
                      <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate text-slate-800">Q: {card.question}</div><div className="text-sm truncate text-slate-500">A: {card.answer}</div></div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => toggleVisibility(card)} className={`p-2 rounded-lg ${card.is_private ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>{card.is_private ? <Lock size={16} /> : <Globe size={16} />}</button>
                        <button onClick={() => startEdit(card)} className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => deleteCard(card.id)} className="p-2 bg-rose-50 text-rose-500 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   2. QR GENERATOR MODAL COMPONENT
   ========================================= */
function QrGeneratorModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [data, setData] = useState('https://khouvchvea.com');
  const [colorType, setColorType] = useState<'single' | 'gradient'>('single');
  const [fgColor, setFgColor] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#0277bd');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [useCustomEye, setUseCustomEye] = useState(false);
  const [eyeColor, setEyeColor] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');
  const [dotsType, setDotsType] = useState('square');
  const [cornerType, setCornerType] = useState('square');
  const [resolution, setResolution] = useState(1000);
  const [activeSection, setActiveSection] = useState('content');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    if ((window as any).QRCodeStyling) { setScriptsLoaded(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js';
    s.onload = () => setScriptsLoaded(true);
    document.head.appendChild(s);
  }, [open]);

  const generateQRCode = () => {
    if (!scriptsLoaded || !qrRef.current) return;
    setIsGenerating(true);
    try {
      const QRCodeStyling = (window as any).QRCodeStyling;
      const dotsOptions: any = { type: dotsType };
      if (colorType === 'single') dotsOptions.color = fgColor;
      else dotsOptions.gradient = { type: 'linear', rotation: 0, colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: fgColor2 }] };
      const eyeOptions: any = { type: cornerType };
      const eyeDotOptions: any = { type: 'dot' };
      if (useCustomEye) { eyeOptions.color = eyeColor; eyeDotOptions.color = eyeColor; } 
      else if (colorType === 'single') { eyeOptions.color = fgColor; eyeDotOptions.color = fgColor; }

      qrRef.current.innerHTML = '';
      qrCodeInstance.current = new QRCodeStyling({
        width: resolution, height: resolution, data: data || 'https://khouvchvea.com', image: logoUrl,
        dotsOptions, backgroundOptions: { color: bgColor }, imageOptions: { margin: 15, imageSize: 0.4 }, cornersSquareOptions: eyeOptions, cornersDotOptions: eyeDotOptions
      });
      qrCodeInstance.current.append(qrRef.current);
    } catch (err) { console.error(err); } 
    finally { setTimeout(() => setIsGenerating(false), 300); }
  };

  useEffect(() => { if (scriptsLoaded && open) setTimeout(generateQRCode, 150); }, [scriptsLoaded, open]);

  const downloadQr = (ext: 'png' | 'svg') => {
    if (qrCodeInstance.current) {
      generateQRCode();
      setTimeout(() => qrCodeInstance.current.download({ name: 'custom-qr', extension: ext }), 300);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[1100px] rounded-2xl relative flex flex-col max-h-[95vh] shadow-2xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800"><QrCode size={22} className="text-blue-500" /> {t('QR Generator', 'កម្មវិធីបង្កើត QR')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500"><X size={20} /></button>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden bg-slate-50">
          <div className="w-full lg:w-[55%] flex-shrink-0 lg:flex-shrink lg:overflow-y-auto border-r border-slate-200 bg-white">
            <button onClick={() => setActiveSection('content')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 font-bold"><span className="flex items-center gap-2"><Globe size={18}/> CONTENT</span> {activeSection === 'content' ? <Minus size={16}/> : <Plus size={16}/>}</button>
            {activeSection === 'content' && <div className="p-4"><input type="text" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500"/></div>}
            
            <button onClick={() => setActiveSection('colors')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 font-bold"><span className="flex items-center gap-2"><Palette size={18}/> COLORS</span> {activeSection === 'colors' ? <Minus size={16}/> : <Plus size={16}/>}</button>
            {activeSection === 'colors' && <div className="p-4 flex flex-col gap-4">
               <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" checked={colorType === 'single'} onChange={() => setColorType('single')}/> Single</label><label className="flex items-center gap-2"><input type="radio" checked={colorType === 'gradient'} onChange={() => setColorType('gradient')}/> Gradient</label></div>
               <div className="flex gap-4"><input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-10 h-10 rounded border-none"/>{colorType === 'gradient' && <input type="color" value={fgColor2} onChange={e => setFgColor2(e.target.value)} className="w-10 h-10 rounded border-none"/>}</div>
               <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={useCustomEye} onChange={e => setUseCustomEye(e.target.checked)}/> Custom Eye Color</label>
               {useCustomEye && <input type="color" value={eyeColor} onChange={e => setEyeColor(e.target.value)} className="w-10 h-10 rounded border-none"/>}
               <p className="text-xs font-bold mt-2">Background</p><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded border-none"/>
            </div>}

            <button onClick={() => setActiveSection('logo')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 font-bold"><span className="flex items-center gap-2"><ImageIcon size={18}/> LOGO</span> {activeSection === 'logo' ? <Minus size={16}/> : <Plus size={16}/>}</button>
            {activeSection === 'logo' && <div className="p-4 flex items-center gap-4">
              <div className="w-20 h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center">{logoUrl ? <img src={logoUrl} className="max-w-full max-h-full p-1"/> : <span className="text-xs text-slate-400">None</span>}</div>
              <div className="flex flex-col gap-2"><label className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">Upload<input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload=ev=>setLogoUrl(ev.target?.result as string); r.readAsDataURL(f); } }} className="hidden"/></label>{logoUrl && <button onClick={()=>setLogoUrl('')} className="text-rose-500 text-sm font-bold">Remove</button>}</div>
            </div>}

            <button onClick={() => setActiveSection('design')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 font-bold"><span className="flex items-center gap-2"><LayoutGrid size={18}/> DESIGN</span> {activeSection === 'design' ? <Minus size={16}/> : <Plus size={16}/>}</button>
            {activeSection === 'design' && <div className="p-4">
              <p className="text-xs font-bold mb-2">Body Shape</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {['square','dots','rounded','extra-rounded','classy','classysquares'].map(t => <button key={t} onClick={()=>setDotsType(t)} className={`px-3 py-1.5 border rounded-md text-xs ${dotsType === t ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' : 'bg-white'}`}>{t}</button>)}
              </div>
              <p className="text-xs font-bold mb-2">Eye Shape</p>
              <div className="flex gap-2 flex-wrap">
                {['square','extra-rounded','dot'].map(t => <button key={t} onClick={()=>setCornerType(t)} className={`px-3 py-1.5 border rounded-md text-xs ${cornerType === t ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' : 'bg-white'}`}>{t}</button>)}
              </div>
            </div>}
          </div>
          <div className="w-full lg:w-[45%] p-6 flex flex-col items-center justify-center bg-slate-100">
            <div className="w-[280px] h-[280px] bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-4 relative flex items-center justify-center">
              <div ref={qrRef} className="w-full h-full [&>canvas]:w-full [&>canvas]:h-auto [&>svg]:w-full [&>svg]:h-auto" />
              {isGenerating && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><RefreshCw size={24} className="animate-spin text-blue-500"/></div>}
            </div>
            <div className="w-full max-w-[280px]">
               <input type="range" min="400" max="2000" step="200" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="w-full mb-6 accent-blue-500"/>
               <div className="flex gap-3 mb-3">
                 <button onClick={generateQRCode} className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm">Update QR</button>
                 <button onClick={() => downloadQr('png')} className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold text-sm">Download PNG</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   3. SPIN WHEEL MODAL COMPONENT
   ========================================= */
function SpinWheelModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [namesText, setNamesText] = useState('សិស្សទី១\nសិស្សទី២\nសិស្សទី៣\nសិស្សទី៤');
  const [names, setNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  useEffect(() => {
    const list = namesText.split('\n').map(n => n.trim()).filter(Boolean);
    setNames(list.length > 0 ? list : ['ទទេ']);
  }, [namesText]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height, centerX = w/2, centerY = h/2, radius = Math.min(w,h)/2 - 20;
    ctx.clearRect(0, 0, w, h);
    const sliceAngle = (2 * Math.PI) / names.length;
    names.forEach((name, i) => {
      const angle = i * sliceAngle;
      ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${names.length > 20 ? 18 : 24}px sans-serif`;
      ctx.fillText(name.length > 18 ? name.substring(0, 18) + '...' : name, radius - 30, 0);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#1e293b'; ctx.stroke();
  }, [names, open]);

  const spin = () => {
    if (names.length < 2 || isSpinning) return;
    setIsSpinning(true); setWinner(null);
    const winIndex = Math.floor(Math.random() * names.length);
    const sliceSize = 360 / names.length;
    const targetAngle = 270 - (winIndex * sliceSize + sliceSize / 2);
    setRotation(Math.floor(rotation / 360) * 360 + 2880 + targetAngle); // 8 spins
    setTimeout(() => { setWinner(names[winIndex]); setIsSpinning(false); }, 5000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[1000px] bg-white rounded-2xl relative flex flex-col md:flex-row max-h-[95vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-rose-500"><X size={20}/></button>
        <div className="w-full md:w-[40%] flex flex-col p-6 border-r border-slate-200 bg-slate-50">
          <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2"><Users className="text-fuchsia-500"/> Spin Wheel</h3>
          <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold uppercase">Names ({names.length})</span><button onClick={()=>setNamesText('')} className="text-xs text-rose-500 font-bold">Clear</button></div>
          <textarea value={namesText} onChange={e => setNamesText(e.target.value)} disabled={isSpinning} className="w-full flex-1 min-h-[200px] p-3 border border-slate-200 rounded-xl outline-none resize-none mb-4"/>
          <label className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold flex justify-center items-center gap-2 cursor-pointer shadow-sm hover:bg-slate-50"><Upload size={16}/> Upload .txt<input type="file" accept=".txt" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload=ev=>setNamesText(ev.target?.result as string); r.readAsText(f); } }} className="hidden"/></label>
        </div>
        <div className="w-full md:w-[60%] flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white">
          <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center mb-8">
            <div className="absolute -top-[20px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-slate-800 drop-shadow-md"/>
            <canvas ref={canvasRef} width={800} height={800} className="w-full h-full" style={{ transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0, 1)' : 'none', transform: `rotate(${rotation}deg)` }}/>
          </div>
          <button onClick={spin} disabled={isSpinning || names.length<2} className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"><Play size={20}/> {isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
          {winner && !isSpinning && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 animate-fade-up text-center">
              <Trophy size={80} className="text-amber-400 mb-4 animate-bounce"/>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">WINNER</h3>
              <p className="text-4xl font-black text-slate-800 mb-8">{winner}</p>
              <button onClick={()=>setWinner(null)} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold">Continue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   4. VAULT MODAL COMPONENT
   ========================================= */
function VaultModal({ open, onClose, notes, isAdmin }: { open: boolean; onClose: () => void; notes: any[]; isAdmin: boolean; }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (!open) return null;
  const visibleNotes = isAdmin ? notes : notes.filter(n => !n.is_private);
  const handleCopy = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[900px] h-[95vh] sm:h-[85vh] bg-white rounded-2xl relative flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Archive size={24}/></div><div><h3 className="text-xl font-extrabold text-slate-800">My Vault</h3></div></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 text-slate-400"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {visibleNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400"><Archive size={64} className="mb-4"/><p className="font-semibold text-lg">Vault is empty.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleNotes.map(note => {
                const isExpanded = expandedId === note.id;
                const fileList = note.files?.length ? note.files : (note.content_url && note.type === 'document' ? [{ name: note.file_name || 'Document', url: note.content_url }] : []);
                const linkList = note.links?.length ? note.links : (note.content_url && note.type === 'link' ? [{ name: 'Link', url: note.content_url }] : []);
                return (
                  <div key={note.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">{note.type === 'link' ? <LinkIcon size={18} className="text-blue-500"/> : <FileText size={18} className="text-emerald-500"/>} {note.title}</h4>
                      {isAdmin && (note.is_private ? <Lock size={14} className="text-rose-500"/> : <Globe size={14} className="text-emerald-500"/>)}
                    </div>
                    {note.description && <p className={`text-sm text-slate-500 mb-4 whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>{note.description}</p>}
                    <div className="mt-auto flex flex-col gap-3">
                       {fileList.length > 0 && <a href={fileList[0].url} target="_blank" className="bg-emerald-50 text-emerald-600 py-2.5 rounded-lg font-bold text-sm text-center flex justify-center items-center gap-2"><ExternalLink size={16}/> Open Document</a>}
                       {linkList.length > 0 && <a href={linkList[0].url} target="_blank" className="bg-blue-50 text-blue-600 py-2.5 rounded-lg font-bold text-sm text-center flex justify-center items-center gap-2"><ExternalLink size={16}/> Open Link</a>}
                    </div>
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

/* =========================================
   5. MAIN DASHBOARD COMPONENT (TOOLS)
   ========================================= */
export function SupportPanel({ isAdmin }: { isAdmin: boolean }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const tools = [
    { id: 'converter', title: 'File Converter Tool', description: 'Convert PDF to Image (JPG/PNG) or Image to PDF seamlessly.', icon: FileType, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { id: 'ocr', title: 'Image OCR Tool', description: 'Extract text from images automatically. Supports English and Khmer.', icon: ScanText, iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
    { id: 'flashcard', title: 'Flashcards', description: 'Digital study cards designed to help learners review and remember lessons more easily.', icon: BrainCircuit, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { id: 'wheel', title: 'Spin Wheel', description: 'Use this tool to spin the wheel and randomly select an outcome.', icon: Aperture, iconBg: 'bg-fuchsia-50', iconColor: 'text-fuchsia-500' },
    { id: 'qr', title: 'Custom QR Generator', description: 'Create beautiful QR codes with custom colors and logos.', icon: QrCode, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { id: 'vault', title: 'My Vault', description: 'Access my shared notes, important links, and documents.', icon: Archive, iconBg: 'bg-purple-50', iconColor: 'text-purple-500' }
  ];

  return (
    <div className="w-full animate-fade-in pb-20 pt-4 px-3 sm:px-4">
      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl mx-auto">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => ['converter', 'ocr'].includes(tool.id) ? alert('This feature is currently in development!') : setActiveModal(tool.id)}
              className="bg-white rounded-[24px] p-5 flex items-start gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-slate-100 shadow-sm active:scale-[0.98]"
            >
              <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 ${tool.iconBg} ${tool.iconColor}`}>
                <Icon size={26} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col pt-0.5">
                <h3 className="font-bold text-slate-800 text-[15px] sm:text-base mb-1.5">{tool.title}</h3>
                <p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed">{tool.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <FlashcardModal open={activeModal === 'flashcard'} onClose={() => setActiveModal(null)} isAdmin={isAdmin} />
      <QrGeneratorModal open={activeModal === 'qr'} onClose={() => setActiveModal(null)} />
      <SpinWheelModal open={activeModal === 'wheel'} onClose={() => setActiveModal(null)} />
      <VaultModal open={activeModal === 'vault'} onClose={() => setActiveModal(null)} notes={[]} isAdmin={isAdmin} />
    </div>
  );
}