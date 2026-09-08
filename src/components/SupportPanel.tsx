import { useState, useEffect } from 'react';
import { LifeBuoy, MessageSquare, FileText, HeadphonesIcon, Settings, ArrowLeft, Send, CheckCircle2, Clock, Trash2, Reply, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SupportPanel({ isAdmin }: { isAdmin: boolean }) {
  const [view, setView] = useState<'menu' | 'form' | 'admin'>('menu');
  const [formType, setFormType] = useState<'question' | 'report'>('question');
  const [tickets, setTickets] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', contact: '', description: '' });
  const [saving, setSaving] = useState(false);
  
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchTickets();
    const sub = supabase.channel('support-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
        if (payload.new && (payload.new as any).type === 'support_tickets') {
          setTickets((payload.new as any).data_json || []);
        }
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  async function fetchTickets() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'support_tickets').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setTickets(data.data_json);
    }
  }

  const openForm = (type: 'question' | 'report') => {
    setFormType(type);
    setFormData({ name: '', contact: '', description: '' });
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitTicket = async () => {
    if (!formData.name.trim() || !formData.description.trim()) return;
    setSaving(true);

    const newTicket = {
      id: Date.now().toString(),
      type: formType,
      name: formData.name.trim(),
      contact: formData.contact.trim(),
      description: formData.description.trim(),
      status: 'pending',
      reply: '',
      created_at: new Date().toISOString()
    };

    const updatedTickets = [newTicket, ...tickets];

    const { data } = await supabase.from('schedules').select('id').eq('type', 'support_tickets').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updatedTickets }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'support_tickets', data_json: updatedTickets });
    }

    setTickets(updatedTickets);
    setSaving(false);
    setView('menu');
    alert('សំណើរបស់អ្នកត្រូវបានបញ្ជូនដោយជោគជ័យ! យើងនឹងឆ្លើយតបក្នុងពេលឆាប់ៗនេះ។');
  };

  const submitReply = async (id: string, isResolved: boolean) => {
    setSaving(true);
    const updatedTickets = tickets.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          reply: replyText.trim() || t.reply, 
          status: isResolved ? 'resolved' : t.status,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    const { data } = await supabase.from('schedules').select('id').eq('type', 'support_tickets').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updatedTickets }).eq('id', data.id);
    }
    
    setTickets(updatedTickets);
    setReplyingId(null);
    setReplyText('');
    setSaving(false);
  };

  const deleteTicket = async (id: string) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបសំណើនេះមែនទេ?")) return;
    const updatedTickets = tickets.filter(t => t.id !== id);
    const { data } = await supabase.from('schedules').select('id').eq('type', 'support_tickets').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updatedTickets }).eq('id', data.id);
    }
    setTickets(updatedTickets);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full animate-fade-in pb-20 relative">
      
      {view === 'menu' && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
              <LifeBuoy size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">សេវាកម្មគាំទ្រសិស្ស (Student Support)</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">ជ្រើសរើសផ្នែកខាងក្រោម ដើម្បីសុំជំនួយ ឬរាយការណ៍បញ្ហាផ្សេងៗនៅក្នុងសាលា</p>
          </div>

          {isAdmin && (
            <div className="mb-6 flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
               <h3 className="font-bold text-blue-800 flex items-center gap-2">
                 ផ្ទាំងគ្រប់គ្រង (Admin Dashboard)
                 {tickets.filter(t => t.status === 'pending').length > 0 && (
                   <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                     {tickets.filter(t => t.status === 'pending').length} ថ្មី
                   </span>
                 )}
               </h3>
               <button onClick={() => setView('admin')} className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition active:scale-95">
                 <Settings size={16}/> គ្រប់គ្រងសំណើ
               </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="border border-slate-200 p-5 rounded-2xl bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex gap-4 group active:scale-[0.98]" onClick={() => openForm('question')}>
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl h-fit group-hover:bg-blue-600 group-hover:text-white transition-colors"><MessageSquare size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-1.5">សួរមេរៀន / ប្រឹក្សាយោបល់</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-3">ទំនាក់ទំនងផ្ទាល់ជាមួយគ្រូ ឬអ្នកប្រឹក្សា ដើម្បីសួរមេរៀនដែលមិនយល់។</p>
                <button className="text-blue-600 font-bold text-sm hover:underline">ទាក់ទងឥឡូវនេះ &rarr;</button>
              </div>
            </div>

            <div className="border border-slate-200 p-5 rounded-2xl bg-white hover:border-rose-400 hover:shadow-md transition-all cursor-pointer flex gap-4 group active:scale-[0.98]" onClick={() => openForm('report')}>
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl h-fit group-hover:bg-rose-600 group-hover:text-white transition-colors"><FileText size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-1.5">រាយការណ៍បញ្ហា (Report Issue)</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-3">រាយការណ៍ពីបញ្ហាបច្ចេកទេស បាត់កាត ឬបញ្ហាផ្សេងៗក្នុងថ្នាក់រៀន។</p>
                <button className="text-rose-600 font-bold text-sm hover:underline">បំពេញទម្រង់ &rarr;</button>
              </div>
            </div>

            <div className="border border-slate-200 p-5 rounded-2xl bg-white hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex gap-4 md:col-span-2 group">
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl h-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors"><HeadphonesIcon size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-1.5">ជំនួយបច្ចេកទេស (IT Support)</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-3">មានបញ្ហាក្នុងការ Login ប្រើប្រាស់ប្រព័ន្ធនេះ ឬភ្លេច Password? ទាក់ទងផ្នែក IT របស់យើង។</p>
                <div className="flex flex-wrap gap-2">
                   <span className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">Telegram: @IT_Support</span>
                   <span className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">Tel: 012 345 678</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 max-w-2xl mx-auto animate-fade-in relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1.5 ${formType === 'question' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
          
          <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
          </button>

          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className={`p-3 rounded-xl text-white shadow-sm ${formType === 'question' ? 'bg-blue-500' : 'bg-rose-500'}`}>
              {formType === 'question' ? <MessageSquare size={24} /> : <FileText size={24} />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                {formType === 'question' ? 'សួរមេរៀន / ប្រឹក្សាយោបល់' : 'រាយការណ៍បញ្ហា'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">សូមបំពេញព័ត៌មានខាងក្រោម ដើម្បីឱ្យយើងអាចជួយអ្នកបានលឿន</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="block w-full">
              <span className="text-[13px] font-bold text-slate-700 mb-1.5 block">ឈ្មោះសិស្ស / អត្តលេខ <span className="text-danger">*</span></span>
              <input 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" 
                placeholder="ឧ. ក ខ ឬ ID: 001" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </label>
            <label className="block w-full">
              <span className="text-[13px] font-bold text-slate-700 mb-1.5 block">លេខទូរស័ព្ទ / Telegram សម្រាប់ទាក់ទងមកវិញ</span>
              <input 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" 
                placeholder="012 345 678..." 
                value={formData.contact} 
                onChange={e => setFormData({...formData, contact: e.target.value})} 
              />
            </label>
            <label className="block w-full mb-2">
              <span className="text-[13px] font-bold text-slate-700 mb-1.5 block">ការរៀបរាប់លម្អិតពីបញ្ហា ឬសំណួរ <span className="text-danger">*</span></span>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[150px] resize-none text-sm leading-relaxed outline-none focus:border-primary transition-colors" 
                placeholder="សរសេររៀបរាប់ទីនេះ..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </label>

            <button 
              className={`w-full text-white py-3.5 rounded-xl shadow-md text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] ${formType === 'question' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'}`} 
              disabled={saving || !formData.name.trim() || !formData.description.trim()} 
              onClick={submitTicket}
            >
              <Send size={18} /> {saving ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនសំណើ'}
            </button>
          </div>
        </div>
      )}

      {view === 'admin' && isAdmin && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors">
              <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800"><Settings size={20} className="text-primary"/> គ្រប់គ្រងសំណើសិស្ស</h2>
          </div>

          <div className="flex flex-col gap-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${ticket.status === 'resolved' ? 'bg-emerald-500' : 'bg-warning'}`}></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ticket.type === 'question' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                      {ticket.type === 'question' ? 'សួរមេរៀន' : 'បញ្ហា'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {formatDate(ticket.created_at)}</span>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                    {ticket.status === 'resolved' ? <><CheckCircle2 size={12}/> បានដោះស្រាយ</> : <><Clock size={12}/> កំពុងរង់ចាំ</>}
                  </span>
                </div>

                <div className="mb-4 pl-1">
                  <h3 className="font-bold text-slate-800 text-base mb-1">{ticket.name}</h3>
                  {ticket.contact && <p className="text-xs font-bold text-slate-500 mb-2">ទំនាក់ទំនង៖ <span className="text-primary">{ticket.contact}</span></p>}
                  <div className="text-[13px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {ticket.reply && (
                  <div className="mb-4 ml-6 pl-4 border-l-2 border-primary/30">
                    <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5"><Reply size={14}/> ការឆ្លើយតបពី Admin៖</p>
                    <div className="text-[13px] text-slate-700 bg-blue-50/50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {ticket.reply}
                    </div>
                  </div>
                )}

                {replyingId === ticket.id ? (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl resize-none text-sm outline-none focus:border-primary mb-3" 
                      placeholder="សរសេរការឆ្លើយតបទីនេះ..." 
                      rows={3}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-colors active:scale-95" disabled={saving} onClick={() => submitReply(ticket.id, true)}>ឆ្លើយតប & បិទសំណើ</button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-colors active:scale-95" disabled={saving} onClick={() => submitReply(ticket.id, false)}>ត្រឹមតែឆ្លើយតប</button>
                      <button className="px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 py-2 rounded-lg text-xs font-bold transition-colors" onClick={() => { setReplyingId(null); setReplyText(''); }}>បោះបង់</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => { setReplyingId(ticket.id); setReplyText(ticket.reply || ''); }} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                      <Reply size={14}/> ឆ្លើយតប
                    </button>
                    {ticket.status !== 'resolved' && (
                      <button onClick={() => { setReplyText(ticket.reply || ''); submitReply(ticket.id, true); }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                        <CheckCircle2 size={14}/> ដោះស្រាយរួច
                      </button>
                    )}
                    <button onClick={() => deleteTicket(ticket.id)} className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {tickets.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">មិនមានសំណើទេ</h3>
                <p className="text-sm text-slate-500 mt-1">រាល់សំណើរបស់សិស្សនឹងបង្ហាញនៅទីនេះ</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}