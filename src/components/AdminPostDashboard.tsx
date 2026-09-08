import { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, CheckCircle2, Pencil, Image as ImageIcon, X, Eye, Heart, BookMarked, Save, Link as LinkIcon, DownloadCloud, Archive, BrainCircuit, Lock, Globe, Check, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminPostDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState<{ id: string, title: string, description: string, image_urls: string[] }>({ id: '', title: '', description: '', image_urls: [] });
  const [saving, setSaving] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const [banners, setBanners] = useState<string[]>([]);
  const [tempBanner, setTempBanner] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  const [libItems, setLibItems] = useState<any[]>([]);
  const [libForm, setLibForm] = useState({ id: '', title: '', description: '', cover_url: '', file_url: '' });
  const [savingLib, setSavingLib] = useState(false);

  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [vaultForm, setVaultForm] = useState({ id: '', title: '', content: '', type: 'document', is_private: false });
  const [savingVault, setSavingVault] = useState(false);

  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardForm, setFlashcardForm] = useState({ id: '', question: '', answer: '', color: '#3b82f6', is_private: false });
  const [savingFlashcard, setSavingFlashcard] = useState(false);
  const PRESET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#06b6d4', '#0ea5e9'];

  useEffect(() => {
    fetchPosts();
    fetchBanners();
    fetchLibItems();
    fetchVaultItems();
    fetchFlashcards();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  async function fetchBanners() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'home_banners').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setBanners(data.data_json);
    }
  }

  async function fetchLibItems() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'library_items').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setLibItems(data.data_json);
    }
  }

  async function fetchVaultItems() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'vault_items').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setVaultItems(data.data_json);
    }
  }

  async function fetchFlashcards() {
    const { data } = await supabase.from('flashcards').select('*').order('created_at', { ascending: false });
    if (data) setFlashcards(data);
  }

  async function savePost() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { title: form.title, description: form.description, image_urls: form.image_urls };
    
    if (form.id) {
      await supabase.from('posts').update(payload).eq('id', form.id);
    } else {
      await supabase.from('posts').insert([payload]);
    }
    
    setForm({ id: '', title: '', description: '', image_urls: [] });
    setSaving(false);
    fetchPosts();
  }

  function editPost(post: any) {
    setForm({ id: post.id, title: post.title, description: post.description || '', image_urls: post.image_urls || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deletePost(id: string) {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?")) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts();
  }

  function addImageUrl() {
    if (tempUrl.trim() && !form.image_urls.includes(tempUrl.trim())) {
      setForm({ ...form, image_urls: [...form.image_urls, tempUrl.trim()] });
      setTempUrl('');
    }
  }

  function removeImage(index: number) {
    const newUrls = [...form.image_urls];
    newUrls.splice(index, 1);
    setForm({ ...form, image_urls: newUrls });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm(prev => ({ ...prev, image_urls: [...prev.image_urls, result] }));
      };
      reader.readAsDataURL(file);
    });
  }

  async function saveBannersToDb(updatedBanners: string[]) {
    setSavingBanner(true);
    const { data } = await supabase.from('schedules').select('id').eq('type', 'home_banners').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updatedBanners }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'home_banners', data_json: updatedBanners });
    }
    setBanners(updatedBanners);
    setSavingBanner(false);
  }

  function addBanner() {
    if (tempBanner.trim() && !banners.includes(tempBanner.trim())) {
      const newBanners = [...banners, tempBanner.trim()];
      saveBannersToDb(newBanners);
      setTempBanner('');
    }
  }

  function removeBanner(index: number) {
    const newBanners = [...banners];
    newBanners.splice(index, 1);
    saveBannersToDb(newBanners);
  }

  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      saveBannersToDb([...banners, result]);
    };
    reader.readAsDataURL(file);
  }

  async function saveLibItem() {
    if (!libForm.title.trim() || !libForm.file_url.trim()) return;
    setSavingLib(true);
    let updated = [...libItems];
    
    if (libForm.id) {
      updated = updated.map(item => item.id === libForm.id ? { ...item, title: libForm.title, description: libForm.description, cover_url: libForm.cover_url, file_url: libForm.file_url, updated_at: new Date().toISOString() } : item);
    } else {
      updated.unshift({ ...libForm, id: Date.now().toString(), created_at: new Date().toISOString(), views: 0, downloads: 0 });
    }
    
    const { data } = await supabase.from('schedules').select('id').eq('type', 'library_items').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updated }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'library_items', data_json: updated });
    }
    
    setLibItems(updated);
    setLibForm({ id: '', title: '', description: '', cover_url: '', file_url: '' });
    setSavingLib(false);
  }

  function editLibItem(item: any) {
    setLibForm({ id: item.id, title: item.title, description: item.description || '', cover_url: item.cover_url || '', file_url: item.file_url || '' });
  }

  async function deleteLibItem(id: string) {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?")) return;
    const updated = libItems.filter(item => item.id !== id);
    const { data } = await supabase.from('schedules').select('id').eq('type', 'library_items').maybeSingle();
    if (data?.id) await supabase.from('schedules').update({ data_json: updated }).eq('id', data.id);
    setLibItems(updated);
  }

  async function saveVaultItem() {
    if (!vaultForm.title.trim() || !vaultForm.content.trim()) return;
    setSavingVault(true);
    let updated = [...vaultItems];
    if (vaultForm.id) {
      updated = updated.map(item => item.id === vaultForm.id ? { ...item, ...vaultForm, updated_at: new Date().toISOString() } : item);
    } else {
      updated.unshift({ ...vaultForm, id: Date.now().toString(), created_at: new Date().toISOString() });
    }
    const { data } = await supabase.from('schedules').select('id').eq('type', 'vault_items').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updated }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'vault_items', data_json: updated });
    }
    setVaultItems(updated);
    setVaultForm({ id: '', title: '', content: '', type: 'document', is_private: false });
    setSavingVault(false);
  }

  function editVaultItem(item: any) {
    setVaultForm({ id: item.id, title: item.title, content: item.content || '', type: item.type || 'document', is_private: item.is_private || false });
  }

  async function deleteVaultItem(id: string) {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?")) return;
    const updated = vaultItems.filter(item => item.id !== id);
    const { data } = await supabase.from('schedules').select('id').eq('type', 'vault_items').maybeSingle();
    if (data?.id) await supabase.from('schedules').update({ data_json: updated }).eq('id', data.id);
    setVaultItems(updated);
  }

  async function saveFlashcard() {
    if (!flashcardForm.question.trim() || !flashcardForm.answer.trim()) return;
    setSavingFlashcard(true);
    if (flashcardForm.id) {
      await supabase.from('flashcards').update({ question: flashcardForm.question, answer: flashcardForm.answer, color: flashcardForm.color, is_private: flashcardForm.is_private }).eq('id', flashcardForm.id);
    } else {
      await supabase.from('flashcards').insert([{ question: flashcardForm.question, answer: flashcardForm.answer, color: flashcardForm.color, is_private: flashcardForm.is_private }]);
    }
    setFlashcardForm({ id: '', question: '', answer: '', color: '#3b82f6', is_private: false });
    setSavingFlashcard(false);
    fetchFlashcards();
  }

  function editFlashcard(item: any) {
    setFlashcardForm({ id: item.id, question: item.question, answer: item.answer, color: item.color || '#3b82f6', is_private: item.is_private || false });
  }

  async function deleteFlashcard(id: string) {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?")) return;
    await supabase.from('flashcards').delete().eq('id', id);
    fetchFlashcards();
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto px-1 sm:px-0">
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <h2 className="mb-5 text-[15px] sm:text-lg font-bold flex items-center gap-2 text-primary"><ImageIcon size={18} /> កំណត់រូបភាព Banner ក្បាលលើ</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full mb-5">
           <input className="flex-1 w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="ដាក់ Link រូបភាពទីនេះ..." value={tempBanner} onChange={e => setTempBanner(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') addBanner()}} />
           <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-xl transition-colors" onClick={addBanner}>Add Link</button>
              <label className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-primary text-white font-bold text-sm rounded-xl cursor-pointer transition-colors hover:bg-blue-700 ${savingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                {savingBanner ? 'Saving...' : <><Upload size={16} className="mr-1.5" /> Upload</>}
                <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={savingBanner} />
              </label>
           </div>
        </div>
        
        {banners.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {banners.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video">
                <img src={url} className="w-full h-full object-cover" alt={`banner-${i}`} />
                <button className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm" onClick={() => removeBanner(i)}>
                   <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-6 text-[13px] bg-slate-50 rounded-xl border border-dashed border-slate-200">មិនទាន់មាន Banner ទេ</div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-[15px] sm:text-lg font-bold flex items-center gap-2 text-primary"><Plus size={18} /> {form.id ? 'កែប្រែព័ត៌មាន (Edit)' : 'បង្កើតព័ត៌មានថ្មី (New Post)'}</h2>
          {form.id && <button className="text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 p-1.5 rounded-full transition-colors" onClick={() => setForm({ id: '', title: '', description: '', image_urls: [] })}><X size={16}/></button>}
        </div>
        
        <div className="flex flex-col gap-5 w-full">
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">ចំណងជើង (Title)</span>
            <input className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="សរសេរចំណងជើង..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </label>
          
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">ខ្លឹមសារ (Description)</span>
            <textarea className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[120px] resize-none text-sm leading-relaxed outline-none focus:border-primary transition-colors" placeholder="សរសេរខ្លឹមសារលម្អិតទីនេះ..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
          </label>
          
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">រូបភាព (Images) - ដាក់បានច្រើនសន្លឹក</span>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
               <input className="flex-1 w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="Paste Link រូបភាពទីនេះ..." value={tempUrl} onChange={e => setTempUrl(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') addImageUrl()}} />
               <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-xl transition-colors" onClick={addImageUrl}>Add Link</button>
                  <label className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-primary text-white font-bold text-sm rounded-xl cursor-pointer transition-colors hover:bg-blue-700">
                    <Upload size={16} className="mr-1.5" /> Upload
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                  </label>
               </div>
            </div>
            
            {form.image_urls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-[300px] overflow-y-auto w-full">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-square">
                    <img src={url} className="w-full h-full object-cover" alt={`preview-${i}`} />
                    <button className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm" onClick={() => removeImage(i)}>
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] p-1.5 pt-4 text-center font-bold">{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </label>
          
          <button className="w-full bg-[#1dd1a1] hover:bg-[#10ac84] text-white py-3.5 rounded-xl shadow-md shadow-[#1dd1a1]/30 text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] mt-2" disabled={saving || !form.title.trim()} onClick={savePost}>
            {saving ? 'កំពុងរក្សាទុក...' : <><CheckCircle2 size={18} /> {form.id ? 'រក្សាទុកការកែប្រែ' : 'បង្ហោះចូលផ្ទាំង Home'}</>}
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <h2 className="mb-5 text-[15px] sm:text-lg font-bold text-slate-800">ព័ត៌មានដែលបានបង្ហោះរួច</h2>
        <div className="flex flex-col gap-3 w-full">
          {posts.map(post => (
            <div key={post.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/40 transition-colors w-full box-border">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {post.image_urls?.[0] ? (
                  <img src={post.image_urls[0]} alt="thumb" className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 text-slate-400 shadow-sm"><ImageIcon size={20}/></div>
                )}
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-[13px] sm:text-sm text-slate-800 truncate mb-1">{post.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className="truncate">{new Date(post.created_at).toLocaleDateString('en-GB')}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                    <span className="flex items-center gap-1 text-blue-500 shrink-0"><Eye size={12}/> {post.views}</span>
                    <span className="flex items-center gap-1 text-rose-500 shrink-0"><Heart size={12}/> {post.likes}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="p-2.5 text-blue-600 bg-blue-100/50 hover:bg-blue-100 rounded-lg active:scale-95 transition-transform" onClick={() => editPost(post)}><Pencil size={14}/></button>
                <button className="p-2.5 text-rose-600 bg-rose-100/50 hover:bg-rose-100 rounded-lg active:scale-95 transition-transform" onClick={() => deletePost(post.id)}><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center text-slate-400 py-6 text-[13px] bg-slate-50 rounded-xl border border-dashed border-slate-200">មិនទាន់មានព័ត៌មាននៅឡើយទេ</p>}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-[15px] sm:text-lg font-bold flex items-center gap-2 text-primary"><BookMarked size={18} /> {libForm.id ? 'កែប្រែឯកសារបណ្ណាល័យ' : 'បង្ហោះឯកសារបណ្ណាល័យថ្មី'}</h2>
          {libForm.id && <button className="text-slate-400 hover:text-danger bg-slate-100 hover:bg-red-50 p-1.5 rounded-full transition-colors" onClick={() => setLibForm({ id: '', title: '', description: '', cover_url: '', file_url: '' })}><X size={16}/></button>}
        </div>
        
        <div className="flex flex-col gap-5 w-full">
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">ចំណងជើងសៀវភៅ / ឯកសារ</span>
            <input className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="..." value={libForm.title} onChange={e => setLibForm({...libForm, title: e.target.value})} />
          </label>
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><LinkIcon size={14}/> តំណភ្ជាប់ឯកសារ (PDF/Drive)</span>
            <input className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="https://..." value={libForm.file_url} onChange={e => setLibForm({...libForm, file_url: e.target.value})} />
          </label>
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ImageIcon size={14}/> តំណភ្ជាប់រូបគម្រប</span>
            <input className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="https://..." value={libForm.cover_url} onChange={e => setLibForm({...libForm, cover_url: e.target.value})} />
          </label>
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">ការពណ៌នាអត្ថន័យសង្ខេប</span>
            <textarea className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[120px] resize-none text-sm leading-relaxed outline-none focus:border-primary transition-colors" placeholder="..." value={libForm.description} onChange={e => setLibForm({...libForm, description: e.target.value})}></textarea>
          </label>
          
          <button className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white py-3.5 rounded-xl shadow-md text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] mt-2" disabled={savingLib || !libForm.title.trim() || !libForm.file_url.trim()} onClick={saveLibItem}>
            <Save size={18} /> រក្សាទុកឯកសារ
          </button>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
           <h3 className="font-bold text-slate-800 mb-4">បញ្ជីឯកសារបណ្ណាល័យ</h3>
           <div className="flex flex-col gap-3">
             {libItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/40 transition-colors">
                   <div className="flex items-center gap-3 overflow-hidden flex-1">
                     {item.cover_url ? <img src={item.cover_url} className="w-12 h-12 object-cover rounded-lg shadow-sm border border-slate-200" alt="cover"/> : <div className="w-12 h-12 bg-slate-200 flex items-center justify-center rounded-lg shadow-sm"><BookMarked size={18} className="text-slate-400"/></div>}
                     <div className="flex flex-col min-w-0 pr-2">
                       <span className="font-bold text-[13px] sm:text-sm text-slate-700 truncate mb-1">{item.title}</span>
                       <span className="text-[10px] font-bold text-slate-500 flex gap-3">
                          <span className="flex items-center gap-1 text-blue-500"><Eye size={12}/> {item.views || 0}</span> 
                          <span className="flex items-center gap-1 text-emerald-500"><DownloadCloud size={12}/> {item.downloads || 0}</span>
                       </span>
                     </div>
                   </div>
                   <div className="flex gap-2 shrink-0">
                      <button className="p-2.5 text-blue-600 bg-blue-100/50 hover:bg-blue-100 rounded-lg active:scale-95 transition-transform" onClick={() => editLibItem(item)}><Pencil size={14}/></button>
                      <button className="p-2.5 text-rose-600 bg-rose-100/50 hover:bg-rose-100 rounded-lg active:scale-95 transition-transform" onClick={() => deleteLibItem(item.id)}><Trash2 size={14}/></button>
                   </div>
                </div>
             ))}
             {libItems.length === 0 && <p className="text-center text-slate-400 py-6 text-[13px] bg-slate-50 rounded-xl border border-dashed border-slate-200">មិនទាន់មានឯកសារទេ</p>}
           </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-[15px] sm:text-lg font-bold flex items-center gap-2 text-purple-600"><Archive size={18} /> {vaultForm.id ? 'Edit Vault Item' : 'Add Vault Item'}</h2>
          {vaultForm.id && <button className="text-slate-400 hover:text-danger bg-slate-100 hover:bg-red-50 p-1.5 rounded-full transition-colors" onClick={() => setVaultForm({ id: '', title: '', content: '', type: 'document', is_private: false })}><X size={16}/></button>}
        </div>
        
        <div className="flex flex-col gap-5 w-full">
          <div className="flex gap-3 w-full">
            <label className="block flex-1">
              <span className="text-[13px] font-bold text-slate-700 mb-2 block">Title</span>
              <input className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors" placeholder="Title..." value={vaultForm.title} onChange={e => setVaultForm({...vaultForm, title: e.target.value})} />
            </label>
            <label className="block w-1/3">
              <span className="text-[13px] font-bold text-slate-700 mb-2 block">Type</span>
              <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors font-bold" value={vaultForm.type} onChange={e => setVaultForm({...vaultForm, type: e.target.value})}>
                <option value="document">Document</option>
                <option value="password">Password</option>
                <option value="link">Link</option>
              </select>
            </label>
          </div>
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">Content / Link / Details</span>
            <textarea className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[100px] resize-none text-sm leading-relaxed outline-none focus:border-purple-500 transition-colors" placeholder="Content..." value={vaultForm.content} onChange={e => setVaultForm({...vaultForm, content: e.target.value})}></textarea>
          </label>
          <label className="flex items-center gap-2 font-bold text-sm cursor-pointer w-fit">
            <input type="checkbox" checked={vaultForm.is_private} onChange={e => setVaultForm({...vaultForm, is_private: e.target.checked})} className="w-4 h-4 accent-purple-600" />
            Private (Hidden from public)
          </label>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl shadow-md text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] mt-2" disabled={savingVault || !vaultForm.title.trim() || !vaultForm.content.trim()} onClick={saveVaultItem}>
            <Save size={18} /> Save Vault Item
          </button>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-800 mb-4">Vault Items</h3>
          <div className="flex flex-col gap-3">
            {vaultItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 flex items-center justify-center rounded-lg shadow-sm shrink-0">
                    {item.type === 'link' ? <LinkIcon size={16}/> : item.type === 'password' ? <Lock size={16}/> : <File size={16}/>}
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-bold text-[13px] sm:text-sm text-slate-700 truncate">{item.title}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">{item.type} {item.is_private ? <Lock size={10} className="text-rose-500"/> : <Globe size={10} className="text-emerald-500"/>}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="p-2.5 text-blue-600 bg-blue-100/50 hover:bg-blue-100 rounded-lg active:scale-95 transition-transform" onClick={() => editVaultItem(item)}><Pencil size={14}/></button>
                  <button className="p-2.5 text-rose-600 bg-rose-100/50 hover:bg-rose-100 rounded-lg active:scale-95 transition-transform" onClick={() => deleteVaultItem(item.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {vaultItems.length === 0 && <p className="text-center text-slate-400 py-6 text-[13px]">No items</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border mb-[80px]">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-[15px] sm:text-lg font-bold flex items-center gap-2 text-indigo-600"><BrainCircuit size={18} /> {flashcardForm.id ? 'Edit Flashcard' : 'Add Flashcard'}</h2>
          {flashcardForm.id && <button className="text-slate-400 hover:text-danger bg-slate-100 hover:bg-red-50 p-1.5 rounded-full transition-colors" onClick={() => setFlashcardForm({ id: '', question: '', answer: '', color: '#3b82f6', is_private: false })}><X size={16}/></button>}
        </div>
        
        <div className="flex flex-col gap-5 w-full">
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">Question</span>
            <textarea className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[80px] resize-none text-sm leading-relaxed outline-none focus:border-indigo-500 transition-colors" placeholder="Question..." value={flashcardForm.question} onChange={e => setFlashcardForm({...flashcardForm, question: e.target.value})}></textarea>
          </label>
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">Answer</span>
            <textarea className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[80px] resize-none text-sm leading-relaxed outline-none focus:border-indigo-500 transition-colors" placeholder="Answer..." value={flashcardForm.answer} onChange={e => setFlashcardForm({...flashcardForm, answer: e.target.value})}></textarea>
          </label>
          <div>
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">Color</span>
            <div className="flex gap-2 flex-wrap mb-2">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setFlashcardForm({...flashcardForm, color: c})} className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white" style={{ background: c, outline: flashcardForm.color === c ? `2px solid ${c}` : 'none' }}>
                  {flashcardForm.color === c && <Check size={14} color="white"/>}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 font-bold text-sm cursor-pointer w-fit">
            <input type="checkbox" checked={flashcardForm.is_private} onChange={e => setFlashcardForm({...flashcardForm, is_private: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
            Private (Hidden from public)
          </label>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl shadow-md text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] mt-2" disabled={savingFlashcard || !flashcardForm.question.trim() || !flashcardForm.answer.trim()} onClick={saveFlashcard}>
            <Save size={18} /> Save Flashcard
          </button>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-800 mb-4">Flashcards Deck</h3>
          <div className="flex flex-col gap-3">
            {flashcards.map(card => (
              <div key={card.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-start gap-3 overflow-hidden flex-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: card.color }}>
                    <BrainCircuit size={16}/>
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-bold text-[13px] sm:text-sm text-slate-700 truncate">Q: {card.question}</span>
                    <span className="text-[12px] text-slate-500 truncate mt-0.5">A: {card.answer}</span>
                    <span className="text-[10px] mt-1">{card.is_private ? <span className="text-rose-500 flex items-center gap-1"><Lock size={10}/> Private</span> : <span className="text-emerald-500 flex items-center gap-1"><Globe size={10}/> Public</span>}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 self-center">
                  <button className="p-2.5 text-blue-600 bg-blue-100/50 hover:bg-blue-100 rounded-lg active:scale-95 transition-transform" onClick={() => editFlashcard(card)}><Pencil size={14}/></button>
                  <button className="p-2.5 text-rose-600 bg-rose-100/50 hover:bg-rose-100 rounded-lg active:scale-95 transition-transform" onClick={() => deleteFlashcard(card.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {flashcards.length === 0 && <p className="text-center text-slate-400 py-6 text-[13px]">No flashcards</p>}
          </div>
        </div>
      </div>
      
    </div>
  );
}